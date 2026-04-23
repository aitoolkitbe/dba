"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Beaker,
  Check,
  Copy,
  FileText,
  Loader2,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import type {
  AssetCandidate,
  Brand,
  CandidateConcept,
  CreativeBrief,
  StressTestResult,
} from "@/lib/types";
import {
  setCandidateBrief,
  setCandidateStressTest,
} from "@/lib/storage";
import { cn } from "@/lib/utils";

const RISK_STYLE: Record<StressTestResult["overallRisk"], string> = {
  low: "border-winner/40 bg-winner/10 text-winner",
  medium: "border-amber-300 bg-amber-50 text-amber-700",
  high: "border-red-300 bg-red-50 text-red-700",
};

export function StressTestWorkspace({ brand }: { brand: Brand }) {
  const params = useSearchParams();
  const preselectedName = params.get("conceptName") ?? undefined;

  const candidates = useMemo(() => brand.candidates ?? [], [brand.candidates]);
  const preselected = candidates.find(
    (c) =>
      c.concept.name === preselectedName || c.id === preselectedName
  );

  const [selectedId, setSelectedId] = useState<string | undefined>(
    preselected?.id ?? candidates[0]?.id
  );
  const selected = candidates.find((c) => c.id === selectedId);

  const [stressLoading, setStressLoading] = useState(false);
  const [briefLoading, setBriefLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localStress, setLocalStress] = useState<StressTestResult | undefined>(
    undefined
  );
  const [localBrief, setLocalBrief] = useState<CreativeBrief | undefined>(
    undefined
  );

  const activeStress = selected?.stressTest ?? localStress;
  const activeBrief = selected?.brief ?? localBrief;

  async function runStressTest(concept: CandidateConcept, candidateId?: string) {
    setStressLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stress-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand,
          concept,
          categoryScan: brand.categoryScan,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as StressTestResult;
      setLocalStress(data);
      if (candidateId && !brand.isDemo) {
        setCandidateStressTest(brand.id, candidateId, data);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Stress test failed");
    } finally {
      setStressLoading(false);
    }
  }

  async function runBrief(
    concept: CandidateConcept,
    stressTest?: StressTestResult,
    candidateId?: string
  ) {
    setBriefLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand, concept, stressTest }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as CreativeBrief;
      setLocalBrief(data);
      if (candidateId && !brand.isDemo) {
        setCandidateBrief(brand.id, candidateId, data);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Brief generation failed");
    } finally {
      setBriefLoading(false);
    }
  }

  /* --------------------------- render --------------------------- */

  if (candidates.length === 0) {
    return (
      <div className="space-y-6">
        <Link
          href={`/create/${brand.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-ink-600 hover:text-ink-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Create
        </Link>
        <div className="card border-dashed text-center">
          <h2 className="font-serif text-2xl">No candidates to test yet</h2>
          <p className="mt-2 text-sm text-ink-600">
            Save at least one candidate from the Ideation engine before stress
            testing.
          </p>
          <Link
            href={`/create/${brand.id}/ideate`}
            className="btn-primary mt-4 inline-flex"
          >
            <Sparkles className="h-4 w-4" /> Open Ideate
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <Link
          href={`/create/${brand.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-ink-600 hover:text-ink-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Create
        </Link>
        <h1 className="mt-2 text-4xl">Stress test &amp; brief</h1>
        <p className="mt-2 max-w-prose text-ink-600">
          Push a candidate through an honest competitive check. When you&apos;re
          confident, generate the creative brief that goes to the agency.
        </p>
      </header>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <TriangleAlert className="h-4 w-4 flex-shrink-0 translate-y-0.5" />
          <div>{error}</div>
        </div>
      )}

      <section className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        {/* Candidates list */}
        <aside className="card !p-0 overflow-hidden">
          <div className="border-b border-ink-200 p-4">
            <h2 className="font-serif text-xl">Candidates</h2>
            <p className="text-xs text-ink-500">
              Pick one to stress-test and brief.
            </p>
          </div>
          <ul className="divide-y divide-ink-200">
            {candidates.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => {
                    setSelectedId(c.id);
                    setLocalStress(undefined);
                    setLocalBrief(undefined);
                  }}
                  className={cn(
                    "flex w-full items-start gap-3 p-4 text-left transition",
                    selectedId === c.id
                      ? "bg-ink-900 text-white"
                      : "hover:bg-ink-50"
                  )}
                >
                  <span className="text-2xl">{c.concept.visual ?? "◻︎"}</span>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{c.concept.name}</div>
                    <div
                      className={cn(
                        "text-xs",
                        selectedId === c.id ? "text-ink-300" : "text-ink-500"
                      )}
                    >
                      {c.concept.category}/{c.concept.type}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-0.5 text-[10px]">
                    {c.stressTest && (
                      <span className={cn("rounded-full border px-1.5 py-0.5 uppercase font-bold", RISK_STYLE[c.stressTest.overallRisk])}>
                        {c.stressTest.overallRisk}
                      </span>
                    )}
                    {c.brief && (
                      <span className="rounded-full border border-investable/40 bg-investable/10 px-1.5 py-0.5 font-bold uppercase text-investable">
                        briefed
                      </span>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Detail + actions */}
        <div className="space-y-4">
          {selected && (
            <CandidatePanel
              candidate={selected}
              brand={brand}
              stress={activeStress}
              brief={activeBrief}
              stressLoading={stressLoading}
              briefLoading={briefLoading}
              onRunStress={() =>
                runStressTest(selected.concept, selected.id)
              }
              onRunBrief={() =>
                runBrief(selected.concept, activeStress, selected.id)
              }
            />
          )}
        </div>
      </section>
    </div>
  );
}

function CandidatePanel({
  candidate,
  brand,
  stress,
  brief,
  stressLoading,
  briefLoading,
  onRunStress,
  onRunBrief,
}: {
  candidate: AssetCandidate;
  brand: Brand;
  stress?: StressTestResult;
  brief?: CreativeBrief;
  stressLoading: boolean;
  briefLoading: boolean;
  onRunStress: () => void;
  onRunBrief: () => void;
}) {
  const { concept } = candidate;
  const [copied, setCopied] = useState(false);

  function copy(text: string) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }

  return (
    <div className="space-y-4">
      {/* Concept header */}
      <div className="card">
        <div className="flex items-start gap-3">
          <span className="text-4xl leading-none">
            {concept.visual ?? "◻︎"}
          </span>
          <div>
            <h2 className="font-serif text-2xl">{concept.name}</h2>
            <p className="text-xs text-ink-500">
              {concept.category}/{concept.type} · Brand: {brand.name}
            </p>
            <p className="mt-3 text-sm text-ink-700">{concept.description}</p>
            <p className="mt-2 text-xs italic text-ink-600">
              &quot;{concept.distinctiveness_hypothesis}&quot;
            </p>
          </div>
        </div>
      </div>

      {/* Stress test */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg inline-flex items-center gap-2">
            <Beaker className="h-4 w-4" /> Stress test
          </h3>
          <button
            onClick={onRunStress}
            disabled={stressLoading}
            className="btn-secondary text-xs"
          >
            {stressLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Testing…
              </>
            ) : stress ? (
              <>Re-run test</>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" /> Run stress test
              </>
            )}
          </button>
        </div>

        {!stress && !stressLoading && (
          <p className="rounded-xl border border-dashed border-ink-200 p-4 text-xs text-ink-500">
            Check this candidate against your competitor set and category
            codes. Takes ~10 seconds.
          </p>
        )}

        {stress && (
          <div className="space-y-4">
            <div
              className={cn(
                "rounded-xl border px-4 py-3",
                RISK_STYLE[stress.overallRisk]
              )}
            >
              <div className="text-[10px] font-bold uppercase tracking-[0.2em]">
                Overall risk · {stress.overallRisk}
              </div>
              <p className="mt-1 font-serif text-lg">{stress.headline}</p>
            </div>

            {stress.conflicts.length > 0 && (
              <Subsection label="Competitor conflicts">
                <ul className="space-y-2">
                  {stress.conflicts.map((c, i) => (
                    <li
                      key={i}
                      className="rounded-xl border border-ink-200 bg-white p-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{c.competitor}</span>
                        <span
                          className={cn(
                            "rounded-full border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                            RISK_STYLE[c.severity]
                          )}
                        >
                          {c.severity}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-ink-700">{c.reason}</p>
                    </li>
                  ))}
                </ul>
              </Subsection>
            )}

            {stress.categoryCodeClashes.length > 0 && (
              <Subsection label="Category code clashes">
                <BulletList items={stress.categoryCodeClashes} />
              </Subsection>
            )}

            {stress.legalFlags && stress.legalFlags.length > 0 && (
              <Subsection label="Legal / dilution flags">
                <BulletList items={stress.legalFlags} accent="accent" />
              </Subsection>
            )}

            <Subsection label="Recommendations">
              <BulletList items={stress.recommendations} accent="winner" />
            </Subsection>
          </div>
        )}
      </div>

      {/* Brief */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg inline-flex items-center gap-2">
            <FileText className="h-4 w-4" /> Creative brief
          </h3>
          <div className="flex items-center gap-2">
            {brief?.markdown && (
              <button
                className="btn-ghost text-xs"
                onClick={() => copy(brief.markdown)}
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" /> Copy markdown
                  </>
                )}
              </button>
            )}
            <button
              onClick={onRunBrief}
              disabled={briefLoading}
              className="btn-secondary text-xs"
            >
              {briefLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Writing…
                </>
              ) : brief ? (
                <>Re-generate</>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" /> Generate brief
                </>
              )}
            </button>
          </div>
        </div>

        {!brief && !briefLoading && (
          <p className="rounded-xl border border-dashed border-ink-200 p-4 text-xs text-ink-500">
            Once stress test looks OK, generate a full creative brief with
            mandatories, guardrails, execution examples and a copy-ready
            markdown version.
          </p>
        )}

        {brief && (
          <div className="space-y-4">
            <div className="rounded-xl bg-ink-900 p-4 text-ink-100">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-400">
                <ShieldCheck className="h-3 w-3" /> Distinctiveness promise
              </div>
              <p className="mt-1 font-serif text-lg text-white">
                {brief.promise}
              </p>
            </div>

            {brief.mandatories.length > 0 && (
              <Subsection label="Mandatories — always">
                <BulletList items={brief.mandatories} accent="winner" />
              </Subsection>
            )}
            {brief.guardrails.length > 0 && (
              <Subsection label="Guardrails — never">
                <BulletList items={brief.guardrails} accent="accent" />
              </Subsection>
            )}
            {brief.executionExamples.length > 0 && (
              <Subsection label="Example executions">
                <BulletList items={brief.executionExamples} />
              </Subsection>
            )}
            {brief.usageContexts.length > 0 && (
              <Subsection label="Usage contexts">
                <BulletList items={brief.usageContexts} />
              </Subsection>
            )}

            {brief.markdown && (
              <details className="rounded-xl border border-ink-200 bg-ink-50 p-3">
                <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-ink-700">
                  Markdown export
                </summary>
                <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap rounded-lg bg-white p-3 text-xs text-ink-700">
                  {brief.markdown}
                </pre>
              </details>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Subsection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="label mb-2">{label}</div>
      {children}
    </div>
  );
}

function BulletList({
  items,
  accent = "ink",
}: {
  items: string[];
  accent?: "ink" | "winner" | "accent";
}) {
  const dot =
    accent === "winner"
      ? "bg-winner"
      : accent === "accent"
        ? "bg-accent-500"
        : "bg-ink-400";
  return (
    <ul className="space-y-2">
      {items.map((b, i) => (
        <li key={i} className="flex gap-2 text-sm text-ink-700">
          <span className={cn("mt-2 block h-1 w-1 flex-shrink-0 rounded-full", dot)} />
          <span>{b}</span>
        </li>
      ))}
    </ul>
  );
}
