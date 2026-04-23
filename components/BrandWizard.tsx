"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  Trash2,
  Loader2,
  Sparkles,
  X,
} from "lucide-react";
import type {
  AssetCategory,
  AssetType,
  Brand,
  DBAAsset,
} from "@/lib/types";
import { CATEGORY_META } from "@/lib/types";
import { makeId, saveBrand } from "@/lib/storage";
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

const TYPE_LABELS: Record<AssetType, string> = {
  color: "Colour",
  logo: "Logo",
  symbol: "Symbol / device",
  character: "Character / mascot",
  celebrity: "Spokesperson",
  font_typography: "Font / typography",
  shape_packaging: "Shape / packaging",
  style_design: "Visual style",
  tagline: "Tagline",
  slogan: "Slogan",
  sonic_word: "Signature word",
  name_device: "Name-as-device",
  jingle: "Jingle",
  sound_mnemonic: "Sound mnemonic",
  voice: "Signature voice",
  scene_setting: "Recurring scene",
  situation: "Recurring situation",
};

interface Basics {
  name: string;
  category: string;
  positioning: string;
  competitors: string[];
}

type DraftAsset = Omit<DBAAsset, "id" | "scores"> & { id?: string };

export function BrandWizard() {
  const router = useRouter();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [basics, setBasics] = useState<Basics>({
    name: "",
    category: "",
    positioning: "",
    competitors: [""],
  });
  const [assets, setAssets] = useState<DraftAsset[]>([]);
  const [suggesting, setSuggesting] = useState(false);
  const [suggestError, setSuggestError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const canProceedBasics =
    basics.name.trim().length > 1 && basics.category.trim().length > 1;

  /* --------------------------- actions --------------------------- */

  function addAssetRow(category: AssetCategory = "visual") {
    setAssets((prev) => [
      ...prev,
      {
        name: "",
        description: "",
        category,
        type: TYPES_BY_CATEGORY[category][0],
        visual: "",
      },
    ]);
  }

  function updateAsset(i: number, patch: Partial<DraftAsset>) {
    setAssets((prev) =>
      prev.map((a, idx) => (idx === i ? { ...a, ...patch } : a))
    );
  }

  function removeAsset(i: number) {
    setAssets((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function claudeSuggestAssets() {
    setSuggesting(true);
    setSuggestError(null);
    try {
      const res = await fetch("/api/suggest-assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: basics.name,
          category: basics.category,
          positioning: basics.positioning,
          competitors: basics.competitors.filter(Boolean),
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data: { assets: DraftAsset[] } = await res.json();
      setAssets((prev) => [...prev, ...data.assets]);
    } catch (e: unknown) {
      setSuggestError(e instanceof Error ? e.message : "Suggestion failed");
    } finally {
      setSuggesting(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    const brand: Brand = {
      id: makeId("brand"),
      name: basics.name.trim(),
      category: basics.category.trim(),
      positioning: basics.positioning.trim() || undefined,
      competitors: basics.competitors.map((c) => c.trim()).filter(Boolean),
      assets: assets
        .filter((a) => a.name.trim())
        .map((a) => ({
          ...a,
          id: a.id ?? makeId("asset"),
          name: a.name.trim(),
          description: a.description.trim(),
        })),
    };
    const saved = saveBrand(brand);
    router.push(`/audit/${saved.id}/results`);
  }

  /* --------------------------- render --------------------------- */

  return (
    <div className="space-y-6">
      <Stepper step={step} />

      {step === 0 && (
        <StepBasics
          basics={basics}
          onChange={setBasics}
          canProceed={canProceedBasics}
          onNext={() => setStep(1)}
        />
      )}

      {step === 1 && (
        <StepAssets
          assets={assets}
          onAdd={addAssetRow}
          onUpdate={updateAsset}
          onRemove={removeAsset}
          onSuggest={claudeSuggestAssets}
          suggesting={suggesting}
          suggestError={suggestError}
          onBack={() => setStep(0)}
          onNext={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <StepReview
          basics={basics}
          assets={assets}
          saving={saving}
          onBack={() => setStep(1)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

/* ============================ Stepper ============================ */

function Stepper({ step }: { step: 0 | 1 | 2 }) {
  const steps = [
    { label: "Basics", sub: "Brand & category" },
    { label: "Assets", sub: "Current inventory" },
    { label: "Review", sub: "Save brand" },
  ];
  return (
    <ol className="grid grid-cols-3 gap-3">
      {steps.map((s, i) => (
        <li
          key={s.label}
          className={cn(
            "rounded-xl border p-3",
            i < step
              ? "border-winner/30 bg-winner/5"
              : i === step
                ? "border-ink-900 bg-ink-900 text-white"
                : "border-ink-200 bg-white"
          )}
        >
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
            {i < step ? <Check className="h-3 w-3" /> : <span>{i + 1}</span>}
            {s.label}
          </div>
          <div
            className={cn(
              "mt-0.5 text-xs",
              i === step ? "text-ink-300" : "text-ink-500"
            )}
          >
            {s.sub}
          </div>
        </li>
      ))}
    </ol>
  );
}

/* ============================ Step 1 ============================= */

function StepBasics({
  basics,
  onChange,
  canProceed,
  onNext,
}: {
  basics: Basics;
  onChange: (b: Basics) => void;
  canProceed: boolean;
  onNext: () => void;
}) {
  return (
    <div className="card space-y-4">
      <div>
        <h2 className="font-serif text-2xl">Your brand</h2>
        <p className="text-sm text-ink-600">
          The basics Claude needs to reason well about your category and
          competitors.
        </p>
      </div>

      <Field label="Brand name" required>
        <input
          className="input"
          value={basics.name}
          placeholder="e.g. Ritual, Chubbies, Nuun"
          onChange={(e) => onChange({ ...basics, name: e.target.value })}
        />
      </Field>

      <Field
        label="Category"
        required
        hint="How a category buyer would describe what you sell — not your positioning statement."
      >
        <input
          className="input"
          value={basics.category}
          placeholder="e.g. women's multivitamins, craft lager, plant-based protein"
          onChange={(e) => onChange({ ...basics, category: e.target.value })}
        />
      </Field>

      <Field
        label="Positioning (optional)"
        hint="One sentence. What's the brand promise?"
      >
        <textarea
          className="input min-h-[72px] resize-y"
          value={basics.positioning}
          placeholder="e.g. The first multivitamin designed with transparent ingredient sourcing."
          onChange={(e) =>
            onChange({ ...basics, positioning: e.target.value })
          }
        />
      </Field>

      <Field label="Main competitors" hint="The brands you get confused with.">
        <div className="space-y-2">
          {basics.competitors.map((c, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                className="input"
                value={c}
                placeholder="Competitor name"
                onChange={(e) => {
                  const next = [...basics.competitors];
                  next[i] = e.target.value;
                  onChange({ ...basics, competitors: next });
                }}
              />
              {basics.competitors.length > 1 && (
                <button
                  onClick={() =>
                    onChange({
                      ...basics,
                      competitors: basics.competitors.filter(
                        (_, idx) => idx !== i
                      ),
                    })
                  }
                  className="rounded-lg border border-ink-200 p-2 text-ink-500 hover:border-ink-400 hover:text-ink-900"
                  aria-label="Remove competitor"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={() =>
              onChange({
                ...basics,
                competitors: [...basics.competitors, ""],
              })
            }
            className="btn-ghost"
          >
            <Plus className="h-4 w-4" /> Add competitor
          </button>
        </div>
      </Field>

      <div className="flex justify-end pt-2">
        <button onClick={onNext} disabled={!canProceed} className="btn-primary">
          Next: inventory <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ============================ Step 2 ============================= */

function StepAssets({
  assets,
  onAdd,
  onUpdate,
  onRemove,
  onSuggest,
  suggesting,
  suggestError,
  onBack,
  onNext,
}: {
  assets: DraftAsset[];
  onAdd: (c: AssetCategory) => void;
  onUpdate: (i: number, patch: Partial<DraftAsset>) => void;
  onRemove: (i: number) => void;
  onSuggest: () => void;
  suggesting: boolean;
  suggestError: string | null;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="card space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl">Current asset inventory</h2>
          <p className="text-sm text-ink-600">
            List every candidate asset you already own, even weak ones. You&apos;ll
            score them after saving. Empty fields are skipped.
          </p>
        </div>
        <button
          onClick={onSuggest}
          disabled={suggesting}
          className="btn-secondary flex-shrink-0"
        >
          {suggesting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Asking Claude…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" /> Let Claude seed the list
            </>
          )}
        </button>
      </div>

      {suggestError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          {suggestError}
        </div>
      )}

      {assets.length === 0 && (
        <div className="rounded-xl border border-dashed border-ink-200 p-6 text-center text-sm text-ink-500">
          No assets yet. Add them manually below, or let Claude propose a
          starter list based on your category.
        </div>
      )}

      <div className="space-y-3">
        {assets.map((a, i) => (
          <AssetRow
            key={i}
            asset={a}
            onChange={(patch) => onUpdate(i, patch)}
            onRemove={() => onRemove(i)}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {(Object.keys(TYPES_BY_CATEGORY) as AssetCategory[]).map((c) => (
          <button key={c} onClick={() => onAdd(c)} className="btn-ghost text-xs">
            <Plus className="h-3 w-3" /> Add {CATEGORY_META[c].label.toLowerCase()} asset
          </button>
        ))}
      </div>

      <div className="flex justify-between pt-2">
        <button onClick={onBack} className="btn-ghost">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button onClick={onNext} className="btn-primary">
          Next: review <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function AssetRow({
  asset,
  onChange,
  onRemove,
}: {
  asset: DraftAsset;
  onChange: (patch: Partial<DraftAsset>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-xl border border-ink-200 bg-white p-4">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px_180px_auto]">
        <input
          className="input"
          placeholder="Asset name (e.g. 'The orange box')"
          value={asset.name}
          onChange={(e) => onChange({ name: e.target.value })}
        />
        <select
          className="input"
          value={asset.category}
          onChange={(e) => {
            const category = e.target.value as AssetCategory;
            onChange({ category, type: TYPES_BY_CATEGORY[category][0] });
          }}
        >
          {(Object.keys(CATEGORY_META) as AssetCategory[]).map((c) => (
            <option key={c} value={c}>
              {CATEGORY_META[c].label}
            </option>
          ))}
        </select>
        <select
          className="input"
          value={asset.type}
          onChange={(e) => onChange({ type: e.target.value as AssetType })}
        >
          {TYPES_BY_CATEGORY[asset.category as AssetCategory].map((t) => (
            <option key={t} value={t}>
              {TYPE_LABELS[t]}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <input
            className="input w-20 text-center text-lg"
            placeholder="🎯"
            maxLength={2}
            value={asset.visual ?? ""}
            onChange={(e) => onChange({ visual: e.target.value })}
          />
          <button
            onClick={onRemove}
            className="rounded-lg border border-ink-200 p-2 text-ink-500 hover:border-red-300 hover:text-red-600"
            aria-label="Remove asset"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <textarea
        className="input mt-2 min-h-[50px] resize-y"
        placeholder="Short description — what it is, when it started, where it appears."
        value={asset.description}
        onChange={(e) => onChange({ description: e.target.value })}
      />
    </div>
  );
}

/* ============================ Step 3 ============================= */

function StepReview({
  basics,
  assets,
  saving,
  onBack,
  onSave,
}: {
  basics: Basics;
  assets: DraftAsset[];
  saving: boolean;
  onBack: () => void;
  onSave: () => void;
}) {
  const usable = assets.filter((a) => a.name.trim());
  return (
    <div className="card space-y-5">
      <div>
        <h2 className="font-serif text-2xl">Review and save</h2>
        <p className="text-sm text-ink-600">
          After saving, you&apos;ll land in the audit workspace to score each
          asset on fame and uniqueness.
        </p>
      </div>

      <div className="rounded-xl bg-ink-50 p-4">
        <div className="label mb-1">Brand</div>
        <div className="text-lg font-serif">{basics.name}</div>
        <div className="text-sm text-ink-600">{basics.category}</div>
        {basics.positioning && (
          <p className="mt-2 text-sm italic text-ink-700">
            &quot;{basics.positioning}&quot;
          </p>
        )}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {basics.competitors
            .filter(Boolean)
            .map((c) => (
              <span key={c} className="chip">
                {c}
              </span>
            ))}
        </div>
      </div>

      <div>
        <div className="label mb-2">
          {usable.length} asset{usable.length === 1 ? "" : "s"} to save
        </div>
        {usable.length === 0 ? (
          <div className="rounded-xl border border-dashed border-ink-200 p-4 text-xs text-ink-500">
            No assets were named. You can still save the brand and add assets
            later — or go back and add at least one.
          </div>
        ) : (
          <ul className="divide-y divide-ink-200 rounded-xl border border-ink-200">
            {usable.map((a, i) => (
              <li key={i} className="flex items-start gap-3 p-3">
                <span className="text-2xl">{a.visual ?? "◻︎"}</span>
                <div>
                  <div className="font-medium">{a.name}</div>
                  <div className="text-xs text-ink-500">
                    {CATEGORY_META[a.category as AssetCategory].label} ·{" "}
                    {TYPE_LABELS[a.type as AssetType]}
                  </div>
                  {a.description && (
                    <p className="mt-1 text-xs text-ink-600">{a.description}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex justify-between pt-2">
        <button onClick={onBack} className="btn-ghost" disabled={saving}>
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button
          onClick={onSave}
          className="btn-primary"
          disabled={saving || !basics.name.trim()}
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Saving…
            </>
          ) : (
            <>
              <Check className="h-4 w-4" /> Save brand & open audit
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/* ============================ Atoms ============================= */

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="label flex items-center gap-1">
        {label}
        {required && <span className="text-accent-500">*</span>}
      </label>
      {hint && <p className="mt-0.5 text-xs text-ink-500">{hint}</p>}
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
