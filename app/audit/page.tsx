import Link from "next/link";
import { ArrowRight, Radar, Sparkles } from "lucide-react";
import { DEMO_BRANDS } from "@/lib/demo-brands";
import { ModeSwitch } from "@/components/ModeSwitch";

export default function AuditIndex() {
  return (
    <div className="space-y-10 pt-6">
      <header className="flex items-start justify-between gap-6">
        <div>
          <div className="chip mb-3">
            <Radar className="h-3 w-3" />
            Audit module
          </div>
          <h1 className="text-4xl">Start a Distinctive Brand Asset audit</h1>
          <p className="mt-3 max-w-prose text-ink-600">
            Pick a demo brand to see the full workflow, or start from scratch. In the
            audit you&apos;ll list candidate assets, enter (or estimate) fame and
            uniqueness scores, and see every asset plotted on the Fame × Uniqueness
            grid with a strategic recommendation per asset.
          </p>
        </div>
        <ModeSwitch compact />
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {DEMO_BRANDS.map((brand) => (
          <Link
            key={brand.id}
            href={`/audit/${brand.id}/results`}
            className="group card flex flex-col gap-4 transition hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="chip">
                <Sparkles className="h-3 w-3" /> Demo
              </span>
              <span className="text-xs text-ink-500">
                {brand.assets.length} assets · {brand.category}
              </span>
            </div>
            <div>
              <h3 className="text-2xl">{brand.name}</h3>
              <p className="mt-1 text-sm text-ink-600">{brand.positioning}</p>
            </div>
            <div className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-ink-900 transition group-hover:gap-2.5">
              Open audit <ArrowRight className="h-4 w-4" />
            </div>
          </Link>
        ))}

        <div className="card flex flex-col gap-4 border-dashed">
          <div className="flex items-center justify-between">
            <span className="chip">Blank</span>
            <span className="text-xs text-ink-500">Your own brand</span>
          </div>
          <div>
            <h3 className="text-2xl">Start from scratch</h3>
            <p className="mt-1 text-sm text-ink-600">
              Coming in the next iteration: a step-by-step wizard to build your asset
              inventory, choose a scoring approach (research or estimate), and export
              the full audit as a PDF.
            </p>
          </div>
          <div className="mt-auto text-sm text-ink-400">Available in iteration 2</div>
        </div>
      </section>

      <section className="card">
        <h2 className="text-xl">How the audit works</h2>
        <ol className="mt-4 grid gap-4 text-sm md:grid-cols-4">
          <Step n={1} title="Inventory" body="List every candidate asset across visual, verbal, auditory and scenic categories." />
          <Step n={2} title="Score" body="Enter fame and uniqueness — from research if you have it, from an informed estimate otherwise." />
          <Step n={3} title="Grid" body="Every asset lands in one of four quadrants: winner, investable, taxi or ignorable." />
          <Step n={4} title="Act" body="Get a strategic recommendation per asset — build, maintain, investigate or drop." />
        </ol>
      </section>
    </div>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <li className="relative rounded-xl border border-ink-200 bg-ink-50 p-4">
      <div className="absolute -top-3 left-4 flex h-6 w-6 items-center justify-center rounded-full bg-ink-900 text-[11px] font-bold text-white">
        {n}
      </div>
      <div className="pt-1 font-serif text-base">{title}</div>
      <p className="mt-1 text-xs text-ink-600 leading-relaxed">{body}</p>
    </li>
  );
}
