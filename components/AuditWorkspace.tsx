"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Brand, DBAAsset, AssetAnalysis } from "@/lib/types";
import { CATEGORY_META, quadrantOf, QUADRANT_META } from "@/lib/types";
import { DBAGrid, quadrantColor } from "./DBAGrid";
import { saveBrand } from "@/lib/storage";
import {
  Loader2,
  RefreshCw,
  Sparkles,
  Target,
  TriangleAlert,
  TrendingUp,
  Archive,
  Hammer,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ScoreMap = Record<string, { fame: number; uniqueness: number }>;

export function AuditWorkspace({ brand }: { brand: Brand }) {
  const [scores, setScores] = useState<ScoreMap>(() =>
    Object.fromEntries(
      brand.assets.map((a) => [
        a.id,
        {
          fame: a.scores?.fame ?? 50,
          uniqueness: a.scores?.uniqueness ?? 50,
        },
      ])
    )
  );
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<string | undefined>(
    brand.assets[0]?.id
  );
  const [analyses, setAnalyses] = useState<Record<string, AssetAnalysis>>({});
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mergedAssets: DBAAsset[] = useMemo(
    () =>
      brand.assets.map((a) => {
        const s = scores[a.id];
        const mergedScores = s
          ? {
              ...a.scores,
              fame: s.fame,
              uniqueness: s.uniqueness,
              source: a.scores?.source ?? "estimate",
            }
          : a.scores;
        return {
          ...a,
          scores: mergedScores as DBAAsset["scores"],
          analysis: analyses[a.id] ?? a.analysis,
        };
      }),
    [brand.assets, scores, analyses]
  );

  const isUserBrand = !brand.isDemo;

  function persistScores() {
    const next: Brand = {
      ...brand,
      assets: brand.assets.map((a) => {
        const s = scores[a.id];
        if (!s) return a;
        return {
          ...a,
          scores: {
            ...(a.scores ?? {}),
            fame: s.fame,
            uniqueness: s.uniqueness,
            source: a.scores?.source ?? "estimate",
          },
        };
      }),
    };
    saveBrand(next);
    setSavedAt(Date.now());
  }

  const selected = mergedAssets.find((a) => a.id === selectedId);

  const counts = useMemo(() => {
    const c = { winner: 0, taxi: 0, investable: 0, ignorable: 0 };
    mergedAssets.forEach((a) => {
      const q = quadrantOf(a.scores);
      if (q) c[q] += 1;
    });
    return c;
  }, [mergedAssets]);

  async function analyze(asset: DBAAsset) {
    setError(null);
    setAnalyzingId(asset.id);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand, asset }),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `Analyse mislukt (${res.status})`);
      }
      const data: AssetAnalysis = await res.json();
      setAnalyses((prev) => ({ ...prev, [asset.id]: data }));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Onbekende fout bij analyse");
    } finally {
      setAnalyzingId(null);
    }
  }

  async function analyzeAll() {
    setBulkLoading(true);
    for (const a of mergedAssets) {
      if (!a.scores) continue;
      if (analyses[a.id]) continue;
      await analyze(a);
    }
    setBulkLoading(false);
  }

  function updateScore(id: string, key: "fame" | "uniqueness", value: number) {
    setScores((prev) => ({
      ...prev,
      [id]: {
        fame: prev[id]?.fame ?? 50,
        uniqueness: prev[id]?.uniqueness ?? 50,
        [key]: Math.max(0, Math.min(100, value)),
      },
    }));
    // If we change scores, invalidate the existing analysis for that asset.
    setAnalyses((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  return (
    <div className="space-y-8">
      {/* Brand header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="chip mb-2">
            <Sparkles className="h-3 w-3" /> Audit workspace
          </div>
          <h1 className="text-4xl">{brand.name}</h1>
          <p className="mt-2 max-w-prose text-sm text-ink-600">
            Category: <span className="font-medium">{brand.category}</span>
            {brand.competitors && (
              <>
                {" "}· Competitors:{" "}
                <span className="font-medium">{brand.competitors.join(", ")}</span>
              </>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isUserBrand && (
            <button onClick={persistScores} className="btn-secondary">
              <Save className="h-4 w-4" />
              {savedAt ? "Saved" : "Save scores"}
            </button>
          )}
          <Link href={`/create/${brand.id}`} className="btn-secondary">
            <Hammer className="h-4 w-4" /> Create module
          </Link>
          <button
            onClick={analyzeAll}
            disabled={bulkLoading}
            className="btn-primary"
          >
            {bulkLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analysing…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Analyse all with Claude
              </>
            )}
          </button>
        </div>
      </header>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <TriangleAlert className="h-4 w-4 flex-shrink-0 translate-y-0.5" />
          <div>
            <div className="font-medium">Er ging iets mis</div>
            <div className="text-red-600">{error}</div>
            <div className="mt-1 text-xs text-red-500">
              Tip: controleer of <code>ANTHROPIC_API_KEY</code> is ingesteld op Vercel
              of in <code>.env.local</code>.
            </div>
          </div>
        </div>
      )}

      {/* Grid + Counts */}
      <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <DBAGrid
          assets={mergedAssets}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        <div className="grid grid-cols-2 gap-3">
          <CountTile
            label="Winners"
            value={counts.winner}
            color="winner"
            icon={<Target className="h-4 w-4" />}
            short={QUADRANT_META.winner.short}
          />
          <CountTile
            label="Investables"
            value={counts.investable}
            color="investable"
            icon={<TrendingUp className="h-4 w-4" />}
            short={QUADRANT_META.investable.short}
          />
          <CountTile
            label="Taxis"
            value={counts.taxi}
            color="taxi"
            icon={<TriangleAlert className="h-4 w-4" />}
            short={QUADRANT_META.taxi.short}
          />
          <CountTile
            label="Ignorables"
            value={counts.ignorable}
            color="ignorable"
            icon={<Archive className="h-4 w-4" />}
            short={QUADRANT_META.ignorable.short}
          />
          <div className="col-span-2 rounded-2xl border border-ink-200 bg-white p-4 text-xs text-ink-600">
            <div className="label mb-1">How to read this grid</div>
            Anything in the top-right corner is already doing brand-building work for
            you. Anything in the top-left has the unique hook, just not the audience.
            Anything in the bottom-right is pulling double duty — known, but not yours
            alone. The bottom-left is freight.
          </div>
        </div>
      </section>

      {/* Assets table + detail panel */}
      <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="card !p-0 overflow-hidden">
          <div className="border-b border-ink-200 p-4">
            <h2 className="font-serif text-xl">Assets</h2>
            <p className="text-xs text-ink-500">
              Click an asset to inspect it. Drag the sliders to model what-if scores.
            </p>
          </div>
          <div className="divide-y divide-ink-200">
            {(["visual", "verbal", "auditory", "scenic"] as const).map((cat) => {
              const items = mergedAssets.filter((a) => a.category === cat);
              if (items.length === 0) return null;
              return (
                <div key={cat} className="p-4">
                  <div className="label mb-2">{CATEGORY_META[cat].label}</div>
                  <ul className="space-y-2">
                    {items.map((a) => (
                      <AssetRow
                        key={a.id}
                        asset={a}
                        active={a.id === selectedId}
                        onSelect={() => setSelectedId(a.id)}
                        onScore={updateScore}
                      />
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detail panel */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          {selected ? (
            <AssetDetail
              asset={selected}
              analysis={analyses[selected.id]}
              analyzing={analyzingId === selected.id}
              onAnalyze={() => analyze(selected)}
            />
          ) : (
            <div className="card text-sm text-ink-500">
              Select an asset to see details.
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}

function CountTile({
  label,
  value,
  color,
  icon,
  short,
}: {
  label: string;
  value: number;
  color: "winner" | "taxi" | "investable" | "ignorable";
  icon: React.ReactNode;
  short: string;
}) {
  return (
    <div
      className="rounded-2xl border bg-white p-4"
      style={{ borderColor: `${quadrantColor(color)}40` }}
    >
      <div
        className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider"
        style={{ color: quadrantColor(color) }}
      >
        {icon}
        {label}
      </div>
      <div className="mt-2 font-serif text-3xl">{value}</div>
      <div className="text-xs text-ink-500">{short}</div>
    </div>
  );
}

function AssetRow({
  asset,
  active,
  onSelect,
  onScore,
}: {
  asset: DBAAsset;
  active: boolean;
  onSelect: () => void;
  onScore: (id: string, key: "fame" | "uniqueness", value: number) => void;
}) {
  const q = quadrantOf(asset.scores);
  return (
    <li>
      <button
        onClick={onSelect}
        className={cn(
          "w-full rounded-xl border p-3 text-left transition",
          active
            ? "border-ink-900 bg-ink-900 text-white"
            : "border-ink-200 bg-white hover:border-ink-400"
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl leading-none">{asset.visual ?? "◻︎"}</span>
            <div>
              <div className="font-medium">{asset.name}</div>
              <div
                className={cn(
                  "text-xs",
                  active ? "text-ink-300" : "text-ink-500"
                )}
              >
                {asset.heritage ?? asset.type}
              </div>
            </div>
          </div>
          {q && (
            <span
              className="chip flex-shrink-0"
              style={{
                borderColor: `${quadrantColor(q)}60`,
                color: quadrantColor(q),
                backgroundColor: active ? "transparent" : "white",
              }}
            >
              {QUADRANT_META[q].label}
            </span>
          )}
        </div>
        {asset.scores && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <ScoreSlider
              label="Fame"
              value={asset.scores.fame}
              onChange={(v) => onScore(asset.id, "fame", v)}
              active={active}
            />
            <ScoreSlider
              label="Uniqueness"
              value={asset.scores.uniqueness}
              onChange={(v) => onScore(asset.id, "uniqueness", v)}
              active={active}
            />
          </div>
        )}
      </button>
    </li>
  );
}

function ScoreSlider({
  label,
  value,
  onChange,
  active,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  active: boolean;
}) {
  return (
    <div>
      <div
        className={cn(
          "flex items-center justify-between text-[10px] font-medium uppercase tracking-wider",
          active ? "text-ink-300" : "text-ink-500"
        )}
      >
        <span>{label}</span>
        <span className="font-mono">{Math.round(value)}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onClick={(e) => e.stopPropagation()}
        className="mt-1 h-1 w-full cursor-pointer appearance-none rounded-full bg-ink-200 accent-ink-900"
      />
    </div>
  );
}

function AssetDetail({
  asset,
  analysis,
  analyzing,
  onAnalyze,
}: {
  asset: DBAAsset;
  analysis?: AssetAnalysis;
  analyzing: boolean;
  onAnalyze: () => void;
}) {
  const q = quadrantOf(asset.scores);
  return (
    <div className="card space-y-5">
      <div className="flex items-start gap-3">
        <span className="text-4xl leading-none">{asset.visual ?? "◻︎"}</span>
        <div>
          <h2 className="text-2xl leading-tight">{asset.name}</h2>
          <p className="text-xs text-ink-500">
            {asset.heritage ?? asset.type} · {asset.category}
          </p>
        </div>
      </div>
      <p className="text-sm text-ink-700 leading-relaxed">{asset.description}</p>

      {asset.scores && q && (
        <div
          className="rounded-xl p-4"
          style={{
            backgroundColor: `${quadrantColor(q)}12`,
            border: `1px solid ${quadrantColor(q)}30`,
          }}
        >
          <div className="flex items-center justify-between">
            <span
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: quadrantColor(q) }}
            >
              {QUADRANT_META[q].label}
            </span>
            <span className="text-xs text-ink-600">
              Fame {Math.round(asset.scores.fame)}% · Uniqueness{" "}
              {Math.round(asset.scores.uniqueness)}%
            </span>
          </div>
          <p className="mt-2 text-xs text-ink-700">
            {QUADRANT_META[q].description}
          </p>
        </div>
      )}

      {/* AI analysis */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg">Strategic recommendation</h3>
          <button
            onClick={onAnalyze}
            disabled={analyzing || !asset.scores}
            className="btn-ghost"
          >
            {analyzing ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Analysing…
              </>
            ) : analysis ? (
              <>
                <RefreshCw className="h-3.5 w-3.5" /> Re-analyse
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" /> Analyse with Claude
              </>
            )}
          </button>
        </div>

        {!analysis && !analyzing && (
          <p className="rounded-xl border border-dashed border-ink-200 p-4 text-xs text-ink-500">
            Ask Claude for a strategic recommendation based on this asset&apos;s
            quadrant position, heritage and category dynamics.
          </p>
        )}

        {analysis && (
          <div className="space-y-3">
            <div className="rounded-xl bg-ink-900 p-4 text-ink-100">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-400">
                {analysis.strategy}
              </div>
              <p className="mt-1 font-serif text-lg text-white">
                {analysis.headline}
              </p>
            </div>
            <ul className="space-y-2">
              {analysis.rationale.map((r, i) => (
                <li key={i} className="flex gap-2 text-sm text-ink-700">
                  <span className="mt-2 block h-1 w-1 flex-shrink-0 rounded-full bg-ink-400" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
            {analysis.actions && analysis.actions.length > 0 && (
              <div>
                <div className="label mb-2">Next actions</div>
                <ul className="space-y-1.5">
                  {analysis.actions.map((a, i) => (
                    <li
                      key={i}
                      className="rounded-lg border border-ink-200 bg-ink-50 px-3 py-2 text-xs text-ink-700"
                    >
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
