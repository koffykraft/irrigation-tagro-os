import core from "./index";

type AiLike = {
  run: (model: string, input: any, options?: Record<string, any>) => Promise<any>;
  aiGatewayLogId?: string;
};

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

      const result = await ai.run(model, nextInput, nextOptions);
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

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const adaptedEnv = env?.AI ? { ...env, AI: adaptAnthropicAi(env.AI) } : env;
    return core.fetch(request, adaptedEnv);
  }
};
