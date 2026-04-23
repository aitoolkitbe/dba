import { NextResponse } from "next/server";
import { DEFAULT_MODEL, getClaudeClient } from "@/lib/claude";
import type {
  AssetCategory,
  AssetType,
  Brand,
  CandidateConcept,
} from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Body {
  brand: Brand;
  gapBrief?: string;
  requestedCategory?: AssetCategory;
  requestedType?: AssetType;
}

const SYSTEM = `You are a distinctive brand asset strategist advising a brand on NEW candidate assets.

Your job: generate FIVE distinct candidate concepts, deliberately different from each other, that could become a Distinctive Brand Asset for this brand over time.

Constraints:
- Distinct > different. A new asset should be unlike anything competitors use.
- Anchor in the brand's existing assets where possible — extend, don't replace winners.
- Avoid category conventions (generic brewery-use-gold, bank-uses-blue, etc.).
- If the user requested a specific category/type, all five concepts must match it.
- Keep concepts producible: no impossible abstractions, no reliance on a specific medium the brand doesn't use.
- Be honest about risks — especially legal dilution or category conflict.

Respond with ONLY JSON:
{
  "concepts": [
    {
      "name": "short human-readable name, 2-5 words",
      "category": "visual" | "verbal" | "auditory" | "scenic",
      "type": one valid AssetType string,
      "description": "One factual sentence describing the asset.",
      "visual": "single emoji stand-in",
      "distinctiveness_hypothesis": "One sentence explaining why no competitor owns this and why it could trigger THIS brand.",
      "execution_notes": ["2-4 concrete, imperative execution bullets."],
      "risks": ["1-3 honest failure modes or risks."]
    }
  ]
}

Valid AssetType values: color, logo, symbol, character, celebrity, font_typography, shape_packaging, style_design, tagline, slogan, sonic_word, name_device, jingle, sound_mnemonic, voice, scene_setting, situation.

No preamble, no markdown, no code fences. JSON only.`;

function buildUserPrompt(body: Body) {
  const { brand, gapBrief, requestedCategory, requestedType } = body;
  const winners = brand.assets
    .filter((a) => a.scores && a.scores.fame >= 50 && a.scores.uniqueness >= 50)
    .map((a) => `- ${a.name} (${a.type})`)
    .join("\n");
  const currentInventory = brand.assets
    .map((a) => `- ${a.name} — ${a.category}/${a.type}`)
    .join("\n");

  return `Brand: ${brand.name}
Category: ${brand.category}
Positioning: ${brand.positioning ?? "—"}
Competitors: ${(brand.competitors ?? []).join(", ") || "—"}

Existing inventory:
${currentInventory || "(none yet)"}

Current winners (if any):
${winners || "(none yet)"}

${gapBrief ? `Stated gap / brief:\n${gapBrief}\n` : ""}${
    requestedCategory ? `Requested category: ${requestedCategory}\n` : ""
  }${requestedType ? `Requested type: ${requestedType}\n` : ""}
Generate five candidate concepts now.`;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    if (!body.brand) {
      return NextResponse.json({ error: "brand is required" }, { status: 400 });
    }
    const client = getClaudeClient();
    const completion = await client.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 1800,
      temperature: 0.85,
      system: SYSTEM,
      messages: [{ role: "user", content: buildUserPrompt(body) }],
    });
    const text = completion.content
      .filter((b) => b.type === "text")
      .map((b) => ("text" in b ? b.text : ""))
      .join("\n")
      .trim();
    const json = extractJson(text);
    const parsed = JSON.parse(json) as { concepts?: CandidateConcept[] };
    const concepts = Array.isArray(parsed.concepts) ? parsed.concepts : [];
    if (concepts.length === 0) {
      throw new Error("Claude returned no concepts.");
    }
    return NextResponse.json({ concepts });
  } catch (err: unknown) {
    console.error("[/api/ideate]", err);
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
