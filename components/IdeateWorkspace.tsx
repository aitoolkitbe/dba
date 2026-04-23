"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  Beaker,
  Check,
  FlaskConical,
  Loader2,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import type {
  AssetCategory,
  AssetType,
  Brand,
  CandidateConcept,
} from "@/lib/types";
import { CATEGORY_META } from "@/lib/types";
import { addCandidates } from "@/lib/storage";
import { cn } from "@/lib/utils";

const TYPES_BY_CATEGORY: Record<AssetCategory, AssetType[]> = {
  visual: [
    "color",
    "logo",
    "symbol",
    "character",
    "celebrity",
    "font_typography",
    "shape_packaging",
    "style_design",
  ],
  verbal: ["tagline", "slogan", "sonic_word", "name_device"],
  auditory: ["jingle", "sound_mnemonic", "voice"],
  scenic: ["scene_setting", "situation"],
};

export function IdeateWorkspace({ brand }: { brand: Brand }) {
  const [category, setCategory] = useState<AssetCategory | "">("");
  const [type, setType] = useState<AssetType | "">("");
  const [gap, setGap] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [concepts, setConcepts] = useState<CandidateConcept[]>([]);
  const [saved, setSaved] = useState<Set<string>>(new Set());

  async function run() {
    setLoading(true);
    setError(null);
    setConcepts([]);
    try {
      const res = await fetch("/api/ideate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand,
          gapBrief: gap || undefined,
          requestedCategory: category || undefined,
          requestedType: type || undefined,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { concepts: CandidateConcept[] };
      setConcepts(data.concepts);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ideation failed");
    } finally {
      setLoading(false);
    }
  }

  function saveConcept(c: CandidateConcept) {
    if (brand.isDemo) {
      alert(
        "The demo brand is read-only. Duplicate it first or add your own brand to save candidates."
      );
      return;
    }
    addCandidates(brand.id, [c], {
      gapBrief: gap || undefined,
      requestedCategory: (category || undefined) as AssetCategory | undefined,
      requestedType: (type || undefined) as AssetType | undefined,
    });
    setSaved((prev) => new Set(prev).add(c.name));
  }

  function saveAll() {
    if (brand.isDemo || concepts.length === 0) return;
    addCandidates(brand.id, concepts, {
      gapBrief: gap || undefined,
      requestedCategory: (category || undefined) as AssetCategory | undefined,
      requestedType: (type || undefined) as AssetType | undefined,
    });
    setSaved(new Set(concepts.map((c) => c.name)));
  }

  const typesForCategory = category ? TYPES_BY_CATEGORY[category] : [];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href={`/create/${brand.id}`}
            className="inline-flex items-center gap-1.5 text-sm text-ink-600 hover:text-ink-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Create
          </Link>
          <h1 className="mt-2 text-4xl">Ideate new assets</h1>
          <p className="mt-2 max-w-prose text-ink-600">
            Claude generates five candidate concepts tailored to{" "}
            <strong>{brand.name}</strong>. Keep the ones that feel right, park
            the rest. No briefing is too vague.
          </p>
        </div>
        <BrandBadge brand={brand} />
      </header>

      {/* Brief card */}
      <div className="card space-y-4">
        <h2 className="font-serif text-xl">The brief</h2>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Asset category (optional)">
            <select
              className="input"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as AssetCategory);
                setType("");
              }}
            >
              <option value="">Any category</option>
              {(Object.keys(CATEGORY_META) as AssetCategory[]).map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_META[c].label} — {CATEGORY_META[c].examples}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Asset type (optional)">
            <select
              className="input"
              value={type}
              disabled={!category}
              onChange={(e) => setType(e.target.value as AssetType)}
            >
              <option value="">Any {category ? "type" : "(select category first)"}</option>
              {typesForCategory.map((t) => (
                <option key={t} value={t}>
                  {t.replace(/_/g, " / ")}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field
          label="What's the gap? (optional)"
          hint="E.g. 'Our packaging has no distinctive shape.' or 'We need something consumers can remember from a podcast ad.'"
        >
          <textarea
            className="input min-h-[90px] resize-y"
            value={gap}
            onChange={(e) => setGap(e.target.value)}
            placeholder="Describe the gap in your own words, or leave blank for a general sweep."
          />
        </Field>

        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-ink-500">
            Ideation uses Claude to produce 5 distinct concepts with rationale
            and risks.
          </p>
          <button onClick={run} disabled={loading} className="btn-primary">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Generating…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Generate 5 concepts
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <TriangleAlert className="h-4 w-4 flex-shrink-0 translate-y-0.5" />
          <div>
            <div className="font-medium">Something went wrong</div>
            <div className="text-red-600">{error}</div>
          </div>
        </div>
      )}

      {loading && (
        <div className="card flex items-center gap-3 text-sm text-ink-600">
          <Loader2 className="h-4 w-4 animate-spin" /> Claude is stress-thinking
          five concepts…
        </div>
      )}

      {/* Results */}
      {concepts.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl">5 candidate concepts</h2>
            {!brand.isDemo && (
              <button
                onClick={saveAll}
                disabled={saved.size === concepts.length}
                className="btn-secondary text-xs"
              >
                {saved.size === concepts.length ? (
                  <>
                    <Check className="h-3.5 w-3.5" /> All saved
                  </>
                ) : (
                  <>Save all 5</>
                )}
              </button>
            )}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {concepts.map((c, i) => (
              <ConceptCard
                key={i}
                concept={c}
                brand={brand}
                saved={saved.has(c.name)}
                onSave={() => saveConcept(c)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ConceptCard({
  concept,
  brand,
  saved,
  onSave,
}: {
  concept: CandidateConcept;
  brand: Brand;
  saved: boolean;
  onSave: () => void;
}) {
  return (
    <article className="card flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <span className="text-4xl leading-none">{concept.visual ?? "◻︎"}</span>
        <div className="min-w-0 flex-1">
          <h3 className="font-serif text-xl leading-tight">{concept.name}</h3>
          <p className="text-xs text-ink-500">
            {CATEGORY_META[concept.category]?.label ?? concept.category} ·{" "}
            {concept.type.replace(/_/g, " / ")}
          </p>
        </div>
      </div>
      <p className="text-sm text-ink-700">{concept.description}</p>

      <div className="rounded-xl bg-ink-50 p-3">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-ink-500">
          <Lightbulb className="h-3 w-3" /> Distinctiveness hypothesis
        </div>
        <p className="mt-1 text-sm italic leading-snug text-ink-800">
          &quot;{concept.distinctiveness_hypothesis}&quot;
        </p>
      </div>

      <div>
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-ink-500">
          <FlaskConical className="h-3 w-3" /> Execution notes
        </div>
        <ul className="mt-1 space-y-1 text-sm">
          {concept.execution_notes.map((n, i) => (
            <li key={i} className="flex gap-2 text-ink-700">
              <span className="mt-2 block h-1 w-1 flex-shrink-0 rounded-full bg-ink-400" />
              <span>{n}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-accent-700">
          <ShieldCheck className="h-3 w-3" /> Honest risks
        </div>
        <ul className="mt-1 space-y-1 text-sm">
          {concept.risks.map((r, i) => (
            <li key={i} className="flex gap-2 text-ink-700">
              <span className="mt-2 block h-1 w-1 flex-shrink-0 rounded-full bg-accent-500" />
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 pt-2">
        {brand.isDemo ? (
          <span className="text-xs text-ink-500">
            Demo brand — candidates aren&apos;t saved.
          </span>
        ) : (
          <button
            onClick={onSave}
            disabled={saved}
            className={cn(
              "btn-secondary text-xs",
              saved && "border-winner/40 bg-winner/10 text-winner"
            )}
          >
            {saved ? (
              <>
                <Check className="h-3.5 w-3.5" /> Saved
              </>
            ) : (
              <>Save as candidate</>
            )}
          </button>
        )}
        <Link
          href={`/create/${brand.id}/stress-test?conceptName=${encodeURIComponent(concept.name)}`}
          className="btn-ghost text-xs"
          title="Stress-test this concept against your competitor set"
        >
          <Beaker className="h-3.5 w-3.5" /> Stress test
        </Link>
      </div>
    </article>
  );
}

function BrandBadge({ brand }: { brand: Brand }) {
  return (
    <div className="rounded-xl border border-ink-200 bg-white p-3 text-xs">
      <div className="label mb-0.5">Brand</div>
      <div className="font-serif text-base">{brand.name}</div>
      <div className="text-ink-500">{brand.category}</div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      {hint && <p className="mt-0.5 text-xs text-ink-500">{hint}</p>}
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
