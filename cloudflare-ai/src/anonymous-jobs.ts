type EnvLike = {
  IRRIGATION_DB?: any;
};

const headers = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "content-type,authorization,x-job-token",
  "access-control-allow-methods": "GET,POST,PUT,OPTIONS"
};

function reply(data: unknown, status = 200) {
  return new Response(JSON.stringify(data, null, 2), { status, headers });
}

function randomId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

function base64url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function createAccessToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return `ijob_${base64url(bytes)}`;
}

async function sha256(text: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, "0")).join("");
}

function suppliedToken(request: Request) {
  const bearer = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
  return bearer || request.headers.get("x-job-token")?.trim() || null;
}

async function jsonBody(request: Request) {
  return request.json<any>().catch(() => null);
}

async function readJob(db: any, jobId: string) {
  return db.prepare(
    "SELECT job_id, access_token_hash, title, maturity, state_version, created_at, updated_at, last_opened_at, deleted_at FROM irrigation_jobs WHERE job_id = ? LIMIT 1"
  ).bind(jobId).first();
}

async function authorizeJob(request: Request, db: any, jobId: string) {
  const job = await readJob(db, jobId);
  if (!job || job.deleted_at) return { ok: false, response: reply({ error: "job_not_found" }, 404) };
  const token = suppliedToken(request);
  if (!token) return { ok: false, response: reply({ error: "job_token_required" }, 401) };
  const hash = await sha256(token);
  if (hash !== job.access_token_hash) return { ok: false, response: reply({ error: "job_token_invalid" }, 403) };
  return { ok: true, job };
}

async function createJob(request: Request, db: any) {
  const body = await jsonBody(request) || {};
  const now = new Date().toISOString();
  const jobId = randomId("job");
  const accessToken = createAccessToken();
  const accessHash = await sha256(accessToken);
  const title = typeof body.title === "string" ? body.title.slice(0, 160) : null;
  const maturity = typeof body.maturity === "string" ? body.maturity : "preliminary";

  await db.prepare(
    "INSERT INTO irrigation_jobs (job_id, access_token_hash, title, maturity, state_version, created_at, updated_at, last_opened_at) VALUES (?, ?, ?, ?, 0, ?, ?, ?)"
  ).bind(jobId, accessHash, title, maturity, now, now, now).run();

  if (body.state && typeof body.state === "object") {
    const stateJson = JSON.stringify(body.state);
    const stateHash = await sha256(stateJson);
    await db.prepare(
      "INSERT INTO irrigation_job_snapshots (job_id, version, state_json, state_hash, created_at) VALUES (?, 0, ?, ?, ?)"
    ).bind(jobId, stateJson, stateHash, now).run();
  }

  return reply({
    job_id: jobId,
    access_token: accessToken,
    state_version: 0,
    maturity,
    rule: "The access token is returned only to the job holder. The database stores only its SHA-256 hash. No user account is created."
  }, 201);
}

async function getJob(request: Request, db: any, jobId: string) {
  const auth: any = await authorizeJob(request, db, jobId);
  if (!auth.ok) return auth.response;
  const job = auth.job;
  const snapshot = await db.prepare(
    "SELECT version, state_json, state_hash, created_at FROM irrigation_job_snapshots WHERE job_id = ? ORDER BY version DESC LIMIT 1"
  ).bind(jobId).first();
  const learning = await db.prepare(
    "SELECT evidence_id, scope, kind, subject_ids_json, proposal_id, observed_at, source_json, state, summary, facts_json, interpretations_json, confidence, may_generalize, generalization_conditions_json FROM irrigation_learning_evidence WHERE job_id = ? ORDER BY observed_at DESC LIMIT 50"
  ).bind(jobId).all();
  await db.prepare("UPDATE irrigation_jobs SET last_opened_at = ? WHERE job_id = ?").bind(new Date().toISOString(), jobId).run();

  return reply({
    job: {
      job_id: job.job_id,
      title: job.title,
      maturity: job.maturity,
      state_version: job.state_version,
      created_at: job.created_at,
      updated_at: job.updated_at
    },
    state: snapshot?.state_json ? JSON.parse(snapshot.state_json) : null,
    state_hash: snapshot?.state_hash ?? null,
    learning_evidence: (learning?.results || []).map((row: any) => ({
      evidence_id: row.evidence_id,
      job_id: jobId,
      scope: row.scope,
      kind: row.kind,
      subject_ids: JSON.parse(row.subject_ids_json || "[]"),
      proposal_id: row.proposal_id,
      observed_at: row.observed_at,
      source: JSON.parse(row.source_json || "{}"),
      state: row.state,
      summary: row.summary,
      facts: JSON.parse(row.facts_json || "[]"),
      interpretations: JSON.parse(row.interpretations_json || "[]"),
      confidence: row.confidence,
      may_generalize: Boolean(row.may_generalize),
      generalization_conditions: JSON.parse(row.generalization_conditions_json || "[]")
    })).reverse()
  });
}

async function saveState(request: Request, db: any, jobId: string) {
  const auth: any = await authorizeJob(request, db, jobId);
  if (!auth.ok) return auth.response;
  const body = await jsonBody(request);
  if (!body || !body.state || typeof body.state !== "object") return reply({ error: "state_object_required" }, 400);

  const currentVersion = Number(auth.job.state_version || 0);
  const expectedVersion = body.expected_version == null ? currentVersion : Number(body.expected_version);
  if (expectedVersion !== currentVersion) {
    return reply({ error: "state_version_conflict", expected_version: expectedVersion, current_version: currentVersion }, 409);
  }

  const nextVersion = currentVersion + 1;
  const now = new Date().toISOString();
  const stateJson = JSON.stringify(body.state);
  const stateHash = await sha256(stateJson);
  const maturity = typeof body.maturity === "string" ? body.maturity : auth.job.maturity;

  await db.batch([
    db.prepare(
      "INSERT INTO irrigation_job_snapshots (job_id, version, state_json, state_hash, created_at) VALUES (?, ?, ?, ?, ?)"
    ).bind(jobId, nextVersion, stateJson, stateHash, now),
    db.prepare(
      "UPDATE irrigation_jobs SET state_version = ?, maturity = ?, updated_at = ? WHERE job_id = ? AND state_version = ?"
    ).bind(nextVersion, maturity, now, jobId, currentVersion),
    db.prepare(
      "INSERT INTO irrigation_events (event_id, job_id, event_type, object_ids_json, payload_json, actor_type, occurred_at) VALUES (?, ?, 'state.saved', '[]', ?, 'anonymous_job_holder', ?)"
    ).bind(randomId("evt"), jobId, JSON.stringify({ version: nextVersion, state_hash: stateHash }), now)
  ]);

  return reply({ job_id: jobId, state_version: nextVersion, state_hash: stateHash, maturity });
}

async function saveLearning(request: Request, db: any, jobId: string) {
  const auth: any = await authorizeJob(request, db, jobId);
  if (!auth.ok) return auth.response;
  const body = await jsonBody(request);
  const entry = body?.entry || body;
  if (!entry || typeof entry !== "object" || !entry.kind || !entry.summary) {
    return reply({ error: "learning_entry_required", required: ["kind", "summary"] }, 400);
  }
  if (entry.may_generalize === true) {
    return reply({ error: "job_route_cannot_generalize_learning", detail: "Job-local evidence may not promote itself to an organisation/regional rule." }, 400);
  }

  const evidenceId = entry.evidence_id || randomId("learn");
  const observedAt = entry.observed_at || new Date().toISOString();
  await db.prepare(
    "INSERT OR REPLACE INTO irrigation_learning_evidence (evidence_id, job_id, scope, kind, subject_ids_json, proposal_id, observed_at, source_json, state, summary, facts_json, interpretations_json, confidence, may_generalize, generalization_conditions_json) VALUES (?, ?, 'job', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)"
  ).bind(
    evidenceId,
    jobId,
    String(entry.kind),
    JSON.stringify(Array.isArray(entry.subject_ids) ? entry.subject_ids : []),
    entry.proposal_id || null,
    observedAt,
    JSON.stringify(entry.source || { type: "human_action", actor: "anonymous_job_holder", provenance_ref: null }),
    entry.state || "observed",
    String(entry.summary),
    JSON.stringify(Array.isArray(entry.facts) ? entry.facts : []),
    JSON.stringify(Array.isArray(entry.interpretations) ? entry.interpretations : []),
    typeof entry.confidence === "number" ? entry.confidence : null,
    JSON.stringify(Array.isArray(entry.generalization_conditions) ? entry.generalization_conditions : [])
  ).run();

  return reply({ evidence_id: evidenceId, job_id: jobId, scope: "job", may_generalize: false }, 201);
}

export async function handleAnonymousJobs(request: Request, env: EnvLike): Promise<Response | null> {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/api/jobs")) return null;

  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
  const db = env.IRRIGATION_DB;
  if (!db) {
    return reply({
      error: "anonymous_persistence_not_bound",
      required_binding: "IRRIGATION_DB",
      migration: "migrations/0001_anonymous_irrigation_jobs.sql",
      detail: "The API contract is present, but no D1 database is bound to this staging Worker yet."
    }, 503);
  }

  if (url.pathname === "/api/jobs" && request.method === "POST") return createJob(request, db);

  const match = url.pathname.match(/^\/api\/jobs\/([^/]+)(?:\/(state|learning))?$/);
  if (!match) return reply({ error: "job_route_not_found" }, 404);
  const jobId = decodeURIComponent(match[1]);
  const action = match[2] || null;

  if (!action && request.method === "GET") return getJob(request, db, jobId);
  if (action === "state" && request.method === "PUT") return saveState(request, db, jobId);
  if (action === "learning" && request.method === "POST") return saveLearning(request, db, jobId);
  return reply({ error: "method_not_allowed" }, 405);
}
