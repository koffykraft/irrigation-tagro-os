import worldProfile from "../../knowledge/irrigation-world-profile.json";
import engineeringBasis from "../../knowledge/engineering-basis.json";
import sourceRegistry from "../../knowledge/source-registry.json";
import adviserResponseSchema from "../../schemas/ai-adviser-response-v1.0.schema.json";
import { stampProposal } from "./intent-guard";
import {
  PRODUCTS,
  PRODUCT_INDEX,
  productTerms,
  selectProducts,
  productsBySearchTerm
} from "./product-knowledge";
import {
  ENGINE_VERSION,
  assessRun,
  compareSizes,
  operatingSectionsForCapacity,
  runtimeTradeoff,
  runConformance
} from "../../engineering/irrigation-engine.js";

type Env = {
  ENVIRONMENT?: string;
  BUILD?: string;
  ASSETS?: Fetcher;
  AI?: {
    run: (model: string, input: unknown, options?: Record<string, unknown>) => Promise<unknown>;
    aiGatewayLogId?: string;
  };
  AI_MODEL?: string;
  AI_GATEWAY?: string;
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

function buildContext(body: ContextRequest) {
  const productCandidates = selectProducts(body);
  return {
    context_version: "irrigation-context-1.8.0",
    generated_at: new Date().toISOString(),
    task: body.task ?? "irrigation_design_advice",
    user_request: body.user_request ?? null,
    farmer_context: body.farmer ?? {},
    active_field: body.field ?? {},
    active_geometry: body.geometry ?? {},
    active_network: body.network ?? {},
    deterministic_hydraulics: body.hydraulics ?? {},
    deterministic_engine: {
      version: ENGINE_VERSION,
      conformance: runConformance()
    },
    budget_context: body.budget ?? {},
    explicit_preferences: body.preferences ?? {},
    world_profile: worldProfile,
    engineering_basis: engineeringBasis,
    product_catalogue_index: PRODUCT_INDEX,
    product_candidates: productCandidates,
    product_retrieval: {
      terms: productTerms(body),
      candidate_count: productCandidates.length,
      total_normalized_products: PRODUCTS.length,
      rule: "Detailed manufacturer records are supplied only when relevant to the current question or an explicit product category request."
    },
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

function adviserSystemPrompt() {
  return [
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
    "The product catalogue index tells you what product knowledge exists; detailed product_candidates are the records retrieved for the current question. Do not invent specifications for products that are only in the index.",
    "A Jain product may be useful evidence or an option, but do not force Jain where a generic requirement is sufficient or a simpler product better fits the farmer's priorities.",
    "Treat filtration and fertigation as hydraulic/network decisions: pressure loss, source-water contamination, device filtration requirement, injection differential and service access can matter.",
    "Distinguish dripper, jet, micro/mini sprinkler, under-tree sprinkler, bubbler, mister and fogger by their actual application behaviour; do not flatten them into one emitter category.",
    "Geometry proposals must be expressed as design intent anchored to existing entity IDs. Never invent final map/canvas coordinates.",
    "Never calculate or invent hydraulic PASS/FAIL, permissible length, required sections or runtime yourself. Use deterministic results already supplied in context; otherwise name the deterministic check that is needed.",
    "If a low-cost option trades capital for longer irrigation time, more manual work, more sections or less convenience, explain that plainly and do not present it as viable until required deterministic checks are listed or already passed.",
    "If evidence is missing, do not fill the gap with presumed information. Ask, offer a cautious starting point, or say not enough is known yet.",
    "Default response: brief understanding; then one consequential question OR a small number of useful proposals. Do not fill proposals merely because the schema permits them."
  ].join(" ");
}

function anthropicSchema(value: any): any {
  if (Array.isArray(value)) return value.map(anthropicSchema);
  if (!value || typeof value !== "object") return value;
  const out: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value)) {
    if (["$schema", "$id", "minimum", "maximum", "minLength", "maxLength", "minItems", "maxItems", "pattern", "format"].includes(key)) continue;
    out[key] = anthropicSchema(child);
  }
  return out;
}

function adviserPrompt(context: unknown) {
  return {
    system: adviserSystemPrompt(),
    max_tokens: 1600,
    messages: [{ role: "user", content: JSON.stringify(context) }],
    output_config: {
      format: {
        type: "json_schema",
        schema: anthropicSchema(adviserResponseSchema)
      }
    }
  };
}

function parseAnthropicStructuredResult(result: any) {
  if (result?.response && typeof result.response === "object" && typeof result.response.message === "string") return result.response;
  if (typeof result?.message === "string") return result;
  const textBlock = Array.isArray(result?.content)
    ? result.content.find((block: any) => block?.type === "text" && typeof block?.text === "string")
    : null;
  if (!textBlock?.text) throw new Error("Anthropic returned no structured text block");
  const parsed = JSON.parse(textBlock.text);
  if (!parsed || typeof parsed !== "object" || typeof parsed.message !== "string") {
    throw new Error("Anthropic response did not match adviser response contract");
  }
  return parsed;
}

function normalizeStructuredResult(result: any) {
  const response = parseAnthropicStructuredResult(result);
  const proposals = Array.isArray(response.proposals)
    ? response.proposals.map((proposal: any, index: number) => stampProposal(proposal, index))
    : [];
  return { ...response, proposals };
}

async function readJsonBody(req: Request) {
  return req.json<any>().catch(() => null);
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
      const model = env.AI_MODEL?.trim() || "";
      const gateway = env.AI_GATEWAY?.trim() || "default";
      const aiReady = aiBinding && Boolean(model);
      const conformance = runConformance();
      return json({
        ok: conformance.pass,
        service: "tagro-irrigation-ai-context",
        environment: env.ENVIRONMENT ?? "staging",
        build: env.BUILD ?? "dev",
        ai_bound: aiReady,
        ai_binding: aiBinding,
        ai_model_configured: Boolean(model),
        ai_ready: aiReady,
        ai_provider: model.startsWith("anthropic/") ? "anthropic" : "configured-model",
        ai_model: model || null,
        ai_gateway: gateway,
        structured_output: "ai-adviser-response-v1.0",
        direct_geometry_from_ai: false,
        assets_bound: Boolean(env.ASSETS),
        product_knowledge_count: PRODUCTS.length,
        engineering_engine: ENGINE_VERSION,
        engineering_conformance: conformance
      });
    }

    if (url.pathname === "/api/knowledge/world") return json(worldProfile);
    if (url.pathname === "/api/knowledge/engineering") return json(engineeringBasis);
    if (url.pathname === "/api/knowledge/sources") return json(sourceRegistry);
    if (url.pathname === "/api/knowledge/products") {
      const category = url.searchParams.get("category")?.toLowerCase();
      if (!category) return json({ count: PRODUCTS.length, index: PRODUCT_INDEX });
      const items = productsBySearchTerm(category);
      return json({ count: items.length, items });
    }
    if (url.pathname === "/api/contracts/adviser-response") return json(adviserResponseSchema);

    if (url.pathname === "/api/engineering/conformance") {
      const result = runConformance();
      return json(result, result.pass ? 200 : 500);
    }

    if (url.pathname === "/api/engineering/assess-run" && req.method === "POST") {
      const body = await readJsonBody(req);
      if (!body) return json({ error: "valid JSON body required" }, 400);
      try { return json(assessRun(body)); }
      catch (error: any) { return json({ error: "engineering_input_error", detail: String(error?.message ?? error) }, 400); }
    }

    if (url.pathname === "/api/engineering/compare-sizes" && req.method === "POST") {
      const body = await readJsonBody(req);
      if (!body || !Array.isArray(body.nominalSizes)) return json({ error: "body with nominalSizes array required" }, 400);
      try {
        const { nominalSizes, ...input } = body;
        return json({ engineVersion: ENGINE_VERSION, results: compareSizes(input, nominalSizes) });
      } catch (error: any) {
        return json({ error: "engineering_input_error", detail: String(error?.message ?? error) }, 400);
      }
    }

    if (url.pathname === "/api/engineering/sections" && req.method === "POST") {
      const body = await readJsonBody(req);
      if (!body) return json({ error: "valid JSON body required" }, 400);
      return json(operatingSectionsForCapacity(body));
    }

    if (url.pathname === "/api/engineering/runtime" && req.method === "POST") {
      const body = await readJsonBody(req);
      if (!body) return json({ error: "valid JSON body required" }, 400);
      return json(runtimeTradeoff(body));
    }

    if (url.pathname === "/api/ai/context" && req.method === "POST") {
      const body = await req.json<ContextRequest>().catch(() => null);
      if (!body) return json({ error: "valid JSON body required" }, 400);
      return json(buildContext(body));
    }

    if (url.pathname === "/api/ai/advise" && req.method === "POST") {
      const body = await req.json<ContextRequest>().catch(() => null);
      if (!body) return json({ error: "valid JSON body required" }, 400);
      const context = buildContext(body);
      const model = env.AI_MODEL?.trim() || "";
      const gateway = env.AI_GATEWAY?.trim() || "default";
      if (!env.AI || !model) {
        return json({
          error: "Anthropic adviser not configured",
          context,
          detail: "Context assembly is operational. Configure the Cloudflare AI binding/model to enable Anthropic adviser responses."
        }, 501);
      }
      try {
        const raw = await env.AI.run(model, adviserPrompt(context), {
          gateway: {
            id: gateway,
            skipCache: true,
            collectLog: true,
            metadata: {
              application: "tagro-irrigation-environment",
              environment: env.ENVIRONMENT ?? "staging",
              task: body.task ?? "irrigation_design_advice"
            }
          }
        });
        const structured = normalizeStructuredResult(raw);
        return json({
          context_version: (context as any).context_version,
          result: structured.message,
          structured,
          gateway_log_id: env.AI.aiGatewayLogId ?? null,
          proposal_status: "All returned proposals remain proposed until human acceptance and deterministic validation."
        });
      } catch (error: any) {
        return json({
          error: "Anthropic adviser response failed",
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
