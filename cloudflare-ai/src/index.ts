import worldProfile from "../../knowledge/irrigation-world-profile.json";
import engineeringBasis from "../../knowledge/engineering-basis.json";
import sourceRegistry from "../../knowledge/source-registry.json";
import adviserResponseSchema from "../../schemas/ai-adviser-response-v1.0.schema.json";
import jscpc from "../../knowledge/products/jain/j-sc-pc-plus.json";
import jloc from "../../knowledge/products/jain/j-loc.json";
import jainJet from "../../knowledge/products/jain/jain-jet.json";

type Env = {
  ENVIRONMENT?: string;
  BUILD?: string;
  ASSETS?: Fetcher;
  AI?: { run: (model: string, input: unknown) => Promise<unknown> };
  AI_MODEL?: string;
};

type FarmerContext = {
  stated_need?: string;
  stated_budget?: number | null;
  budget_flexibility?: "unknown" | "firm" | "some" | "flexible";
  quality_preference?: "unknown" | "minimum_workable" | "balanced" | "quality_first";
  willingness_to_spend?: "unknown" | "low" | "moderate" | "high";
  affordability?: "unknown" | "constrained" | "comfortable";
  time_tolerance?: "unknown" | "low" | "moderate" | "high";
  manual_work_tolerance?: "unknown" | "low" | "moderate" | "high";
  convenience_priority?: "unknown" | "low" | "moderate" | "high";
  future_expansion_interest?: "unknown" | "none" | "possible" | "likely";
  wants_explanation_depth?: "unknown" | "simple" | "normal" | "deep";
  notes_in_farmer_words?: string[];
};

type ContextRequest = {
  task?: string;
  user_request?: string;
  farmer?: FarmerContext;
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
    context_version: "irrigation-context-1.3.0",
    generated_at: new Date().toISOString(),
    task: body.task ?? "irrigation_design_advice",
    user_request: body.user_request ?? null,
    farmer_context: body.farmer ?? {},
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
      understand_before_advising: true,
      ask_one_consequential_question_at_a_time_when_possible: true,
      do_not_present_assumptions_as_facts: true,
      default_to_plain_language: true,
      technical_detail_on_demand_or_when_required_for_validity: true,
      ability_to_pay_is_not_willingness_to_spend: true,
      farmer_context_is_revisable_not_a_fixed_profile: true,
      deterministic_results_are_authoritative_over_ai_guessing: true,
      manufacturer_specs_are_not_overridden_by_learning: true,
      tagro_policy_generates_options_but_does_not_force_answers: true,
      geometry_changes_are_proposals_until_human_acceptance: true,
      ai_outputs_intent_not_final_coordinates: true,
      learned_patterns_are_observations_not_rules: true,
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
        content: [
          "You are the TAGRO Irrigation Design Adviser, speaking with a farmer or field designer.",
          "Be conversational, calm and practical. Do not sound like a technical report unless the user asks for one.",
          "Understand the farmer's need before recommending products or a complete system.",
          "Ask one useful question at a time when more information would materially change the advice.",
          "Never present an assumption, learned pattern or crop default as a known fact.",
          "Use ordinary language first. Translate technical results into practical consequences such as more time, more sections, easier access, higher cost or better uniformity.",
          "Only expose hydraulic jargon, equations, pressure details, permissible-length calculations or product specifications when requested or when a technical limit must be made clear to avoid an invalid design.",
          "Do not treat 2 HP, single phase, a particular pipe size, emitter type, or budget as a fixed design rule. They are context and trade-off signals.",
          "Keep affordability, willingness to spend, quality preference, time tolerance, labour tolerance, convenience and future expansion as separate revisable dimensions. Never stereotype a person from sparse information.",
          "Use only the supplied context for specific product or engineering claims. Distinguish engineering evidence, manufacturer evidence, TAGRO policy and learned observation.",
          "Geometry proposals must be expressed as design intent anchored to existing entity IDs. Never invent final map/canvas coordinates.",
          "If a low-cost option trades capital for longer irrigation time, more manual work, more sections or less convenience, explain that plainly and do not present it as viable until required deterministic checks are listed or already passed.",
          "If evidence is missing, do not fill the gap with presumed information. Ask, offer a cautious starting point, or say not enough is known yet.",
          "Default response: brief understanding; then one consequential question OR a small number of useful proposals. Do not fill proposals merely because the schema permits them."
        ].join(" ")
      },
      { role: "user", content: JSON.stringify(context) }
    ],
    response_format: {
      type: "json_schema",
      json_schema: adviserResponseSchema
    }
  };
}

function normalizeStructuredResult(result: any) {
  const response = result?.response ?? result;
  if (!response || typeof response !== "object" || typeof response.message !== "string") {
    throw new Error("Workers AI did not return the adviser response contract");
  }
  const proposals = Array.isArray(response.proposals)
    ? response.proposals.map((proposal: any, index: number) => ({
        id: crypto.randomUUID ? crypto.randomUUID() : `prop_${Date.now()}_${index + 1}`,
        status: "proposed",
        ...proposal
      }))
    : [];
  return { ...response, proposals };
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "access-control-allow-origin": "*",
          "access-control-allow-headers": "content-type",
          "access-control-allow-methods": "GET,POST,OPTIONS"
        }
      });
    }

    const url = new URL(req.url);

    if (url.pathname === "/health") {
      const aiBinding = Boolean(env.AI);
      const aiModel = Boolean(env.AI_MODEL?.trim());
      const aiReady = aiBinding && aiModel;
      return json({
        ok: true,
        service: "tagro-irrigation-ai-context",
        environment: env.ENVIRONMENT ?? "staging",
        build: env.BUILD ?? "dev",
        ai_bound: aiReady,
        ai_binding: aiBinding,
        ai_model_configured: aiModel,
        ai_ready: aiReady,
        structured_output: "ai-adviser-response-v1.0",
        assets_bound: Boolean(env.ASSETS),
        product_seed_count: PRODUCTS.length
      });
    }

    if (url.pathname === "/api/knowledge/world") return json(worldProfile);
    if (url.pathname === "/api/knowledge/engineering") return json(engineeringBasis);
    if (url.pathname === "/api/knowledge/sources") return json(sourceRegistry);
    if (url.pathname === "/api/knowledge/products") return json({ count: PRODUCTS.length, items: PRODUCTS });
    if (url.pathname === "/api/contracts/adviser-response") return json(adviserResponseSchema);

    if (url.pathname === "/api/ai/context" && req.method === "POST") {
      const body = await req.json<ContextRequest>().catch(() => null);
      if (!body) return json({ error: "valid JSON body required" }, 400);
      return json(buildContext(body));
    }

    if (url.pathname === "/api/ai/advise" && req.method === "POST") {
      const body = await req.json<ContextRequest>().catch(() => null);
      if (!body) return json({ error: "valid JSON body required" }, 400);
      const context = buildContext(body);
      if (!env.AI || !env.AI_MODEL?.trim()) {
        return json({
          error: "AI binding/model not configured",
          context,
          detail: "Context assembly is operational. Bind Workers AI and configure AI_MODEL to enable adviser responses."
        }, 501);
      }
      try {
        const raw = await env.AI.run(env.AI_MODEL, adviserPrompt(context));
        const structured = normalizeStructuredResult(raw);
        return json({
          context_version: (context as any).context_version,
          result: structured.message,
          structured,
          proposal_status: "All returned proposals remain proposed until human acceptance and deterministic validation."
        });
      } catch (error: any) {
        return json({
          error: "structured adviser response failed",
          detail: String(error?.message ?? error),
          context_version: (context as any).context_version
        }, 502);
      }
    }

    if (url.pathname.startsWith("/api/")) return json({ error: "not found" }, 404);
    if (env.ASSETS) return env.ASSETS.fetch(req);
    return json({ error: "static assets binding not configured" }, 503);
  }
};
