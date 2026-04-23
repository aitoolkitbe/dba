# DBA Workbench

A strategy tool that helps brands audit, create and deploy **Distinctive Brand Assets** — the non-name elements (colour, shape, character, sound, tagline, scene) that trigger your brand in the mind of category buyers.

Built on:
- Byron Sharp, *How Brands Grow* (Oxford University Press, 2010)
- Jenni Romaniuk, *Building Distinctive Brand Assets* (Oxford University Press, 2018)
- Published Ehrenberg-Bass Institute research

> Mental availability is won by assets that trigger your brand — and nobody else's.

## What's in this MVP

| Module | Status | What it does |
|---|---|---|
| **Audit** | Live | Inventory assets, score them on fame × uniqueness, auto-classify into winners / investables / taxis / ignorables, and get an AI-assisted strategic recommendation per asset. |
| **Create** | Preview | Generate new distinctive assets with category-code diagnostics and distinctiveness stress-tests. (Iteration 2.) |
| **Deploy** | Preview | Channel-matrix, creative consistency check, asset health monitor. (Iteration 3.) |
| **Framework** | Live | A condensed walkthrough of the theory so the rest of the tool makes sense. |

The MVP ships with a **Coca-Cola demo** that populates all four quadrants so you can see the framework in action immediately.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS**
- **Claude API** via `@anthropic-ai/sdk` — server-side only, your key is never shipped to the browser
- **Vercel** for deployment (works on any Node.js host, but zero-config on Vercel)

## Local setup

Prerequisites: Node 18.17+ and a Claude API key from https://console.anthropic.com/

```bash
# 1. Install dependencies
npm install

# 2. Add your Claude API key
cp .env.example .env.local
# then edit .env.local and paste your key

# 3. Run the dev server
npm run dev
# open http://localhost:3000
```

## Deploy to Vercel via GitHub

1. **Push this folder to GitHub.**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: DBA Workbench MVP"
   git branch -M main
   git remote add origin git@github.com:<your-user>/dba-workbench.git
   git push -u origin main
   ```

2. **Connect to Vercel.**
   - Go to https://vercel.com/new
   - Import your GitHub repository.
   - Framework preset: Next.js (auto-detected).
   - Build & output settings: leave default.

3. **Add environment variables.**
   In the Vercel project → Settings → Environment Variables:
   - `ANTHROPIC_API_KEY` → your key from the Anthropic console.
   - `ANTHROPIC_MODEL` → optional, defaults to `claude-sonnet-4-6`.

4. **Deploy.** Vercel will build on push. The `/api/analyze` route becomes a serverless function automatically.

## Project structure

```
dba-workbench/
├── app/
│   ├── layout.tsx              # Shell + nav + footer
│   ├── page.tsx                # Landing: hero, mode switch, modules
│   ├── globals.css             # Tailwind + design tokens
│   ├── framework/page.tsx      # The theory, condensed
│   ├── audit/
│   │   ├── page.tsx            # Pick a brand / start blank
│   │   └── [brandId]/results/page.tsx
│   ├── create/page.tsx         # Preview/teaser for iteration 2
│   ├── deploy/page.tsx         # Preview/teaser for iteration 3
│   └── api/analyze/route.ts    # Serverless Claude call
├── components/
│   ├── SiteNav.tsx
│   ├── ModeSwitch.tsx          # Strategist / Marketer / Creative
│   ├── DBAGrid.tsx             # SVG Fame × Uniqueness plot
│   └── AuditWorkspace.tsx      # The full audit UI (client component)
├── lib/
│   ├── types.ts                # DBA data model + quadrant logic
│   ├── demo-brands.ts          # Coca-Cola seed data
│   ├── claude.ts               # Anthropic SDK wrapper (server-only)
│   └── utils.ts                # cn() + helpers
├── .env.example
├── package.json
├── next.config.mjs
├── tailwind.config.ts
├── postcss.config.mjs
└── tsconfig.json
```

## How a user flows through the MVP

1. **Landing** → understand the framework in 30 seconds, pick your mode (Strategist / Marketer / Creative).
2. **Audit** → start with the Coca-Cola demo (so the user has something working before they invest time in their own brand).
3. **Audit workspace** → the full grid, asset list with live score sliders, detail panel per asset, "Analyse with Claude" for strategic recommendations.
4. **Framework** → deeper reading for anyone who wants the theory.
5. **Create / Deploy** → teaser previews so the roadmap is visible.

## Design principles used

- **Distinctive over different.** The UI uses a consistent ink + accent palette, a single serif for all headings (Source Serif 4), and a square-grid background. Those are our DBAs.
- **Quadrant colour-coding is consistent everywhere.** Green = winner, blue = investable, yellow = taxi, slate = ignorable. No exceptions.
- **Mobile-first, but optimised for desktop strategy sessions.** The audit workspace is a two-column power layout from `lg:` up.

## Roadmap (iterations 2–3)

### Iteration 2 — Create
- Blank-brand wizard (currently scaffolded in `/audit`)
- Category-code scanner (Claude + WebSearch grounding)
- Ideation engine per asset type
- Distinctiveness stress-test vs. competitor set
- Creative brief generator

### Iteration 3 — Deploy
- Channel × asset matrix
- Creative consistency review (paste URL or text → Claude checks DBA presence)
- Annual asset health tracker (persist scoring history)
- Agency briefing export (PDF)

### Later
- Authentication (Clerk or NextAuth)
- Persistence (Postgres via Supabase or Vercel Postgres)
- Team workspaces, per-brand permissions
- Mode-aware UI (strategist/marketer/creative changes language and depth)

## A note on the Coca-Cola scores

The scores in the demo are **illustrative estimates**, not data from a commissioned Romaniuk-style Distinctive Asset Grid study. They are designed to populate all four quadrants so the framework comes to life. For real brands, you replace estimates with research: a short survey among category buyers, asset-first retrieval tasks, and a competitive exclusivity check.

## Licence

This project is yours. Ship it.
