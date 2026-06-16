# Until Dawn Decision Tracker — Project Bible

## Overview
A Progressive Web App for tracking decisions across multiple Until Dawn
playthroughs. Users log in via magic link, create named runs, track the
status of all 8 characters, and record choices at each of the 22
butterfly-effect decision points. A run-comparison overlay shows what
was chosen in previous runs at the same moment.

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
  interactivity is required (status toggles, timed mode).
- **Optimistic updates** — character status toggles update UI
  immediately; Supabase call in background.
- **No ORM** — direct Supabase JS client calls. Schema is simple enough
  that an ORM adds no value.
- **Auth via middleware** — `src/middleware.ts` refreshes the session
  cookie and redirects unauthenticated users to `/auth/login`.

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
| chosen_option        | text        | the option text chosen       |
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
| `npx supabase gen types typescript --project-id <ref> > src/types/database.ts` | Regenerate DB types |
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
- **No comments** unless behavior would surprise a reader
- **New butterfly effect:** add to `src/lib/data/butterfly-effects.ts` only;
  no DB migration needed
- **Adding a character:** update `CHARACTERS` array in `src/lib/data/butterfly-effects.ts`
  AND ensure the character seeding logic in the run-creation server action handles it
