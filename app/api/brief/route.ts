import { NextResponse } from "next/server";
import { DEFAULT_MODEL, getClaudeClient } from "@/lib/claude";
import type {
  Brand,
  CandidateConcept,
  CreativeBrief,
  StressTestResult,
} from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Body {
  brand: Brand;
  concept: CandidateConcept;
  stressTest?: StressTestResult;
}

const SYSTEM = `You are writing a CREATIVE BRIEF for a distinctive brand asset that will be rolled out across multiple touchpoints.

The brief must protect the distinctiveness of the asset. Writers, designers and agencies will read this; it must be unambiguous.

Return JSON:
{
  "promise": "One-sentence distinctiveness promise — the creative north star.",
  "mandatories": ["Things that MUST be present in every execution."],
  "guardrails": ["Things that MUST NOT happen — specific, operational."],
  "executionExamples": ["3-5 concrete example executions across different touchpoints (ad, packaging, social, retail, etc.)"],
  "usageContexts": ["Where this asset gets used and where it does NOT get used."],
  "markdown": "Full creative brief in Markdown, ready to paste. Include headings: Brand, Distinctiveness promise, Mandatories, Guardrails, Example executions, Usage contexts."
}

Rules:
- Be specific and directive. No platitudes.
- If stress test flagged issues, the guardrails section must address them explicitly.
- No preamble outside the JSON. JSON only.`;

function buildUser(body: Body) {
  const { brand, concept, stressTest } = body;
  const stressSection = stressTest
    ? `\nStress test flagged:\n- Overall risk: ${stressTest.overallRisk}\n- Headline: ${stressTest.headline}\n- Conflicts: ${stressTest.conflicts.map((c) => `${c.competitor} (${c.severity})`).join(", ") || "—"}\n- Category clashes: ${stressTest.categoryCodeClashes.join(" | ") || "—"}\n- Recommendations: ${stressTest.recommendations.join(" | ") || "—"}`
    : "";
  return `Brand: ${brand.name}
Category: ${brand.category}
Positioning: ${brand.positioning ?? "—"}
Competitors: ${(brand.competitors ?? []).join(", ") || "—"}

Concept to brief:
- Name: ${concept.name}
- Category/type: ${concept.category}/${concept.type}
- Description: ${concept.description}
- Distinctiveness hypothesis: ${concept.distinctiveness_hypothesis}
- Execution notes: ${concept.execution_notes.join(" | ")}
- Risks: ${concept.risks.join(" | ")}
${stressSection}

Write the creative brief now.`;
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
      max_tokens: 2000,
      temperature: 0.55,
      system: SYSTEM,
      messages: [{ role: "user", content: buildUser(body) }],
    });
    const text = completion.content
      .filter((b) => b.type === "text")
      .map((b) => ("text" in b ? b.text : ""))
      .join("\n")
      .trim();
    const json = extractJson(text);
    const parsed = JSON.parse(json) as Partial<CreativeBrief>;
    const brief: CreativeBrief = {
      promise: parsed.promise ?? "",
      mandatories: parsed.mandatories ?? [],
      guardrails: parsed.guardrails ?? [],
      executionExamples: parsed.executionExamples ?? [],
      usageContexts: parsed.usageContexts ?? [],
      markdown: parsed.markdown ?? "",
    };
    return NextResponse.json(brief);
  } catch (err: unknown) {
    console.error("[/api/brief]", err);
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
