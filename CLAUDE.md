# Until Dawn Decision Tracker — Project Bible

## Overview
A Progressive Web App for tracking decisions across multiple Until Dawn
playthroughs. Users log in via magic link, create named runs, track the
status of all 8 characters, and record choices at each of the 22
butterfly-effect decision points. The UI is fully in German. A run-comparison
timeline shows what was chosen in previous runs at the same moment.

## Tech Stack
| Layer       | Technology                     |
|-------------|--------------------------------|
| Framework   | Next.js 16 (App Router)        |
| Language    | TypeScript (strict)            |
| Styling     | Tailwind CSS v4 + custom horror theme |
| Auth/DB     | Supabase (Magic Link + Postgres) |
| PWA         | @serwist/next + Web App Manifest |
| State       | Zustand (ephemeral UI only)    |
| Deployment  | Vercel                         |

## Architecture Decisions
- **Static butterfly-effect data** — all 22 segments are hardcoded in
  `src/lib/data/butterfly-effects.ts`. No DB table needed; data never
  changes between users.
- **Server Components by default** — data fetching happens server-side
  via `src/lib/supabase/server.ts`. Client Components only where
  interactivity is required (status toggles, card navigation).
- **Optimistic updates** — character status toggles update UI
  immediately; Supabase call in background.
- **No ORM** — direct Supabase JS client calls. Schema is simple enough
  that an ORM adds no value.
- **Auth via middleware** — `src/middleware.ts` refreshes the session
  cookie and redirects unauthenticated users to `/auth/login`.

## Component Architecture

### Decision UI (card-based, replaces list view)
| Component | Path | Purpose |
|-----------|------|---------|
| `ButterflyCard` | `src/components/decisions/ButterflyCard.tsx` | Single card per scene: scene image, German option labels, undo button, run comparison badges |
| `CardNavigator` | `src/components/decisions/CardNavigator.tsx` | Swipe navigation between cards, keyboard support (arrow keys), progress dots |

### Comparison UI
| Component | Path | Purpose |
|-----------|------|---------|
| `RunTimeline` | `src/components/comparison/RunTimeline.tsx` | Chapter-by-chapter timeline, highlights divergence between runs |

### Removed components (do not recreate)
- `DecisionCard.tsx`, `DecisionList.tsx` — replaced by `ButterflyCard` + `CardNavigator`
- `TimedDecision.tsx`, `TimedModeButton.tsx` — timed mode removed; card UX serves this purpose
- `ComparisonView.tsx` — replaced by run badges in `ButterflyCard` + `RunTimeline` page

## butterfly-effects.ts — Interface

All 22 butterfly effects live in `src/lib/data/butterfly-effects.ts`.

**Critical field rules:**
- `options` (English) — these are the **DB keys** stored in `decisions.chosen_option`. Never change them; doing so breaks existing saved decisions.
- `optionsDe` — German display labels shown in the UI. Safe to update.
- `nameDe` — German scene name for display.
- `descriptionDe` — German description for display.
- `sceneImage` — filename relative to `public/scenes/` (e.g. `01-the-prank.jpg`). Optional; falls back to a chapter-based gradient.

**Adding a new butterfly effect:** add to `src/lib/data/butterfly-effects.ts` only — no DB migration needed.

**Adding a character:** update the `CHARACTERS` array in `src/lib/data/butterfly-effects.ts` AND ensure the character seeding logic in the run-creation server action handles it.

## Scene Images
- Directory: `public/scenes/`
- Naming: `01-the-prank.jpg` through `22-until-dawn.jpg`
- If an image is missing, `ButterflyCard` renders a gradient fallback based on chapter number.

## Design Tokens

### Typography
- `font-cinzel-decorative` — Cinzel Decorative font (headings, titles)

### Horror colour palette
| Token | Value | Usage |
|-------|-------|-------|
| `--color-horror-ice` | `#7db8cc` | Unknown character status |
| `--color-horror-ice-dim` | `#0d2030` | Unknown status background |
| `--color-horror-gold` | `#c9a84c` | Hourglass accents, divergence highlights |
| `--color-horror-gold-dim` | dimmed gold | Secondary gold surfaces |

Tailwind utilities: `bg-[#0d2030] text-[#7db8cc]` for ice, `text-[#c9a84c]` for gold.

## Supabase Schema

### Table: runs
| Column     | Type        | Notes                        |
|------------|-------------|------------------------------|
| id         | uuid PK     | gen_random_uuid()            |
| name       | text        | user-defined run name        |
| created_at | timestamptz | default now()                |
| user_id    | uuid FK     | references auth.users(id)    |

### Table: characters
| Column  | Type   | Notes                                         |
|---------|--------|-----------------------------------------------|
| id      | uuid PK|                                               |
| run_id  | uuid FK| references runs(id) ON DELETE CASCADE         |
| name    | text   | one of: Sam, Mike, Ashley, Chris, Josh, Jessica, Emily, Matt |
| status  | text   | CHECK IN ('alive','dead','unknown')           |

### Table: decisions
| Column               | Type        | Notes                        |
|----------------------|-------------|------------------------------|
| id                   | uuid PK     |                              |
| run_id               | uuid FK     | references runs(id) ON DELETE CASCADE |
| chapter              | integer     |                              |
| butterfly_effect_name| text        | matches ButterflyEffect.name |
| chosen_option        | text        | English option key (never display text) |
| timestamp            | timestamptz | default now()                |

## RLS Policy Summary
Each user can only access rows whose run belongs to them.
- `runs`: `auth.uid() = user_id`
- `characters` + `decisions`: `EXISTS (SELECT 1 FROM runs WHERE runs.id = <table>.run_id AND runs.user_id = auth.uid())`

## Environment Variables
| Variable                          | Where to find                    |
|-----------------------------------|----------------------------------|
| NEXT_PUBLIC_SUPABASE_URL          | Supabase → Settings → API        |
| NEXT_PUBLIC_SUPABASE_ANON_KEY     | Supabase → Settings → API        |

Set locally in `.env.local`. Set on Vercel via dashboard or `vercel env add`.

## npm Commands
| Command            | Purpose                              |
|--------------------|--------------------------------------|
| `npm run dev`      | Local dev server (localhost:3000)    |
| `npm run build`    | Production build                     |
| `npm run start`    | Serve production build locally       |
| `npm run lint`     | ESLint                               |
| `mkdir -p src/types && npx supabase gen types typescript --project-id <ref> > src/types/database.ts` | Regenerate DB types |
| `vercel env add`   | Add env var to Vercel project        |
| `vercel --prod`    | Deploy to production                 |

## Vercel Deployment
1. `npm install -g vercel` (once)
2. `vercel login` (once — opens browser)
3. From project root: `vercel link` → follow prompts
4. Add env vars: `vercel env add NEXT_PUBLIC_SUPABASE_URL` etc.
5. Deploy: `vercel --prod`

Or connect the GitHub repo in Vercel dashboard for auto-deploy on push.
The `vercel.json` / `vercel.ts` is not needed — Vercel auto-detects Next.js.

## Conventions
- **File naming:** `PascalCase` for components, `camelCase` for utilities
- **Imports:** always use `@/*` alias (configured in tsconfig)
- **Server vs Client:** default to Server Component; add `'use client'`
  only when hooks/interactivity needed
- **Tailwind:** use `cn()` helper (clsx + tailwind-merge) for conditional classes
- **Icons:** use `lucide-react` exclusively — no other icon libraries
- **Language:** UI copy is in German (`nameDe`, `descriptionDe`, `optionsDe`);
  DB keys remain English (`name`, `options`)
- **No comments** unless behavior would surprise a reader
