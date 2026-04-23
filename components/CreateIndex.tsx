"use client";

import Link from "next/link";
import { ArrowRight, Beaker, Microscope, Plus, Sparkles } from "lucide-react";
import { useBrands } from "@/lib/useBrands";
import type { Brand } from "@/lib/types";

export function CreateIndex() {
  const { demoBrands, userBrands } = useBrands();
  const all = [...userBrands, ...demoBrands];

  return (
    <div className="space-y-10">
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-serif text-xl">Pick a brand to work on</h2>
          <Link href="/audit/new" className="btn-primary text-xs">
            <Plus className="h-3.5 w-3.5" /> New brand
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {all.map((b) => (
            <BrandCard key={b.id} brand={b} />
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <ToolCard
          icon={<Microscope className="h-5 w-5" />}
          title="Category-code scanner"
          body="Find the visual, verbal, auditory and scenic codes your category already uses — so you can avoid or invert them."
        />
        <ToolCard
          icon={<Sparkles className="h-5 w-5" />}
          title="Ideation engine"
          body="Claude generates 5 distinct candidate assets per round, with distinctiveness hypothesis, execution notes and honest risks."
        />
        <ToolCard
          icon={<Beaker className="h-5 w-5" />}
          title="Stress test + brief"
          body="Push a candidate through a competitor check, then generate a copy-ready creative brief with mandatories and guardrails."
        />
      </section>
    </div>
  );
}

function BrandCard({ brand }: { brand: Brand }) {
  const candidates = brand.candidates?.length ?? 0;
  return (
    <article className="card flex flex-col gap-3">
      <div className="flex items-center gap-2">
        {brand.isDemo ? (
          <span className="chip">
            <Sparkles className="h-3 w-3" /> Demo
          </span>
        ) : (
          <span className="chip border-accent-200 bg-accent-50 text-accent-700">
            Your brand
          </span>
        )}
        {candidates > 0 && (
          <span className="chip border-investable/30 bg-investable/10 text-investable">
            {candidates} candidate{candidates === 1 ? "" : "s"}
          </span>
        )}
        {brand.categoryScan && <span className="chip">Scanned</span>}
      </div>
      <div>
        <h3 className="font-serif text-2xl">{brand.name}</h3>
        <p className="text-sm text-ink-600">{brand.category}</p>
      </div>
      <Link
        href={`/create/${brand.id}`}
        className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-full bg-ink-900 px-4 py-2 text-sm font-medium text-white hover:bg-ink-700"
      >
        Open Create <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  );
}

function ToolCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="card">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-100 text-ink-900">
        {icon}
      </div>
      <h3 className="mt-4 text-lg">{title}</h3>
      <p className="mt-1 text-sm text-ink-600">{body}</p>
    </div>
  );
}
