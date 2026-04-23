"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  Check,
  Loader2,
  Microscope,
  RefreshCw,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import type { AssetCategory, Brand, CategoryCode, CategoryScan } from "@/lib/types";
import { CATEGORY_META } from "@/lib/types";
import { setCategoryScan as persistScan } from "@/lib/storage";
import { cn } from "@/lib/utils";

const RECO_STYLE: Record<CategoryCode["recommendation"], { label: string; className: string }> = {
  avoid: {
    label: "Avoid",
    className: "border-red-300 bg-red-50 text-red-700",
  },
  acknowledge: {
    label: "Acknowledge",
    className: "border-amber-300 bg-amber-50 text-amber-700",
  },
  invert: {
    label: "Invert",
    className: "border-investable/40 bg-investable/10 text-investable",
  },
};

export function CategoryScanWorkspace({ brand }: { brand: Brand }) {
  const [scan, setScan] = useState<CategoryScan | undefined>(brand.categoryScan);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/scan-category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as CategoryScan;
      setScan(data);
      if (!brand.isDemo) persistScan(brand.id, data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Scan failed");
    } finally {
      setLoading(false);
    }
  }

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
          <h1 className="mt-2 text-4xl">Category-code scan</h1>
          <p className="mt-2 max-w-prose text-ink-600">
            Which conventions does your category already use? These are the
            sea-of-sameness cues to avoid — or deliberately invert — when
            designing new distinctive assets.
          </p>
        </div>
        <div className="rounded-xl border border-ink-200 bg-white p-3 text-xs">
          <div className="label mb-0.5">Category</div>
          <div className="font-serif text-base">{brand.category}</div>
          <div className="text-ink-500">
            vs. {(brand.competitors ?? ["—"]).join(", ")}
          </div>
        </div>
      </header>

      <div className="flex items-center justify-between gap-3">
        <div className="text-xs text-ink-500">
          {scan ? (
            <>
              Last scanned{" "}
              {new Date(scan.scannedAt).toLocaleString()}{" "}
              {brand.isDemo && "— demo brand, results not persisted"}
            </>
          ) : (
            "No scan yet"
          )}
        </div>
        <button onClick={run} disabled={loading} className="btn-primary">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Scanning…
            </>
          ) : scan ? (
            <>
              <RefreshCw className="h-4 w-4" /> Re-scan
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" /> Run category scan
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <TriangleAlert className="h-4 w-4 flex-shrink-0 translate-y-0.5" />
          <div>
            <div className="font-medium">Scan failed</div>
            <div className="text-red-600">{error}</div>
          </div>
        </div>
      )}

      {!scan && !loading && (
        <div className="card flex items-start gap-4 border-dashed">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-ink-100 text-ink-900">
            <Microscope className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg">Run your first scan</h3>
            <p className="mt-1 text-sm text-ink-600">
              Claude maps the visual, verbal, auditory and scenic cues already
              owned — collectively — by brands in your category. You&apos;ll
              see where the open zones are.
            </p>
          </div>
        </div>
      )}

      {scan && (
        <div className="space-y-6">
          <div className="card bg-ink-900 text-ink-100">
            <div className="chip mb-3 border-ink-700 bg-ink-800 text-ink-100">
              <Sparkles className="h-3 w-3" /> Sea-of-sameness summary
            </div>
            <p className="font-serif text-lg leading-relaxed text-white">
              {scan.summary}
            </p>
          </div>

          {scan.openZones.length > 0 && (
            <div className="card">
              <div className="chip mb-3 border-winner/30 bg-winner/10 text-winner">
                <Check className="h-3 w-3" /> Open zones
              </div>
              <ul className="space-y-2">
                {scan.openZones.map((z, i) => (
                  <li key={i} className="flex gap-2 text-sm text-ink-700">
                    <span className="mt-2 block h-1 w-1 flex-shrink-0 rounded-full bg-winner" />
                    <span>{z}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(Object.keys(CATEGORY_META) as AssetCategory[]).map((cat) => {
            const codes = scan.codes[cat];
            if (!codes || codes.length === 0) return null;
            return (
              <section key={cat} className="card">
                <div className="label mb-3">
                  {CATEGORY_META[cat].label} codes
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {codes.map((c, i) => (
                    <CodeCard key={i} code={c} />
                  ))}
                </div>
              </section>
            );
          })}

          <div className="card flex items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-lg">Turn codes into ideas</h3>
              <p className="text-sm text-ink-600">
                Now that you know what to avoid — or invert — use the Ideation
                engine to produce distinct asset candidates.
              </p>
            </div>
            <Link href={`/create/${brand.id}/ideate`} className="btn-primary">
              <Sparkles className="h-4 w-4" /> Open Ideate
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function CodeCard({ code }: { code: CategoryCode }) {
  const style = RECO_STYLE[code.recommendation] ?? RECO_STYLE.avoid;
  return (
    <div className="rounded-xl border border-ink-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <h4 className="font-serif text-base">{code.cue}</h4>
        <span
          className={cn(
            "rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
            style.className
          )}
        >
          {style.label}
        </span>
      </div>
      <p className="mt-1 text-xs text-ink-600">{code.explanation}</p>
      {code.usedBy.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {code.usedBy.map((b) => (
            <span key={b} className="chip text-[10px]">
              {b}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
