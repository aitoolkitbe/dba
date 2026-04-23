import Link from "next/link";
import {
  ArrowRight,
  Hammer,
  Lightbulb,
  Microscope,
  Radar,
  Target,
} from "lucide-react";

export default function CreatePage() {
  return (
    <div className="space-y-10 pt-6">
      <header>
        <div className="chip mb-3">
          <Hammer className="h-3 w-3" /> Create module · Preview
        </div>
        <h1 className="text-4xl">Design assets that are distinct from day one.</h1>
        <p className="mt-3 max-w-prose text-ink-600">
          Most new &quot;brand assets&quot; fail because they are briefed as
          differentiation, not distinctiveness. This module will walk you through the
          creative disciplines that keep a new asset on the right side of the Fame ×
          Uniqueness grid.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <FeatureCard
          icon={<Target className="h-5 w-5" />}
          title="Gap diagnosis"
          body="Start from your audit. Which asset category is weakest? Which quadrant is empty? Create decisions follow the audit — not a mood board."
        />
        <FeatureCard
          icon={<Microscope className="h-5 w-5" />}
          title="Category-code scan"
          body="Map the visual, verbal and auditory codes your category already uses. Rule them out. What's left is the zone where a distinctive asset can live."
        />
        <FeatureCard
          icon={<Lightbulb className="h-5 w-5" />}
          title="Idea engine"
          body="Prompt-driven ideation for each asset type: colour, shape, character, sonic, tagline, scene. Claude acts as a Romaniuk-flavoured sparring partner."
        />
        <FeatureCard
          icon={<Radar className="h-5 w-5" />}
          title="Distinctiveness stress-test"
          body="Before you commission the designer: check a candidate against competitor assets, category conventions and risk of legal dilution."
        />
        <FeatureCard
          icon={<Hammer className="h-5 w-5" />}
          title="Creative brief generator"
          body="Turn the selected direction into a brief that explicitly protects distinctiveness: mandatories, non-negotiables, execution guardrails."
        />
        <FeatureCard
          icon={<ArrowRight className="h-5 w-5" />}
          title="Hand-off to Deploy"
          body="Once an asset ships, it becomes an input for the Deploy module — consistency from execution one."
        />
      </section>

      <section className="card bg-ink-900 text-ink-100">
        <h2 className="font-serif text-2xl text-white">Available in iteration 2</h2>
        <p className="mt-2 max-w-prose text-sm text-ink-300">
          In the meantime, the Audit module will tell you precisely where your asset
          portfolio has holes — which is exactly the input Create needs.
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
