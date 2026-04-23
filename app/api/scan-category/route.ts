import { NextResponse } from "next/server";
import { DEFAULT_MODEL, getClaudeClient } from "@/lib/claude";
import type { Brand, CategoryScan } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Body {
  brand: Brand;
}

const SYSTEM = `You are a distinctive brand asset strategist. Given a category, you identify the visual, verbal, auditory and scenic CONVENTIONS that brands in this category already use. These are "category codes" — shortcuts that say "I belong to this category" but do NOT say "I am brand X".

A brand that wants to be distinctive should typically AVOID these codes (or deliberately INVERT them).

Produce a JSON object:
{
  "summary": "One concise paragraph (2-3 sentences) describing the current sea-of-sameness in this category.",
  "codes": {
    "visual": [ { "cue": "short name", "usedBy": ["brand1","brand2"], "explanation": "why it became a convention", "recommendation": "avoid" | "acknowledge" | "invert" } ],
    "verbal":  [ ... ],
    "auditory": [ ... ],
    "scenic":  [ ... ]
  },
  "openZones": ["2-5 bullet points: zones in this category that are underused and therefore opportunities for distinctiveness."]
}

Rules:
- 3-6 codes per category. If you have fewer confident examples, that's fine — quality > quantity.
- "usedBy" should contain recognisable competitor names when you know them; otherwise use archetype descriptions like "most challenger brands".
- Keep explanations short and concrete.
- No preamble, no markdown, JSON only.`;

function buildUser(brand: Brand) {
  return `Category: ${brand.category}
Representative brands: ${brand.name}, ${(brand.competitors ?? []).join(", ") || "—"}
Brand we're scanning FOR: ${brand.name}

Produce the category-code scan now.`;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    if (!body.brand?.category) {
      return NextResponse.json(
        { error: "brand.category is required" },
        { status: 400 }
      );
    }
    const client = getClaudeClient();
    const completion = await client.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 1800,
      temperature: 0.5,
      system: SYSTEM,
      messages: [{ role: "user", content: buildUser(body.brand) }],
    });
    const text = completion.content
      .filter((b) => b.type === "text")
      .map((b) => ("text" in b ? b.text : ""))
      .join("\n")
      .trim();
    const json = extractJson(text);
    const parsed = JSON.parse(json) as Partial<CategoryScan>;

    const result: CategoryScan = {
      scannedAt: new Date().toISOString(),
      category: body.brand.category,
      competitors: body.brand.competitors ?? [],
      codes: {
        visual: parsed.codes?.visual ?? [],
        verbal: parsed.codes?.verbal ?? [],
        auditory: parsed.codes?.auditory ?? [],
        scenic: parsed.codes?.scenic ?? [],
      },
      summary: parsed.summary ?? "",
      openZones: parsed.openZones ?? [],
    };

    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("[/api/scan-category]", err);
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
