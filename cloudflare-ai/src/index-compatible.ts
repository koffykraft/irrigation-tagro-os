import core from "./index";

type AiLike = {
  run: (model: string, input: any, options?: Record<string, any>) => Promise<any>;
  aiGatewayLogId?: string;
};

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

      return ai.run(model, nextInput, nextOptions);
    },
    get aiGatewayLogId() {
      return ai.aiGatewayLogId;
    }
  };
}

export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    const adaptedEnv = env?.AI ? { ...env, AI: adaptAnthropicAi(env.AI) } : env;
    return core.fetch(request, adaptedEnv, ctx as any);
  }
};
