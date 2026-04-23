import Anthropic from "@anthropic-ai/sdk";

/** Server-side Claude client. NEVER import this from a client component. */
export function getClaudeClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is niet geconfigureerd. Voeg hem toe in .env.local of op Vercel."
    );
  }
  return new Anthropic({ apiKey });
}

export const DEFAULT_MODEL =
  process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";
