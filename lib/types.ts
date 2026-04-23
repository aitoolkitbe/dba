/**
 * DBA Workbench — core types
 *
 * Based on Jenni Romaniuk, "Building Distinctive Brand Assets" (Oxford, 2018)
 * and Byron Sharp, "How Brands Grow" (Oxford, 2010).
 *
 * Key concepts:
 * - Distinctive Brand Assets (DBAs) are non-brand-name elements that trigger
 *   the brand in the memory of category buyers.
 * - Assets are evaluated on two dimensions:
 *     FAME       = % of category buyers who name your brand when prompted with
 *                  the asset (reach of the association)
 *     UNIQUENESS = % of category buyers who name ONLY your brand (not
 *                  competitors) — i.e. the association is exclusive.
 * - The Fame × Uniqueness grid classifies assets into four quadrants:
 *     WINNERS     — high fame, high uniqueness   → invest, protect, use
 *     TAXIS       — high fame, low uniqueness    → don't brand with this alone
 *     INVESTABLES — low fame, high uniqueness    → build fame
 *     IGNORABLES  — low fame, low uniqueness     → drop or rethink
 *
 * Thresholds follow Romaniuk's published guidance: ~50% for both axes.
 */

export type UserMode = "strategist" | "marketer" | "creative";

export type AssetCategory = "visual" | "verbal" | "auditory" | "scenic";

export type AssetType =
  // Visual
  | "color"
  | "logo"
  | "symbol"
  | "character"
  | "celebrity"
  | "font_typography"
  | "shape_packaging"
  | "style_design"
  // Verbal
  | "tagline"
  | "slogan"
  | "sonic_word"
  | "name_device"
  // Auditory
  | "jingle"
  | "sound_mnemonic"
  | "voice"
  // Scenic
  | "scene_setting"
  | "situation";

export type Quadrant = "winner" | "taxi" | "investable" | "ignorable";

export type AssetStrategy = "build" | "maintain" | "investigate" | "drop";

export interface AssetScore {
  /** 0–100: % of category buyers who name your brand given the asset */
  fame: number;
  /** 0–100: % of category buyers who name ONLY your brand */
  uniqueness: number;
  /** Where the numbers came from */
  source: "research" | "estimate" | "ai_estimate";
  /** Optional: sample size, test date, region */
  sampleSize?: number;
  testDate?: string;
  region?: string;
  notes?: string;
}

export interface DBAAsset {
  id: string;
  name: string;
  category: AssetCategory;
  type: AssetType;
  description: string;
  /** Image/emoji/icon reference for quick visual */
  visual?: string;
  /** Background: when was this asset introduced? */
  heritage?: string;
  scores?: AssetScore;
  /** Optional AI-generated or manually-added analysis */
  analysis?: AssetAnalysis;
}

export interface AssetAnalysis {
  quadrant: Quadrant;
  strategy: AssetStrategy;
  headline: string;
  /** 2–4 bullet points explaining the strategic move */
  rationale: string[];
  /** Optional: next-step actions */
  actions?: string[];
}

export interface Brand {
  id: string;
  name: string;
  /** Category as category buyers would describe it */
  category: string;
  /** One-line positioning */
  positioning?: string;
  /** Main competitors (used to check uniqueness) */
  competitors?: string[];
  assets: DBAAsset[];
  /** Candidate assets (not yet shipped) produced by the Create module */
  candidates?: AssetCandidate[];
  /** Cached category-code scan */
  categoryScan?: CategoryScan;
  /** Demo flag — protected Coca-Cola example */
  isDemo?: boolean;
  /** Lifecycle timestamps (stored brands only) */
  createdAt?: string;
  updatedAt?: string;
}

/* ------------------------------------------------------------------ */
/* CREATE module types                                                */
/* ------------------------------------------------------------------ */

export type CandidateStatus = "draft" | "tested" | "briefed" | "archived";

export interface CandidateConcept {
  name: string;
  type: AssetType;
  category: AssetCategory;
  description: string;
  /** Visual/emoji stand-in */
  visual?: string;
  /** Why this is distinctive, in one sentence */
  distinctiveness_hypothesis: string;
  /** 2–4 concrete execution notes */
  execution_notes: string[];
  /** Honest risks / failure modes */
  risks: string[];
}

export interface StressTestResult {
  overallRisk: "low" | "medium" | "high";
  headline: string;
  /** Conflicts with specific competitors */
  conflicts: Array<{
    competitor: string;
    severity: "low" | "medium" | "high";
    reason: string;
  }>;
  /** Clashes with category conventions */
  categoryCodeClashes: string[];
  /** Legal / trademark / dilution flags */
  legalFlags?: string[];
  recommendations: string[];
}

export interface CreativeBrief {
  /** Markdown version, ready to copy-paste into any deck */
  markdown: string;
  /** Structured pieces for in-app rendering */
  mandatories: string[];
  guardrails: string[];
  executionExamples: string[];
  usageContexts: string[];
  /** The one-sentence distinctiveness promise for creatives */
  promise: string;
}

export interface AssetCandidate {
  id: string;
  brandId: string;
  createdAt: string;
  updatedAt: string;
  /** Which gap this candidate addresses (free text) */
  gapBrief?: string;
  /** Desired asset category when ideating */
  requestedCategory?: AssetCategory;
  /** Desired asset type when ideating */
  requestedType?: AssetType;
  concept: CandidateConcept;
  stressTest?: StressTestResult;
  brief?: CreativeBrief;
  status: CandidateStatus;
}

export interface CategoryCode {
  cue: string;
  /** Which category elements use this cue */
  usedBy: string[];
  /** Why this has become a convention */
  explanation: string;
  /** Whether to avoid, acknowledge, or exploit (inversion) */
  recommendation: "avoid" | "acknowledge" | "invert";
}

export interface CategoryScan {
  scannedAt: string;
  category: string;
  competitors: string[];
  /** Codes grouped by asset category */
  codes: Record<AssetCategory, CategoryCode[]>;
  /** Summary insight */
  summary: string;
  /** Open zones — underused codes for this category */
  openZones: string[];
}

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

export const QUADRANT_THRESHOLD = 50;

export function quadrantOf(score: AssetScore | undefined): Quadrant | undefined {
  if (!score) return undefined;
  const highFame = score.fame >= QUADRANT_THRESHOLD;
  const highUniq = score.uniqueness >= QUADRANT_THRESHOLD;
  if (highFame && highUniq) return "winner";
  if (highFame && !highUniq) return "taxi";
  if (!highFame && highUniq) return "investable";
  return "ignorable";
}

export const QUADRANT_META: Record<
  Quadrant,
  {
    label: string;
    short: string;
    color: string;
    description: string;
    defaultStrategy: AssetStrategy;
  }
> = {
  winner: {
    label: "Winner",
    short: "Invest & protect",
    color: "winner",
    description:
      "High fame + high uniqueness. Your category buyers know this is yours. Use it everywhere. Do not change it.",
    defaultStrategy: "maintain",
  },
  taxi: {
    label: "Taxi",
    short: "Don't brand alone",
    color: "taxi",
    description:
      "High fame, low uniqueness. Well-known but shared with competitors — category convention, not brand signal. Never use as primary brand trigger without co-branding.",
    defaultStrategy: "investigate",
  },
  investable: {
    label: "Investable",
    short: "Build fame",
    color: "investable",
    description:
      "Low fame, high uniqueness. Distinctive but under-known. Invest consistently over time to raise fame without losing exclusivity.",
    defaultStrategy: "build",
  },
  ignorable: {
    label: "Ignorable",
    short: "Drop or rethink",
    color: "ignorable",
    description:
      "Low fame, low uniqueness. Not functioning as a brand asset. Rethink creatively or drop — you're paying a consistency tax for nothing.",
    defaultStrategy: "drop",
  },
};

export const CATEGORY_META: Record<
  AssetCategory,
  { label: string; examples: string; icon: string }
> = {
  visual: {
    label: "Visual",
    examples: "Colors, logos, characters, fonts, packaging, visual style",
    icon: "eye",
  },
  verbal: {
    label: "Verbal",
    examples: "Taglines, slogans, signature words, brand names-as-devices",
    icon: "type",
  },
  auditory: {
    label: "Auditory",
    examples: "Jingles, sound mnemonics, signature voices",
    icon: "volume-2",
  },
  scenic: {
    label: "Scenic",
    examples: "Recurring settings, situations, narrative worlds",
    icon: "film",
  },
};
