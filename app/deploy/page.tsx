import Link from "next/link";
import {
  ArrowRight,
  Compass,
  ClipboardCheck,
  Grid3x3,
  HeartPulse,
  Layers,
  ShieldCheck,
} from "lucide-react";

export default function DeployPage() {
  return (
    <div className="space-y-10 pt-6">
      <header>
        <div className="chip mb-3">
          <Compass className="h-3 w-3" /> Deploy module · Preview
        </div>
        <h1 className="text-4xl">
          Use your winning assets everywhere. Consistently. For years.
        </h1>
        <p className="mt-3 max-w-prose text-ink-600">
          A DBA only pays off when it is executed the same way, on every touchpoint,
          long enough for the memory link to harden. The Deploy module turns your
          audit-winners into operational guardrails.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <FeatureCard
          icon={<Grid3x3 className="h-5 w-5" />}
          title="Channel matrix"
          body="See every winning asset mapped across every touchpoint: paid media, packaging, retail, social, product, support. Empty cells are investment opportunities."
        />
        <FeatureCard
          icon={<ClipboardCheck className="h-5 w-5" />}
          title="Creative consistency check"
          body="Paste a script, upload a key-visual, link an ad. The tool checks how many of your DBAs are present — and flags silent executions."
        />
        <FeatureCard
          icon={<ShieldCheck className="h-5 w-5" />}
          title="Modernisation guardrails"
          body="Before redesign season starts, run new concepts through a protect-the-DBA review. Modernity should update, not erase."
        />
        <FeatureCard
          icon={<HeartPulse className="h-5 w-5" />}
          title="Asset health monitor"
          body="Track fame and uniqueness over time. Quarterly or annual re-scoring keeps decline detectable before it becomes expensive."
        />
        <FeatureCard
          icon={<Layers className="h-5 w-5" />}
          title="Agency briefing kit"
          body="Auto-generate a mandatories brief for every creative partner: DBAs, execution examples, what-good-looks-like."
        />
        <FeatureCard
          icon={<Compass className="h-5 w-5" />}
          title="Decision log"
          body="Every exception to the DBA rules gets logged with the reason. A year from now you can tell whether 'just this one time' happened fifty times."
        />
      </section>

      <section className="card bg-ink-900 text-ink-100">
        <h2 className="font-serif text-2xl text-white">Available in iteration 3</h2>
        <p className="mt-2 max-w-prose text-sm text-ink-300">
          Start with the Audit to define what counts as a winner. The Deploy module
          cannot do its job without a trusted list of protected assets.
        </p>
        <div className="mt-4">
          <Link href="/audit" className="btn-secondary">
            Go to Audit <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
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
