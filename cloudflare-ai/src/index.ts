import worldProfile from "../../knowledge/irrigation-world-profile.json";
import engineeringBasis from "../../knowledge/engineering-basis.json";
import sourceRegistry from "../../knowledge/source-registry.json";
import jscpc from "../../knowledge/products/jain/j-sc-pc-plus.json";
import jloc from "../../knowledge/products/jain/j-loc.json";
import jainJet from "../../knowledge/products/jain/jain-jet.json";

type Env = {
  ENVIRONMENT?: string;
  BUILD?: string;
  AI?: { run: (model: string, input: unknown) => Promise<unknown> };
  AI_MODEL?: string;
};

type ContextRequest = {
  task?: string;
  user_request?: string;
  field?: Record<string, unknown>;
  geometry?: Record<string, unknown>;
  network?: Record<string, unknown>;
  hydraulics?: Record<string, unknown>;
  budget?: Record<string, unknown>;
  preferences?: Record<string, unknown>;
  product_query?: { categories?: string[]; manufacturer?: string; generic_allowed?: boolean };
};

const PRODUCTS = [jscpc, jloc, jainJet];

const json = (data: unknown, status = 200) => new Response(JSON.stringify(data, null, 2), {
  status,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "content-type",
    "access-control-allow-methods": "GET,POST,OPTIONS"
  }
});

function selectProducts(body: ContextRequest) {
  const cats = body.product_query?.categories?.map(x => x.toLowerCase()) ?? [];
  if (!cats.length) return PRODUCTS;
  return PRODUCTS.filter((p: any) => cats.some(c => String(p.category).toLowerCase().includes(c)));
}

function buildContext(body: ContextRequest) {
  return {
    context_version: "irrigation-context-1.0.0",
    generated_at: new Date().toISOString(),
    task: body.task ?? "irrigation_design_advice",
    user_request: body.user_request ?? null,
    active_field: body.field ?? {},
    active_geometry: body.geometry ?? {},
    active_network: body.network ?? {},
    deterministic_hydraulics: body.hydraulics ?? {},
    budget_context: body.budget ?? {},
    explicit_preferences: body.preferences ?? {},
    world_profile: worldProfile,
    engineering_basis: engineeringBasis,
    product_candidates: selectProducts(body),
    source_registry: sourceRegistry,
    rules: {
      deterministic_results_are_authoritative_over_ai_guessing: true,
      manufacturer_specs_are_not_overridden_by_learning: true,
      tagro_policy_generates_options_but_does_not_force_answers: true,
      geometry_changes_are_proposals_until_human_acceptance: true,
      unknown_is_not_zero: true,
      explain_tradeoffs: true
    }
  };
}

function adviserPrompt(context: unknown) {
  return {
    messages: [
      {
        role: "system",
        content: "You are the TAGRO Irrigation Design Adviser. Use only the supplied context for specific product or engineering claims. Distinguish engineering evidence, manufacturer evidence, TAGRO policy and learned preference. Generate options, questions and reversible proposals; never claim to have changed accepted geometry. Explain hydraulic, agronomic, human-access, cost and future-expansion trade-offs when relevant. If evidence is missing, say what is missing."
      },
      { role: "user", content: JSON.stringify(context) }
    ]
  };
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "content-type", "access-control-allow-methods": "GET,POST,OPTIONS" } });
    const url = new URL(req.url);

    if (url.pathname === "/health") {
      return json({ ok: true, service: "tagro-irrigation-ai-context", environment: env.ENVIRONMENT ?? "staging", build: env.BUILD ?? "dev", ai_bound: Boolean(env.AI), product_seed_count: PRODUCTS.length });
    }
    if (url.pathname === "/api/knowledge/world") return json(worldProfile);
    if (url.pathname === "/api/knowledge/engineering") return json(engineeringBasis);
    if (url.pathname === "/api/knowledge/sources") return json(sourceRegistry);
    if (url.pathname === "/api/knowledge/products") return json({ count: PRODUCTS.length, items: PRODUCTS });

    if (url.pathname === "/api/ai/context" && req.method === "POST") {
      const body = await req.json<ContextRequest>().catch(() => null);
      if (!body) return json({ error: "valid JSON body required" }, 400);
      return json(buildContext(body));
    }

    if (url.pathname === "/api/ai/advise" && req.method === "POST") {
      const body = await req.json<ContextRequest>().catch(() => null);
      if (!body) return json({ error: "valid JSON body required" }, 400);
      const context = buildContext(body);
      if (!env.AI || !env.AI_MODEL) {
        return json({ error: "AI binding/model not configured", context, detail: "Context assembly is operational; bind Cloudflare AI and set AI_MODEL to enable adviser responses." }, 501);
      }
      const result = await env.AI.run(env.AI_MODEL, adviserPrompt(context));
      return json({ context_version: (context as any).context_version, result, proposal_status: "AI output is advisory until validated/accepted" });
    }

    return json({ error: "not found" }, 404);
  }
};
