(() => {
  "use strict";

  const PREFIX = "tagro.irrigation.learning.v1";
  const now = () => new Date().toISOString();
  const randomId = () => (crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(36).slice(2)}`);
  const volatileEntries = new Map();
  let volatileJobId = null;
  let persistenceState = { ok: true, mode: "localStorage", error: null, at: now() };

  function persistenceEvent(ok, error = null) {
    persistenceState = {
      ok,
      mode: ok ? "localStorage" : "memory-fallback",
      error: error ? String(error?.message || error) : null,
      at: now()
    };
    window.dispatchEvent(new CustomEvent(ok ? "tagro:learning-save-ok" : "tagro:learning-save-error", {
      detail: { ...persistenceState }
    }));
  }

  function safeGet(key) {
    try { return localStorage.getItem(key); }
    catch (error) { persistenceEvent(false, error); return null; }
  }

  function safeSet(key, value) {
    try {
      localStorage.setItem(key, value);
      persistenceEvent(true);
      return true;
    } catch (error) {
      persistenceEvent(false, error);
      return false;
    }
  }

  function safeRemove(key) {
    try {
      localStorage.removeItem(key);
      persistenceEvent(true);
      return true;
    } catch (error) {
      persistenceEvent(false, error);
      return false;
    }
  }

  function jobKey(jobId) {
    return `${PREFIX}:${jobId}`;
  }

  function ensureJobId(existing) {
    const id = existing || safeGet(`${PREFIX}:active-job`) || volatileJobId || `job_${randomId()}`;
    volatileJobId = id;
    safeSet(`${PREFIX}:active-job`, id);
    return id;
  }

  function read(jobId) {
    const id = ensureJobId(jobId);
    if (volatileEntries.has(id)) return [...volatileEntries.get(id)];
    try {
      const parsed = JSON.parse(safeGet(jobKey(id)) || "[]");
      if (Array.isArray(parsed)) {
        volatileEntries.set(id, [...parsed]);
        return parsed;
      }
    } catch {}
    return [];
  }

  function write(jobId, entries) {
    const id = ensureJobId(jobId);
    const copy = Array.isArray(entries) ? [...entries] : [];
    volatileEntries.set(id, copy);
    safeSet(jobKey(id), JSON.stringify(copy));
    return copy;
  }

  function append(jobId, input = {}) {
    const id = ensureJobId(jobId);
    const entry = {
      evidence_id: input.evidence_id || `learn_${randomId()}`,
      job_id: id,
      scope: input.scope || "job",
      kind: input.kind || "operating_observation",
      subject_ids: Array.isArray(input.subject_ids) ? input.subject_ids : [],
      proposal_id: input.proposal_id || null,
      observed_at: input.observed_at || now(),
      source: input.source || { type: "human_action", actor: "current_user", provenance_ref: null },
      state: input.state || "observed",
      summary: input.summary || "",
      facts: Array.isArray(input.facts) ? input.facts : [],
      interpretations: Array.isArray(input.interpretations) ? input.interpretations : [],
      confidence: typeof input.confidence === "number" ? input.confidence : null,
      may_generalize: input.may_generalize === true,
      generalization_conditions: Array.isArray(input.generalization_conditions) ? input.generalization_conditions : []
    };
    const entries = read(id);
    entries.push(entry);
    write(id, entries);
    window.dispatchEvent(new CustomEvent("tagro:learning-change", { detail: entry }));
    return entry;
  }

  function recordProposalDecision(jobId, proposal, decision, reasonInUserWords = null) {
    const kindMap = {
      accepted: "proposal_accepted",
      rejected: "proposal_rejected",
      modified: "proposal_modified"
    };
    return append(jobId, {
      kind: kindMap[decision] || "proposal_modified",
      subject_ids: Array.isArray(proposal?.affected_ids) ? proposal.affected_ids : [],
      proposal_id: proposal?.proposal_id || null,
      source: { type: "human_action", actor: "current_user", provenance_ref: proposal?.proposal_id || null },
      state: "confirmed",
      summary: reasonInUserWords || `${decision} proposal ${proposal?.proposal_id || ""}`.trim(),
      facts: [{ name: "decision", value: decision, unit: null }],
      interpretations: [],
      confidence: 1,
      may_generalize: false,
      generalization_conditions: ["Do not generalize from one job or one farmer preference."]
    });
  }

  function recordPreference(jobId, summary, subjectIds = []) {
    return append(jobId, {
      kind: "preference_stated",
      subject_ids: subjectIds,
      source: { type: "farmer_statement", actor: "current_user", provenance_ref: null },
      state: "confirmed",
      summary,
      facts: [],
      interpretations: [],
      confidence: 1,
      may_generalize: false,
      generalization_conditions: ["Preference remains job-specific unless separately validated across independent outcomes."]
    });
  }

  function context(jobId, limit = 20) {
    const entries = read(jobId).slice(-Math.max(1, limit));
    return {
      contract: "learning-evidence-v1.0",
      scope: "job",
      rule: "These are observations, choices and outcomes. They are not engineering rules and must not override deterministic validation or manufacturer evidence.",
      entries
    };
  }

  function clear(jobId) {
    const id = ensureJobId(jobId);
    volatileEntries.delete(id);
    safeRemove(jobKey(id));
  }

  window.TAGROLearning = {
    ensureJobId,
    read,
    append,
    recordProposalDecision,
    recordPreference,
    context,
    clear,
    persistence: () => ({ ...persistenceState })
  };
})();