import { NextResponse } from "next/server";
import type { AssetAnalysis, Brand, DBAAsset, Quadrant } from "@/lib/types";
import { quadrantOf, QUADRANT_META } from "@/lib/types";
import { DEFAULT_MODEL, getClaudeClient } from "@/lib/claude";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Body {
  brand: Brand;
  asset: DBAAsset;
}

const SYSTEM_PROMPT = `You are a senior brand strategist trained in the Ehrenberg-Bass Institute's work on Distinctive Brand Assets (Byron Sharp, "How Brands Grow"; Jenni Romaniuk, "Building Distinctive Brand Assets").

You analyse a single candidate asset for a single brand.

Rules:
- Stay inside the DBA framework. Do not veer into positioning, USPs, brand purpose, or segmentation.
- Every asset lives in one of four quadrants on a Fame × Uniqueness grid: winner, investable, taxi, ignorable. Respect the quadrant the numbers indicate.
- Recommend ONE strategy: build, maintain, investigate, or drop.
- Be concrete. Prefer specific media, touchpoints, creative decisions over generic "amplify the asset".
- Write in English, professional tone, no jargon beyond Sharp/Romaniuk vocabulary.
- Be honest: if an asset should be dropped, say so plainly.

Return ONLY valid JSON in this exact shape:
{
  "strategy": "build" | "maintain" | "investigate" | "drop",
  "headline": "One short sentence (max ~14 words) stating the core strategic move.",
  "rationale": ["2 to 4 bullets. Each bullet ONE sentence, grounded in Sharp/Romaniuk logic."],
  "actions": ["2 to 4 concrete next steps, imperative voice, each starts with a verb."]
}

No preamble, no markdown, no code fences. JSON only.`;

function buildUserPrompt(brand: Brand, asset: DBAAsset, q: Quadrant) {
  const s = asset.scores!;
  return `Brand: ${brand.name}
Category: ${brand.category}
Positioning: ${brand.positioning ?? "—"}
Competitors: ${(brand.competitors ?? []).join(", ") || "—"}

Asset under review:
- Name: ${asset.name}
- Type: ${asset.type} (${asset.category})
- Description: ${asset.description}
- Heritage: ${asset.heritage ?? "—"}
- Fame: ${s.fame}%
- Uniqueness: ${s.uniqueness}%
- Score source: ${s.source}${s.notes ? `\n- Notes: ${s.notes}` : ""}

Quadrant (auto-classified): ${q.toUpperCase()} — ${QUADRANT_META[q].description}

Return the JSON recommendation now.`;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const { brand, asset } = body;

    if (!asset?.scores) {
      return NextResponse.json(
        { error: "Asset has no scores to analyse." },
        { status: 400 }
      );
    }

    const q = quadrantOf(asset.scores);
    if (!q) {
      return NextResponse.json(
        { error: "Could not determine quadrant." },
        { status: 400 }
      );
    }

    const client = getClaudeClient();
    const completion = await client.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 700,
      temperature: 0.6,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserPrompt(brand, asset, q) }],
    });

    const text = completion.content
      .filter((b) => b.type === "text")
      .map((b) => ("text" in b ? b.text : ""))
      .join("\n")
      .trim();

    const jsonText = extractJson(text);
    const parsed = JSON.parse(jsonText) as Partial<AssetAnalysis>;

    if (!parsed.strategy || !parsed.headline || !parsed.rationale) {
      throw new Error("Claude response missing required fields.");
    }

    const result: AssetAnalysis = {
      quadrant: q,
      strategy: parsed.strategy,
      headline: parsed.headline,
      rationale: parsed.rationale,
      actions: parsed.actions ?? [],
    };

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/analyze]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function extractJson(text: string): string {
  // Claude sometimes wraps JSON in prose despite instructions; be defensive.
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1);
  }
  return text;
}
