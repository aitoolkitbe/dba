"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Beaker,
  Check,
  Microscope,
  Radar,
  Sparkles,
  Trash2,
} from "lucide-react";
import type { Brand } from "@/lib/types";
import { CATEGORY_META } from "@/lib/types";
import { removeCandidate } from "@/lib/storage";
import { cn } from "@/lib/utils";

export function BrandCreateHub({ brand }: { brand: Brand }) {
  const candidates = brand.candidates ?? [];
  const scanned = !!brand.categoryScan;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/create"
            className="inline-flex items-center gap-1.5 text-sm text-ink-600 hover:text-ink-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All brands
          </Link>
          <h1 className="mt-2 text-4xl">Create for {brand.name}</h1>
          <p className="mt-2 max-w-prose text-ink-600">
            Three tools, one workflow: scan the category, ideate candidates,
            stress-test and brief the winners.
          </p>
        </div>
        <Link
          href={`/audit/${brand.id}/results`}
          className="btn-secondary"
        >
          <Radar className="h-4 w-4" /> Open audit
        </Link>
      </header>

      {/* Step 1–3 tools */}
      <section className="grid gap-4 md:grid-cols-3">
        <ToolCard
          step={1}
          title="Category scan"
          icon={<Microscope className="h-5 w-5" />}
          body="Map the codes already owned by your category. Know what to avoid."
          href={`/create/${brand.id}/scan`}
          status={scanned ? "Scanned" : "Not yet"}
        />
        <ToolCard
          step={2}
          title="Ideate"
          icon={<Sparkles className="h-5 w-5" />}
          body="Claude generates 5 distinct candidate assets per round."
          href={`/create/${brand.id}/ideate`}
          status={`${candidates.length} candidate${candidates.length === 1 ? "" : "s"}`}
        />
        <ToolCard
          step={3}
          title="Stress test & brief"
          icon={<Beaker className="h-5 w-5" />}
          body="Honest competitor check, then a copy-ready creative brief."
          href={`/create/${brand.id}/stress-test`}
          status={
            candidates.some((c) => c.brief)
              ? "Brief ready"
              : candidates.some((c) => c.stressTest)
                ? "Tests run"
                : "Nothing yet"
          }
        />
      </section>

      {/* Brand snapshot */}
      <section className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-xl">Brand snapshot</h2>
          {brand.isDemo && (
            <span className="chip">
              <Sparkles className="h-3 w-3" /> Demo — read-only
            </span>
          )}
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Snapshot label="Category" value={brand.category} />
          <Snapshot
            label="Competitors"
            value={(brand.competitors ?? []).join(", ") || "—"}
          />
          <Snapshot
            label="Current assets"
            value={`${brand.assets.length} tracked`}
          />
        </div>
      </section>

      {/* Candidates gallery */}
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-serif text-xl">Candidate pool</h2>
          <Link href={`/create/${brand.id}/ideate`} className="btn-ghost text-xs">
            <Sparkles className="h-3.5 w-3.5" /> Generate more
          </Link>
        </div>
        {candidates.length === 0 ? (
          <div className="card border-dashed text-center">
            <p className="text-sm text-ink-600">
              No candidates yet. Run the Ideation engine to produce five at
              once.
            </p>
            <Link
              href={`/create/${brand.id}/ideate`}
              className="btn-primary mt-4 inline-flex text-xs"
            >
              <Sparkles className="h-3.5 w-3.5" /> Ideate
            </Link>
          </div>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {candidates.map((c) => (
              <li
                key={c.id}
                className="card flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{c.concept.visual ?? "◻︎"}</span>
                  <div className="min-w-0">
                    <div className="font-serif text-lg">{c.concept.name}</div>
                    <div className="text-xs text-ink-500">
                      {CATEGORY_META[c.concept.category]?.label} ·{" "}
                      {c.concept.type.replace(/_/g, " / ")}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {c.stressTest && (
                        <span
                          className={cn(
                            "chip",
                            c.stressTest.overallRisk === "low"
                              ? "border-winner/30 bg-winner/10 text-winner"
                              : c.stressTest.overallRisk === "medium"
                                ? "border-amber-300 bg-amber-50 text-amber-700"
                                : "border-red-300 bg-red-50 text-red-700"
                          )}
                        >
                          <Check className="h-3 w-3" /> Tested · {c.stressTest.overallRisk}
                        </span>
                      )}
                      {c.brief && (
                        <span className="chip border-investable/30 bg-investable/10 text-investable">
                          Briefed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <Link
                    href={`/create/${brand.id}/stress-test?conceptName=${encodeURIComponent(c.concept.name)}`}
                    className="btn-ghost text-xs"
                  >
                    Open <ArrowRight className="h-3 w-3" />
                  </Link>
                  {!brand.isDemo && (
                    <button
                      onClick={() => {
                        if (confirm(`Remove "${c.concept.name}" from the candidate pool?`)) {
                          removeCandidate(brand.id, c.id);
                        }
                      }}
                      className="rounded-lg p-1 text-ink-400 hover:bg-ink-100 hover:text-red-600"
                      aria-label="Remove candidate"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function ToolCard({
  step,
  title,
  icon,
  body,
  href,
  status,
}: {
  step: number;
  title: string;
  icon: React.ReactNode;
  body: string;
  href: string;
  status: string;
}) {
  return (
    <Link href={href} className="card group flex flex-col gap-3 transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-900 text-white">
          {icon}
        </div>
        <span className="chip">{status}</span>
      </div>
      <div>
        <div className="label">Step {step}</div>
        <h3 className="mt-0.5 text-lg">{title}</h3>
        <p className="mt-1 text-sm text-ink-600">{body}</p>
      </div>
      <div className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-ink-900 transition group-hover:gap-2.5">
        Open <ArrowRight className="h-4 w-4" />
      </div>
    </Link>
  );
}

function Snapshot({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="label">{label}</div>
      <div className="mt-1 text-sm text-ink-800">{value}</div>
    </div>
  );
}

