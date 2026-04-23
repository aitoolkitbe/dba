import Link from "next/link";
import { ArrowRight, BookOpen, Hammer, Radar, Compass, Sparkles } from "lucide-react";
import { ModeSwitch } from "@/components/ModeSwitch";

export default function Home() {
  return (
    <div className="space-y-16 pt-10">
      {/* Hero */}
      <section className="grid gap-12 md:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="chip mb-5">
            <Sparkles className="h-3 w-3" />
            Built on Byron Sharp &amp; Jenni Romaniuk
          </div>
          <h1 className="text-5xl leading-[1.05] md:text-6xl">
            Make your brand <span className="italic">impossible to confuse</span>.
          </h1>
          <p className="mt-6 max-w-prose text-lg text-ink-600">
            Mental availability is won by assets that trigger <em>your</em> brand in the
            mind of category buyers — and no-one else&apos;s. This workbench helps you
            audit, create and consistently deploy the distinctive assets that do that
            job.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/audit" className="btn-primary">
              Start a DBA audit
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/audit/coca-cola-demo/results" className="btn-secondary">
              See the Coca-Cola demo
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="card space-y-4">
            <div className="label">The Fame × Uniqueness grid</div>
            <Grid />
            <p className="text-xs text-ink-500">
              Every asset you own should sit somewhere on this grid. The quadrant
              dictates the strategy — not the other way around.
            </p>
          </div>
        </div>
      </section>

      {/* Mode selector */}
      <section>
        <ModeSwitch />
      </section>

      {/* Three modules */}
      <section>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-3xl">Three modules, one workflow</h2>
            <p className="mt-1 text-ink-600">
              Audit what you have. Create what you need. Deploy what you own — everywhere,
              consistently.
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <ModuleCard
            href="/audit"
            icon={<Radar className="h-5 w-5" />}
            title="Audit"
            status="Live"
            description="Inventory every candidate asset. Score it on fame and uniqueness. Place it in a quadrant. Get AI-assisted recommendations per asset."
            bullets={[
              "Import demo or start blank",
              "Four asset categories",
              "Live 2×2 Fame × Uniqueness grid",
              "Claude-powered strategic advice",
            ]}
          />
          <ModuleCard
            href="/create"
            icon={<Hammer className="h-5 w-5" />}
            title="Create"
            status="Preview"
            description="Generate new asset candidates that are distinctive from day one — not differentiated, distinct. Test against category codes and competitor sets."
            bullets={[
              "Asset-type idea engine",
              "Category-code diagnostic",
              "Concept stress-tests",
              "Brief generator for creatives",
            ]}
          />
          <ModuleCard
            href="/deploy"
            icon={<Compass className="h-5 w-5" />}
            title="Deploy"
            status="Preview"
            description="Turn winning assets into branded-everything guidelines. Check new creative against consistency rules before it ships."
            bullets={[
              "Channel-by-channel matrix",
              "Consistency self-check",
              "Creative review prompts",
              "Asset health monitor",
            ]}
          />
        </div>
      </section>

      {/* The theory, briefly */}
      <section className="card bg-ink-900 text-ink-100">
        <div className="grid gap-10 md:grid-cols-[1fr_1.5fr]">
          <div>
            <div className="chip border-ink-700 bg-ink-800 text-ink-100">
              <BookOpen className="h-3 w-3" />
              The one idea
            </div>
            <h2 className="mt-4 font-serif text-3xl text-white">
              Brands grow by being <em>easy to notice</em> and <em>easy to buy</em>.
            </h2>
          </div>
          <div className="space-y-4 text-sm leading-relaxed text-ink-200">
            <p>
              Byron Sharp&apos;s research at the Ehrenberg-Bass Institute shows that
              brands grow mainly by reaching more category buyers — not by charming a
              loyal few. To get noticed in a moment of buying, a brand needs to be
              <strong> mentally available</strong>: instantly retrievable when the
              category need arises.
            </p>
            <p>
              Distinctive Brand Assets are the memory shortcuts that make that possible.
              A colour, a character, a contour, a melody — anything that, seen or heard,
              makes category buyers think of you and nobody else.
            </p>
            <p>
              Jenni Romaniuk&apos;s follow-up work gives us the measurement: every asset
              can be scored on <strong>fame</strong> (how many category buyers retrieve
              your brand when prompted) and <strong>uniqueness</strong> (how exclusively
              they retrieve <em>only</em> you). This tool operationalises that.
            </p>
            <Link
              href="/framework"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-300 hover:text-accent-200"
            >
              Read the full framework <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function ModuleCard({
  href,
  icon,
  title,
  description,
  bullets,
  status,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  bullets: string[];
  status: "Live" | "Preview";
}) {
  return (
    <Link href={href} className="group card flex flex-col gap-4 transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-900 text-white">
          {icon}
        </div>
        <span
          className={`chip ${status === "Live" ? "border-winner/30 bg-winner/10 text-winner" : ""}`}
        >
          {status}
        </span>
      </div>
      <div>
        <h3 className="text-xl">{title}</h3>
        <p className="mt-1 text-sm text-ink-600">{description}</p>
      </div>
      <ul className="space-y-1 text-xs text-ink-500">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2">
            <span className="mt-1.5 block h-1 w-1 rounded-full bg-ink-400" />
            {b}
          </li>
        ))}
      </ul>
      <div className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-ink-900 transition group-hover:gap-2.5">
        Open {title.toLowerCase()}
        <ArrowRight className="h-4 w-4" />
      </div>
    </Link>
  );
}

function Grid() {
  return (
    <svg viewBox="0 0 280 280" className="w-full">
      {/* background */}
      <rect x="0" y="0" width="280" height="280" rx="12" fill="#fff" />
      <rect x="0" y="0" width="140" height="140" fill="#dbeafe" opacity="0.5" />
      <rect x="140" y="0" width="140" height="140" fill="#dcfce7" opacity="0.6" />
      <rect x="0" y="140" width="140" height="140" fill="#f1f5f9" opacity="0.6" />
      <rect x="140" y="140" width="140" height="140" fill="#fef9c3" opacity="0.5" />

      {/* axes */}
      <line x1="140" y1="0" x2="140" y2="280" stroke="#1f2937" strokeWidth="1" strokeDasharray="4 4" />
      <line x1="0" y1="140" x2="280" y2="140" stroke="#1f2937" strokeWidth="1" strokeDasharray="4 4" />

      {/* labels */}
      <text x="10" y="20" fontSize="10" fill="#2563eb" fontWeight="600">
        INVESTABLE
      </text>
      <text x="150" y="20" fontSize="10" fill="#16a34a" fontWeight="600">
        WINNER
      </text>
      <text x="10" y="270" fontSize="10" fill="#64748b" fontWeight="600">
        IGNORABLE
      </text>
      <text x="150" y="270" fontSize="10" fill="#ca8a04" fontWeight="600">
        TAXI
      </text>

      {/* axis labels */}
      <text x="140" y="290" textAnchor="middle" fontSize="9" fill="#334155" fontWeight="500">
        Fame →
      </text>
      <text
        x="-140"
        y="10"
        transform="rotate(-90)"
        textAnchor="middle"
        fontSize="9"
        fill="#334155"
        fontWeight="500"
      >
        Uniqueness →
      </text>

      {/* sample points - coca cola */}
      <circle cx="230" cy="30" r="7" fill="#16a34a" opacity="0.85" />
      <title>Script logo (winner)</title>
      <circle cx="200" cy="55" r="6" fill="#16a34a" opacity="0.75" />
      <circle cx="240" cy="220" r="6" fill="#eab308" opacity="0.8" />
      <circle cx="40" cy="80" r="6" fill="#2563eb" opacity="0.75" />
      <circle cx="70" cy="200" r="5" fill="#94a3b8" opacity="0.75" />
    </svg>
  );
}
