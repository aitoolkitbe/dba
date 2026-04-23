import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { QUADRANT_META } from "@/lib/types";

export default function FrameworkPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-10 pt-10">
      <header>
        <div className="chip mb-4">The framework, in full</div>
        <h1 className="text-4xl leading-tight md:text-5xl">
          Why distinctive beats different — and what to do about it.
        </h1>
        <p className="mt-5 text-lg text-ink-600">
          A condensed walkthrough of the theory this tool is built on. Read it once,
          then apply it in the Audit module.
        </p>
      </header>

      <Section title="1. Mental availability wins">
        <p>
          The Ehrenberg-Bass Institute has documented a simple pattern across thousands
          of brands and categories: brands grow by being bought by more people, not by
          being bought more often by the same people. Heavy buyers don&apos;t make
          brands big; light buyers do. To reach light buyers, a brand has to be easy to
          recall <em>in the moment the category need happens</em>. That recall is
          called <strong>mental availability</strong>.
        </p>
      </Section>

      <Section title="2. Assets, not messages, do the recall work">
        <p>
          Mental availability is built by memory structures linked to the brand.
          Language, logos, scenes, sounds, shapes — the non-name elements that, once
          encountered, fire the brand back into mind. These are{" "}
          <strong>Distinctive Brand Assets</strong> (DBAs).
        </p>
        <p>
          DBAs are not <em>positioning</em>. They are not the brand&apos;s meaning or
          promise. They are the shortcuts that make the brand retrievable. A brand
          needs meaning <em>and</em> shortcuts; but it is the shortcuts — the assets —
          that most marketers under-invest in.
        </p>
      </Section>

      <Section title="3. Two numbers: fame and uniqueness">
        <p>
          Every candidate asset can be measured on two axes:
        </p>
        <ul className="my-4 list-disc space-y-2 pl-6">
          <li>
            <strong>Fame</strong> — the share of category buyers who name your brand
            when exposed to the asset alone.
          </li>
          <li>
            <strong>Uniqueness</strong> — the share of those who name <em>only</em>{" "}
            your brand, not a competitor.
          </li>
        </ul>
        <p>
          Romaniuk&apos;s threshold for &quot;real asset&quot; territory is roughly
          50% on both axes. Above that, on both, an asset is doing the work of a DBA.
        </p>
      </Section>

      <Section title="4. The four quadrants">
        <div className="grid gap-3 md:grid-cols-2">
          {(Object.keys(QUADRANT_META) as Array<keyof typeof QUADRANT_META>).map((k) => (
            <div key={k} className="card">
              <div className="flex items-center justify-between">
                <h4 className="font-serif text-lg capitalize">{QUADRANT_META[k].label}</h4>
                <span
                  className="chip"
                  style={{ borderColor: `var(--tw)`, color: `var(--tw)` }}
                >
                  {QUADRANT_META[k].short}
                </span>
              </div>
              <p className="mt-2 text-sm text-ink-600">{QUADRANT_META[k].description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="5. The three disciplines">
        <p>
          Managing DBAs boils down to three disciplines — the three modules of this
          tool.
        </p>
        <ol className="my-4 list-decimal space-y-2 pl-6">
          <li>
            <strong>Audit</strong>: know what you have, know where each asset sits.
          </li>
          <li>
            <strong>Create</strong>: where you have gaps, design new assets to be
            distinct from day one — not merely &quot;different&quot;.
          </li>
          <li>
            <strong>Deploy</strong>: use winning assets consistently, on every
            touchpoint, across years. Consistency is the investment that compounds.
          </li>
        </ol>
      </Section>

      <Section title="6. A few rules that keep you out of trouble">
        <ul className="my-4 list-disc space-y-2 pl-6">
          <li>
            <strong>Consistency over novelty.</strong> Refreshing a logo every five
            years destroys the asset you paid decades to build.
          </li>
          <li>
            <strong>Execute distinctly, not differently.</strong> Your creative can
            vary infinitely — the DBAs should not.
          </li>
          <li>
            <strong>Build before you need to defend.</strong> Assets take years to
            reach &quot;winner&quot; status.
          </li>
          <li>
            <strong>Multiple assets cover more minds.</strong> Different category
            buyers remember via different cues — a palette of 5–8 assets is healthier
            than one.
          </li>
          <li>
            <strong>Never change a winner to look modern.</strong> Modernity is a
            designer&apos;s instinct; distinctiveness is a CFO&apos;s friend.
          </li>
        </ul>
      </Section>

      <div className="flex items-center justify-between rounded-2xl border border-ink-900 bg-ink-900 p-6 text-white">
        <div>
          <h3 className="text-white">Ready to audit?</h3>
          <p className="text-sm text-ink-300">Take any brand through the grid in 15 minutes.</p>
        </div>
        <Link href="/audit" className="btn-secondary">
          Start audit <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-2xl">{title}</h2>
      <div className="space-y-3 text-ink-700 leading-relaxed">{children}</div>
    </section>
  );
}
