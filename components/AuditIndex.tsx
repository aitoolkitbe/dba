"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Copy,
  Plus,
  Sparkles,
  Trash2,
  MoreVertical,
  Hammer,
} from "lucide-react";
import { useBrands } from "@/lib/useBrands";
import { deleteBrand, duplicateBrand } from "@/lib/storage";
import type { Brand } from "@/lib/types";
import { cn } from "@/lib/utils";

export function AuditIndex() {
  const { demoBrands, userBrands } = useBrands();

  return (
    <div className="space-y-10">
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-serif text-xl">Your brands</h2>
          <Link href="/audit/new" className="btn-primary text-xs">
            <Plus className="h-3.5 w-3.5" /> New brand
          </Link>
        </div>
        {userBrands.length === 0 ? (
          <div className="card border-dashed text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-ink-100">
              <Hammer className="h-5 w-5 text-ink-600" />
            </div>
            <h3 className="mt-3 text-lg">No brands yet</h3>
            <p className="mt-1 text-sm text-ink-600">
              Add your own brand to run a real audit, or explore the demo
              below to see the framework in action.
            </p>
            <Link href="/audit/new" className="btn-primary mt-4 text-xs">
              <Plus className="h-3.5 w-3.5" /> Add a brand
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {userBrands.map((b) => (
              <BrandCard key={b.id} brand={b} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-serif text-xl">Demo brands</h2>
          <span className="text-xs text-ink-500">Read-only reference</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {demoBrands.map((b) => (
            <BrandCard key={b.id} brand={b} />
          ))}
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

function BrandCard({ brand }: { brand: Brand }) {
  const [menu, setMenu] = useState(false);
  const scored = brand.assets.filter((a) => a.scores).length;
  const candidates = brand.candidates?.length ?? 0;

  return (
    <div
      className={cn(
        "card flex flex-col gap-3",
        brand.isDemo && "bg-gradient-to-br from-white to-ink-50"
      )}
    >
      <div className="flex items-start justify-between gap-2">
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
          <span className="text-xs text-ink-500">{brand.assets.length} assets</span>
          {candidates > 0 && (
            <span className="chip border-investable/30 bg-investable/10 text-investable">
              {candidates} candidate{candidates === 1 ? "" : "s"}
            </span>
          )}
        </div>
        {!brand.isDemo && (
          <div className="relative">
            <button
              onClick={() => setMenu((m) => !m)}
              className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100 hover:text-ink-900"
              aria-label="More actions"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {menu && (
              <div
                className="absolute right-0 z-10 mt-1 w-44 overflow-hidden rounded-xl border border-ink-200 bg-white shadow-lg"
                onMouseLeave={() => setMenu(false)}
              >
                <button
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-ink-50"
                  onClick={() => {
                    duplicateBrand(brand.id);
                    setMenu(false);
                  }}
                >
                  <Copy className="h-4 w-4" /> Duplicate
                </button>
                <button
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  onClick={() => {
                    if (confirm(`Delete "${brand.name}"? This cannot be undone.`)) {
                      deleteBrand(brand.id);
                    }
                    setMenu(false);
                  }}
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div>
        <h3 className="font-serif text-2xl">{brand.name}</h3>
        <p className="mt-1 text-sm text-ink-600">
          {brand.positioning ?? brand.category}
        </p>
      </div>

      <div className="text-xs text-ink-500">
        {brand.category} · {scored}/{brand.assets.length} assets scored
      </div>

      <div className="mt-auto flex items-center gap-2 pt-2">
        <Link
          href={`/audit/${brand.id}/results`}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-ink-900 px-4 py-2 text-sm font-medium text-white hover:bg-ink-700"
        >
          Open audit <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href={`/create/${brand.id}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-ink-300 bg-white px-4 py-2 text-sm font-medium text-ink-900 hover:border-ink-900"
        >
          <Hammer className="h-3.5 w-3.5" /> Create
        </Link>
      </div>
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
