import type { Brand } from "./types";

/**
 * Coca-Cola demo dataset.
 *
 * Scores are **illustrative estimates** for teaching purposes — not the result
 * of a commissioned Romaniuk-style Distinctive Asset Grid study.
 * They reflect the general pattern documented across Ehrenberg-Bass
 * publications and public case studies. The demo is designed so all four
 * quadrants are populated, so users see the framework come to life.
 */
export const cocaColaDemo: Brand = {
  id: "coca-cola-demo",
  name: "Coca-Cola",
  category: "cola soft drinks",
  positioning:
    "The original cola — refreshment, happiness and shared moments since 1886.",
  competitors: ["Pepsi", "Dr Pepper", "RC Cola", "supermarket private labels"],
  isDemo: true,
  assets: [
    /* ---------------- WINNERS ---------------- */
    {
      id: "spencerian-script",
      name: "Spencerian script logo",
      category: "visual",
      type: "logo",
      description:
        "The flowing white handwritten logo — designed by Frank M. Robinson in 1886 and virtually unchanged since.",
      visual: "✍️",
      heritage: "Since 1886",
      scores: {
        fame: 94,
        uniqueness: 90,
        source: "estimate",
        notes: "Near-universal recognition in cola and soft-drinks category.",
      },
    },
    {
      id: "contour-bottle",
      name: "Contour (hobbleskirt) bottle",
      category: "visual",
      type: "shape_packaging",
      description:
        "The curved glass bottle designed by the Root Glass Company in 1915, recognisable in silhouette.",
      visual: "🍼",
      heritage: "Since 1915",
      scores: {
        fame: 88,
        uniqueness: 86,
        source: "estimate",
        notes: "Silhouette alone is a category trigger.",
      },
    },
    {
      id: "coke-red",
      name: "Coca-Cola Red",
      category: "visual",
      type: "color",
      description:
        "The signature red (Pantone 484-ish). Strongly associated with the brand in the cola category, though red is a common beverage colour.",
      visual: "🟥",
      heritage: "Since early 1900s",
      scores: {
        fame: 82,
        uniqueness: 62,
        source: "estimate",
        notes:
          "Within cola: high uniqueness. Across all FMCG: shared with KFC, Netflix, etc.",
      },
    },
    {
      id: "polar-bears",
      name: "Polar bear family",
      category: "visual",
      type: "character",
      description:
        "The animated polar bears introduced in the 1993 'Always Coca-Cola' campaign, revived seasonally.",
      visual: "🐻‍❄️",
      heritage: "Since 1993",
      scores: {
        fame: 74,
        uniqueness: 80,
        source: "estimate",
        notes: "Almost nobody else uses polar bears in cola marketing.",
      },
    },
    {
      id: "holidays-are-coming",
      name: "Christmas truck ('Holidays are Coming')",
      category: "scenic",
      type: "scene_setting",
      description:
        "The red, LED-lit delivery truck arriving in a snowy town, scored to the 'Holidays are Coming' jingle.",
      visual: "🚚",
      heritage: "Since 1995",
      scores: {
        fame: 78,
        uniqueness: 82,
        source: "estimate",
        notes: "In UK/Europe this is a cultural start-of-Christmas signal.",
      },
    },

    /* ---------------- TAXIS (high fame, low uniqueness) ---------------- */
    {
      id: "red-suited-santa",
      name: "Red-suited Santa Claus",
      category: "visual",
      type: "character",
      description:
        "The modern jolly Santa, popularised by Haddon Sundblom's Coca-Cola illustrations from 1931 onwards.",
      visual: "🎅",
      heritage: "Since 1931",
      scores: {
        fame: 92,
        uniqueness: 22,
        source: "estimate",
        notes:
          "Coca-Cola shaped the modern Santa, but the public now sees Santa as cultural property used by every retailer in Q4.",
      },
    },
    {
      id: "share-a-coke",
      name: "Share a Coke (personalised bottles)",
      category: "verbal",
      type: "tagline",
      description:
        "Replacing the logo with first names on labels — started in Australia in 2011, rolled out globally.",
      visual: "🏷️",
      heritage: "Since 2011",
      scores: {
        fame: 72,
        uniqueness: 40,
        source: "estimate",
        notes:
          "Highly copied by competitors and other categories — personalisation is now a convention.",
      },
    },

    /* ---------------- INVESTABLES (low fame, high uniqueness) --------- */
    {
      id: "dynamic-ribbon",
      name: "Dynamic ribbon (the wave)",
      category: "visual",
      type: "symbol",
      description:
        "The white wavy ribbon running under or around the logo since 1969.",
      visual: "〰️",
      heritage: "Since 1969",
      scores: {
        fame: 38,
        uniqueness: 74,
        source: "estimate",
        notes: "Strong exclusivity but few consumers can name the device itself.",
      },
    },
    {
      id: "coke-five-note",
      name: "'Taste the Feeling' 5-note sonic",
      category: "auditory",
      type: "sound_mnemonic",
      description:
        "Short sonic logo used at the end of 2016–present TV/digital spots.",
      visual: "🎵",
      heritage: "Since 2016",
      scores: {
        fame: 24,
        uniqueness: 68,
        source: "estimate",
        notes:
          "Very few consumers can hum it unprompted, but in-context it is not confused with competitors.",
      },
    },

    /* ---------------- TAGLINES (mixed) ------------------------------- */
    {
      id: "open-happiness",
      name: "'Open Happiness' tagline",
      category: "verbal",
      type: "tagline",
      description:
        "Global tagline from 2009–2016. Still recognised by many consumers.",
      visual: "💬",
      heritage: "2009–2016",
      scores: {
        fame: 54,
        uniqueness: 64,
        source: "estimate",
        notes: "Recent retirement means fame is eroding each year.",
      },
    },
    {
      id: "taste-the-feeling",
      name: "'Taste the Feeling' tagline",
      category: "verbal",
      type: "tagline",
      description: "Current global tagline introduced in 2016.",
      visual: "💬",
      heritage: "Since 2016",
      scores: {
        fame: 34,
        uniqueness: 48,
        source: "estimate",
        notes:
          "Consumers often misattribute or can't recall — generic 'taste' cue is category-wide.",
      },
    },

    /* ---------------- IGNORABLES (low fame, low uniqueness) ---------- */
    {
      id: "clear-glass-condensation",
      name: "Frosted glass with condensation",
      category: "scenic",
      type: "situation",
      description:
        "The hero shot of a frosty glass with beading droplets — used in many Coca-Cola ads.",
      visual: "🥶",
      heritage: "Long-running visual trope",
      scores: {
        fame: 32,
        uniqueness: 14,
        source: "estimate",
        notes:
          "Every cold-beverage brand uses this — not a brand trigger, just a category cue.",
      },
    },
  ],
};

/** All demo brands. Extend as you add more public examples. */
export const DEMO_BRANDS: Brand[] = [cocaColaDemo];

export function getBrandById(id: string): Brand | undefined {
  return DEMO_BRANDS.find((b) => b.id === id);
}
