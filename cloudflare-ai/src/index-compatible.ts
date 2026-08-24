import core from "./index";

type AiLike = {
  run: (model: string, input: any, options?: Record<string, any>) => Promise<any>;
  aiGatewayLogId?: string;
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

function cleanJsonText(text: string) {
  let value = String(text || "").trim();
  if (value.startsWith("```")) {
    value = value.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  }
  const first = value.indexOf("{");
  const last = value.lastIndexOf("}");
  if (first >= 0 && last > first) value = value.slice(first, last + 1);
  return value;
}

function responseText(result: any) {
  if (!result) return null;
  if (typeof result === "string") return result;
  if (typeof result.response === "string") return result.response;
  if (Array.isArray(result.content)) {
    const block = result.content.find((item: any) => item?.type === "text" && typeof item?.text === "string");
    if (block?.text) return block.text;
  }
  return null;
}

function errorText(error: any) {
  return String(error?.message ?? error ?? "unknown error");
}

function adaptAnthropicAi(ai: AiLike): AiLike {
  return {
    async run(model: string, input: any, options?: Record<string, any>) {
      if (!String(model || "").startsWith("anthropic/") || !input || typeof input !== "object") {
        return ai.run(model, input, options);
      }

      const nextInput: Record<string, any> = { ...input };
      const schema = nextInput?.output_config?.format?.schema ?? null;
      delete nextInput.output_config;

      if (schema) {
        const jsonInstruction = [
          "Return ONLY one valid JSON object and no markdown or commentary outside it.",
          "The JSON must follow this contract as closely as possible.",
          "If a field is unknown, use null, an empty array, or an explicit unknown enum value rather than inventing information.",
          `Contract schema: ${JSON.stringify(schema)}`
        ].join(" ");
        nextInput.system = `${String(nextInput.system || "").trim()}\n\n${jsonInstruction}`.trim();
      }

      const gateway = options?.gateway;
      const nextOptions = gateway
        ? {
            gateway: {
              id: gateway.id || "default",
              skipCache: gateway.skipCache !== false
            }
          }
        : options;

      let result: any;
      try {
        result = await ai.run(model, nextInput, nextOptions);
      } catch (error: any) {
        throw new Error(`provider_call_failed: ${errorText(error)}`);
      }

      if (schema && Array.isArray(result?.content)) {
        const content = result.content.map((block: any) =>
          block?.type === "text" && typeof block?.text === "string"
            ? { ...block, text: cleanJsonText(block.text) }
            : block
        );
        return { ...result, content };
      }
      return result;
    },
    get aiGatewayLogId() {
      return ai.aiGatewayLogId;
    }
  };
}

async function providerPing(env: any) {
  const model = String(env?.AI_MODEL || "").trim();
  const gateway = String(env?.AI_GATEWAY || "default").trim() || "default";
  if (!env?.AI || !model) {
    return json({ ok: false, stage: "configuration", detail: "AI binding/model not configured" }, 501);
  }
  try {
    const raw = await env.AI.run(
      model,
      {
        max_tokens: 32,
        messages: [{ role: "user", content: "Reply with exactly OK" }]
      },
      { gateway: { id: gateway, skipCache: true } }
    );
    return json({
      ok: true,
      stage: "provider_call",
      model_requested: model,
      model_returned: raw?.model ?? null,
      stop_reason: raw?.stop_reason ?? null,
      text: responseText(raw),
      gateway_metadata: raw?.gatewayMetadata ?? null
    });
  } catch (error: any) {
    return json({
      ok: false,
      stage: "provider_call",
      model_requested: model,
      gateway,
      detail: errorText(error)
    }, 502);
  }
}

async function jsonPing(env: any) {
  const model = String(env?.AI_MODEL || "").trim();
  const gateway = String(env?.AI_GATEWAY || "default").trim() || "default";
  if (!env?.AI || !model) {
    return json({ ok: false, stage: "configuration", detail: "AI binding/model not configured" }, 501);
  }
  try {
    const raw = await env.AI.run(
      model,
      {
        max_tokens: 96,
        system: "Return only valid JSON. No markdown.",
        messages: [{ role: "user", content: "Return exactly this JSON object: {\"message\":\"OK\",\"next_question\":null}" }]
      },
      { gateway: { id: gateway, skipCache: true } }
    );
    const text = responseText(raw) || "";
    const cleaned = cleanJsonText(text);
    let parsed: any = null;
    let parse_error: string | null = null;
    try { parsed = JSON.parse(cleaned); }
    catch (error: any) { parse_error = errorText(error); }
    return json({
      ok: Boolean(parsed && parsed.message === "OK"),
      stage: parsed ? "json_parse" : "json_parse_failed",
      model_returned: raw?.model ?? null,
      raw_text: text,
      cleaned_text: cleaned,
      parsed,
      parse_error,
      gateway_metadata: raw?.gatewayMetadata ?? null
    }, parsed ? 200 : 502);
  } catch (error: any) {
    return json({
      ok: false,
      stage: "provider_call",
      detail: errorText(error)
    }, 502);
  }
}

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/ai/provider-ping") return providerPing(env);
    if (url.pathname === "/api/ai/json-ping") return jsonPing(env);

    const adaptedEnv = env?.AI ? { ...env, AI: adaptAnthropicAi(env.AI) } : env;
    return core.fetch(request, adaptedEnv);
  }
};
