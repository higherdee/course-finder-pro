import { createOpenAI } from "@ai-sdk/openai";

import { createLovableAiGatewayRunIdFetch } from "./run-id";

export const CHAT_MODEL = "openai/gpt-6-astra";

export function createGateway(initialRunId?: string) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured");
  const runIdFetch = createLovableAiGatewayRunIdFetch(initialRunId);
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });
  return { provider, runIdFetch };
}

export const reasoningOptions = (effort: "low" | "medium" = "medium") => ({
  openai: {
    store: false,
    forceReasoning: true,
    reasoningEffort: effort,
    reasoningSummary: "auto",
    include: ["reasoning.encrypted_content"],
  },
});
