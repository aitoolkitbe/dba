import { NextResponse } from "next/server";
import { DEFAULT_MODEL, getClaudeClient } from "@/lib/claude";
import type { AssetCategory, AssetType } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Body {
  name: string;
  category: string;
  positioning?: string;
  competitors?: string[];
}

interface SuggestedAsset {
  name: string;
  category: AssetCategory;
  type: AssetType;
  description: string;
  visual?: string;
}

const SYSTEM = `You are a distinctive-brand-asset strategist. Given a brand and category, you list the brand's *most likely existing* distinctive assets — not hypothetical ones, not invented ones. If you're not sure, skip.

You output a JSON object of shape:
{
  "assets": [
    {
      "name": "Short asset name",
      "category": "visual" | "verbal" | "auditory" | "scenic",
      "type": "color" | "logo" | "symbol" | "character" | "celebrity" | "font_typography" | "shape_packaging" | "style_design" | "tagline" | "slogan" | "sonic_word" | "name_device" | "jingle" | "sound_mnemonic" | "voice" | "scene_setting" | "situation",
      "description": "1 short sentence describing it.",
      "visual": "single emoji that stands in for this asset"
    }
  ]
}

Rules:
- 4–8 assets maximum.
- Cover at least TWO of the four categories (visual / verbal / auditory / scenic).
- Stay factual. If the brand has no famous tagline, do not invent one.
- If the brand is obscure to you, produce plausible candidates labelled generically ("The logo", "Primary colour").
- No preamble, no markdown, JSON only.`;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    if (!body.name || !body.category) {
      return NextResponse.json(
        { error: "name and category are required" },
        { status: 400 }
      );
    }

    const user = `Brand: ${body.name}
Category: ${body.category}
Positioning: ${body.positioning ?? "—"}
Competitors: ${(body.competitors ?? []).join(", ") || "—"}

List the brand's likely existing distinctive assets.`;

    const client = getClaudeClient();
    const completion = await client.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 900,
      temperature: 0.4,
      system: SYSTEM,
      messages: [{ role: "user", content: user }],
    });

    const text = completion.content
      .filter((b) => b.type === "text")
      .map((b) => ("text" in b ? b.text : ""))
      .join("\n")
      .trim();

    const jsonText = extractJson(text);
    const parsed = JSON.parse(jsonText) as { assets?: SuggestedAsset[] };
    const assets = Array.isArray(parsed.assets) ? parsed.assets : [];

    return NextResponse.json({ assets });
  } catch (err: unknown) {
    console.error("[/api/suggest-assets]", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function extractJson(text: string): string {
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first >= 0 && last > first) return text.slice(first, last + 1);
  return text;
}
