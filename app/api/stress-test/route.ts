import { NextResponse } from "next/server";
import { DEFAULT_MODEL, getClaudeClient } from "@/lib/claude";
import type {
  Brand,
  CandidateConcept,
  CategoryScan,
  StressTestResult,
} from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Body {
  brand: Brand;
  concept: CandidateConcept;
  categoryScan?: CategoryScan;
}

const SYSTEM = `You are a distinctive brand asset strategist performing a STRESS TEST on a proposed candidate asset.

Your job: honestly assess whether this concept can actually become a Distinctive Brand Asset, or whether it collides with existing competitor assets, category codes, or legal/dilution risks.

Be honest. If it's weak, say so.

Return JSON:
{
  "overallRisk": "low" | "medium" | "high",
  "headline": "one-sentence verdict (max 16 words)",
  "conflicts": [
    { "competitor": "brand name", "severity": "low" | "medium" | "high", "reason": "what clashes and why" }
  ],
  "categoryCodeClashes": ["3-5 bullets. Empty array if none."],
  "legalFlags": ["trademark / dilution / confusion concerns. Empty array if none."],
  "recommendations": ["3-5 concrete, imperative bullets to improve distinctiveness or mitigate risks."]
}

Rules:
- No preamble, no markdown, JSON only.
- Severity calibration: "high" means an identical or near-identical asset is already owned by a competitor.
- If overallRisk is "low", say so clearly and suggest how to protect the asset, not how to redesign it.`;

function buildUser(body: Body) {
  const { brand, concept, categoryScan } = body;
  const codesSection = categoryScan
    ? `\nKnown category codes:\n${Object.entries(categoryScan.codes)
        .flatMap(([cat, codes]) =>
          codes.map((c) => `- [${cat}] ${c.cue} — used by ${c.usedBy.join(", ") || "many"}`)
        )
        .join("\n")}`
    : "";

  return `Brand under review: ${brand.name}
Category: ${brand.category}
Positioning: ${brand.positioning ?? "—"}
Competitors: ${(brand.competitors ?? []).join(", ") || "—"}

Brand's existing assets:
${brand.assets.map((a) => `- ${a.name} (${a.type})`).join("\n") || "—"}
${codesSection}

Candidate asset under stress test:
- Name: ${concept.name}
- Category/type: ${concept.category}/${concept.type}
- Description: ${concept.description}
- Distinctiveness hypothesis: ${concept.distinctiveness_hypothesis}

Produce the stress test now.`;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    if (!body.brand || !body.concept) {
      return NextResponse.json(
        { error: "brand and concept are required" },
        { status: 400 }
      );
    }
    const client = getClaudeClient();
    const completion = await client.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 1200,
      temperature: 0.4,
      system: SYSTEM,
      messages: [{ role: "user", content: buildUser(body) }],
    });
    const text = completion.content
      .filter((b) => b.type === "text")
      .map((b) => ("text" in b ? b.text : ""))
      .join("\n")
      .trim();
    const json = extractJson(text);
    const parsed = JSON.parse(json) as Partial<StressTestResult>;

    const result: StressTestResult = {
      overallRisk: parsed.overallRisk ?? "medium",
      headline: parsed.headline ?? "Stress test complete.",
      conflicts: parsed.conflicts ?? [],
      categoryCodeClashes: parsed.categoryCodeClashes ?? [],
      legalFlags: parsed.legalFlags ?? [],
      recommendations: parsed.recommendations ?? [],
    };
    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("[/api/stress-test]", err);
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
