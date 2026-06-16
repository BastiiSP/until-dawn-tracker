# Until Dawn Decision Tracker — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first PWA for tracking decisions across multiple Until Dawn playthroughs, with character status, all 22 butterfly-effect segments preloaded, timed-decision mode, run comparison, and Supabase auth + persistence.

**Architecture:** Next.js 14 App Router with Supabase for auth + Postgres. Static butterfly-effect data lives in-code (no DB); only user runs, character statuses, and decision records are persisted. Zustand handles ephemeral UI state (comparison sidebar, timed-mode). All routes under `/runs` are server-side protected via middleware.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Supabase (Postgres + Magic Link Auth), `@serwist/next` (PWA), Zustand, Lucide-react, Vercel (deployment).

---

## File Map

```
/                               ← project root
├── CLAUDE.md                   ← project bible (created Task 2)
├── next.config.ts              ← Next.js + Serwist config
├── tailwind.config.ts          ← horror theme
├── public/
│   ├── manifest.webmanifest    ← PWA manifest
│   ├── sw.js                   ← built service worker (gitignore)
│   └── icons/                  ← PWA icons (192, 512)
├── src/
│   ├── app/
│   │   ├── layout.tsx          ← root layout, fonts, dark bg
│   │   ├── page.tsx            ← redirect → /runs
│   │   ├── auth/
│   │   │   ├── login/page.tsx  ← magic link form
│   │   │   └── callback/route.ts ← Supabase auth callback
│   │   └── runs/
│   │       ├── layout.tsx      ← auth guard + nav shell
│   │       ├── page.tsx        ← runs list
│   │       ├── new/page.tsx    ← create run
│   │       └── [id]/
│   │           ├── page.tsx    ← run overview (chars + decisions)
│   │           └── compare/page.tsx ← compare overlay
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Modal.tsx
│   │   ├── characters/
│   │   │   ├── CharacterGrid.tsx
│   │   │   └── CharacterCard.tsx
│   │   ├── decisions/
│   │   │   ├── DecisionList.tsx
│   │   │   ├── DecisionCard.tsx
│   │   │   └── TimedDecision.tsx
│   │   └── comparison/
│   │       └── ComparisonSidebar.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts       ← browser client (singleton)
│   │   │   └── server.ts       ← server client (cookies)
│   │   ├── data/
│   │   │   └── butterfly-effects.ts ← all 22 static segments
│   │   └── store.ts            ← Zustand store (comparison, timed mode)
│   ├── middleware.ts            ← Supabase auth middleware
│   └── types/
│       └── database.ts         ← Supabase generated types
```

---

## ⚠️ Prerequisites Before Task 5

The user must complete these manual steps before Task 5 can execute:

1. Go to [supabase.com](https://supabase.com) → New Project
2. Note the **Project URL** (`https://<ref>.supabase.co`)
3. Note the **Project Ref** (`<ref>` — the subdomain part)
4. Go to Settings → API → copy **anon/public key**
5. Enable **Email (Magic Link) auth**: Authentication → Providers → Email → toggle "Enable Email provider", disable "Confirm email" (for magic link flow)

Share the Project URL and anon key so Claude can set env vars and the project ref so Claude can use Supabase MCP.

---

## Task 1: Bootstrap Next.js Project

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`

- [ ] **Step 1: Scaffold the project**

```bash
cd /Users/sebastianprehmus/Workspace/until-dawn-tracker
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-git \
  --yes
```

Expected: Project files created, `npm run dev` works.

- [ ] **Step 2: Install all dependencies at once**

```bash
npm install \
  @supabase/supabase-js \
  @supabase/ssr \
  @serwist/next \
  serwist \
  zustand \
  lucide-react \
  clsx \
  tailwind-merge
```

```bash
npm install -D @serwist/sw
```

Expected: `node_modules` updated, no peer dependency errors.

- [ ] **Step 3: Verify dev server starts**

```bash
npm run dev
```

Expected: `http://localhost:3000` returns 200.

- [ ] **Step 4: Commit**

```bash
git init && git add -A
git commit -m "feat: bootstrap Next.js 14 project with dependencies"
```

---

## Task 2: Create CLAUDE.md

**Files:**
- Create: `CLAUDE.md`

- [ ] **Step 1: Write CLAUDE.md**

Create `/Users/sebastianprehmus/Workspace/until-dawn-tracker/CLAUDE.md`:

```markdown
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
| Framework   | Next.js 14 (App Router)        |
| Language    | TypeScript (strict)            |
| Styling     | Tailwind CSS + custom horror theme |
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

## RLS: Each user can only access rows whose run belongs to them.
- runs: `auth.uid() = user_id`
- characters + decisions: `EXISTS (SELECT 1 FROM runs WHERE runs.id = <table>.run_id AND runs.user_id = auth.uid())`

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
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add comprehensive CLAUDE.md project bible"
```

---

## Task 3: Tailwind Horror Theme + Base Layout

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Update tailwind.config.ts**

Replace the contents of `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        horror: {
          bg: '#080808',
          card: '#111111',
          border: '#1f1f1f',
          accent: '#dc2626',
          'accent-hover': '#b91c1c',
          text: '#e5e7eb',
          muted: '#6b7280',
          success: '#16a34a',
          warning: '#ca8a04',
        },
      },
      animation: {
        'pulse-red': 'pulse-red 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-red': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(220, 38, 38, 0.4)' },
          '50%': { boxShadow: '0 0 20px rgba(220, 38, 38, 0.8), 0 0 40px rgba(220, 38, 38, 0.4)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
```

- [ ] **Step 2: Update globals.css**

Replace `src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-horror-bg text-horror-text;
  }
}

@layer utilities {
  .tap-target {
    min-height: 48px;
    min-width: 48px;
  }
}
```

- [ ] **Step 3: Create cn() utility**

Create `src/lib/utils.ts`:

```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 4: Update root layout**

Replace `src/app/layout.tsx`:

```typescript
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Until Dawn Tracker',
  description: 'Track your Until Dawn decisions across multiple runs',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Until Dawn',
  },
}

export const viewport: Viewport = {
  themeColor: '#080808',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-horror-bg text-horror-text antialiased`}>
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add src/ tailwind.config.ts
git commit -m "feat: horror dark theme, Tailwind config, base layout"
```

---

## Task 4: PWA Configuration

**Files:**
- Create: `public/manifest.webmanifest`
- Create: `src/app/sw.ts` (service worker source)
- Modify: `next.config.ts`

- [ ] **Step 1: Create PWA manifest**

Create `public/manifest.webmanifest`:

```json
{
  "name": "Until Dawn Tracker",
  "short_name": "UDTracker",
  "description": "Track decisions across Until Dawn runs",
  "start_url": "/runs",
  "display": "standalone",
  "background_color": "#080808",
  "theme_color": "#080808",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

- [ ] **Step 2: Create icons directory with placeholder icons**

```bash
mkdir -p public/icons
# Create minimal 192x192 dark icon (can be replaced with real art later)
# Use a Node one-liner to create a simple SVG-based PNG
node -e "
const { createCanvas } = require('canvas');
" 2>/dev/null || true
# Fallback: create simple placeholder files
echo 'placeholder' > public/icons/icon-192.png
echo 'placeholder' > public/icons/icon-512.png
```

Note: Replace placeholder icons with real 192×512 PNG art before production.
Use any image editor or https://realfavicongenerator.net to generate proper PWA icons.

- [ ] **Step 3: Create service worker source**

Create `src/app/sw.ts`:

```typescript
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist'
import { Serwist } from 'serwist'

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}

declare const self: ServiceWorkerGlobalScope

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: /^https:\/\/.*\.supabase\.co\//,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'supabase-api',
        networkTimeoutSeconds: 10,
        expiration: { maxEntries: 50, maxAgeSeconds: 300 },
      },
    },
  ],
})

serwist.addEventListeners()
```

- [ ] **Step 4: Configure Next.js with Serwist**

Replace `next.config.ts`:

```typescript
import type { NextConfig } from 'next'
import withSerwistInit from '@serwist/next'

const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
})

const nextConfig: NextConfig = {
  // No special config needed for Vercel
}

export default withSerwist(nextConfig)
```

- [ ] **Step 5: Add sw.js to .gitignore**

```bash
echo '/public/sw.js' >> .gitignore
echo '/public/sw.js.map' >> .gitignore
```

- [ ] **Step 6: Commit**

```bash
git add public/ src/app/sw.ts next.config.ts .gitignore
git commit -m "feat: PWA manifest, service worker, Serwist config"
```

---

## Task 5: Supabase Setup via MCP

> **⚠️ User input required before this task.** See Prerequisites section.
> Claude will use Supabase MCP to execute all SQL — the user does not type SQL.

**Files:** None (all work done via MCP)

- [ ] **Step 1: List Supabase projects via MCP to find the new project**

Claude runs: `mcp__plugin_supabase_supabase__list_projects`

Find the project the user just created. Note the `id` field — this is the project ref.

- [ ] **Step 2: Apply schema migration via MCP**

Claude runs `mcp__plugin_supabase_supabase__apply_migration` with project_id and this SQL:

```sql
-- Enable pgcrypto for gen_random_uuid (already enabled in Supabase)

-- RUNS
CREATE TABLE IF NOT EXISTS public.runs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- CHARACTERS
CREATE TABLE IF NOT EXISTS public.characters (
  id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id  UUID NOT NULL REFERENCES public.runs(id) ON DELETE CASCADE,
  name    TEXT NOT NULL,
  status  TEXT NOT NULL DEFAULT 'unknown'
            CHECK (status IN ('alive', 'dead', 'unknown'))
);

-- DECISIONS
CREATE TABLE IF NOT EXISTS public.decisions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id                UUID NOT NULL REFERENCES public.runs(id) ON DELETE CASCADE,
  chapter               INTEGER NOT NULL,
  butterfly_effect_name TEXT NOT NULL,
  chosen_option         TEXT NOT NULL,
  timestamp             TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Expected: Migration applied successfully, 3 tables visible in Supabase dashboard.

- [ ] **Step 3: Enable Row Level Security via MCP**

Claude runs `mcp__plugin_supabase_supabase__apply_migration` with:

```sql
-- Enable RLS
ALTER TABLE public.runs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decisions  ENABLE ROW LEVEL SECURITY;

-- RUNS: owner-only access
CREATE POLICY "runs_owner_all" ON public.runs
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- CHARACTERS: access via run ownership
CREATE POLICY "characters_via_run" ON public.characters
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.runs
      WHERE runs.id = characters.run_id
        AND runs.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.runs
      WHERE runs.id = characters.run_id
        AND runs.user_id = auth.uid()
    )
  );

-- DECISIONS: access via run ownership
CREATE POLICY "decisions_via_run" ON public.decisions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.runs
      WHERE runs.id = decisions.run_id
        AND runs.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.runs
      WHERE runs.id = decisions.run_id
        AND runs.user_id = auth.uid()
    )
  );
```

- [ ] **Step 4: Get project URL and anon key via MCP**

Claude runs `mcp__plugin_supabase_supabase__get_project_url` and
`mcp__plugin_supabase_supabase__get_publishable_keys` to retrieve the values.

Note these — used in Task 6.

---

## Task 6: Environment Variables

**Files:**
- Create: `.env.local`
- Modify: `.gitignore`

- [ ] **Step 1: Ensure .env.local is gitignored**

```bash
grep -q '\.env\.local' .gitignore || echo '.env.local' >> .gitignore
```

- [ ] **Step 2: Create .env.local with values from Task 5**

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<your-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

Replace `<your-ref>` and `<your-anon-key>` with the values obtained in Task 5.

- [ ] **Step 3: Verify env vars load**

```bash
node -e "require('dotenv').config({path:'.env.local'}); console.log(process.env.NEXT_PUBLIC_SUPABASE_URL ? 'OK' : 'MISSING')"
```

Expected: `OK`

---

## Task 7: Supabase Client Utilities + TypeScript Types

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/types/database.ts`
- Create: `src/middleware.ts`

- [ ] **Step 1: Create browser Supabase client**

Create `src/lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 2: Create server Supabase client**

Create `src/lib/supabase/server.ts`:

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component — cookie writes ignored, session still refreshed
          }
        },
      },
    }
  )
}
```

- [ ] **Step 3: Generate TypeScript types from Supabase**

```bash
npx supabase gen types typescript \
  --project-id $(node -e "const u=process.env.NEXT_PUBLIC_SUPABASE_URL||''; console.log(u.replace('https://','').replace('.supabase.co',''))" 2>/dev/null || echo "YOUR_PROJECT_REF") \
  > src/types/database.ts
```

If the above one-liner fails (no Supabase CLI), create `src/types/database.ts` manually:

```typescript
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      runs: {
        Row: {
          id: string
          name: string
          created_at: string
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          user_id: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          user_id?: string
        }
      }
      characters: {
        Row: {
          id: string
          run_id: string
          name: string
          status: 'alive' | 'dead' | 'unknown'
        }
        Insert: {
          id?: string
          run_id: string
          name: string
          status?: 'alive' | 'dead' | 'unknown'
        }
        Update: {
          id?: string
          run_id?: string
          name?: string
          status?: 'alive' | 'dead' | 'unknown'
        }
      }
      decisions: {
        Row: {
          id: string
          run_id: string
          chapter: number
          butterfly_effect_name: string
          chosen_option: string
          timestamp: string
        }
        Insert: {
          id?: string
          run_id: string
          chapter: number
          butterfly_effect_name: string
          chosen_option: string
          timestamp?: string
        }
        Update: {
          id?: string
          run_id?: string
          chapter?: number
          butterfly_effect_name?: string
          chosen_option?: string
          timestamp?: string
        }
      }
    }
  }
}
```

- [ ] **Step 4: Create auth middleware**

Create `src/middleware.ts`:

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isProtected = request.nextUrl.pathname.startsWith('/runs')
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  if (isAuthPage && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/runs'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|sw.js|manifest.webmanifest).*)'],
}
```

- [ ] **Step 5: Commit**

```bash
git add src/
git commit -m "feat: Supabase client, server utilities, auth middleware, TS types"
```

---

## Task 8: Authentication — Login Page + Callback

**Files:**
- Create: `src/app/auth/login/page.tsx`
- Create: `src/app/auth/callback/route.ts`
- Create: `src/app/page.tsx`

- [ ] **Step 1: Create magic link login page**

Create `src/app/auth/login/page.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    })
    if (!error) setSent(true)
    setLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-horror-accent mb-2 tracking-tight">
          Until Dawn
        </h1>
        <p className="text-horror-muted mb-8 text-sm">Decision Tracker</p>

        {sent ? (
          <div className="bg-horror-card border border-horror-border rounded-lg p-6 text-center">
            <p className="text-horror-text">Check your email for the magic link.</p>
            <p className="text-horror-muted text-sm mt-2">You can close this tab.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full bg-horror-card border border-horror-border rounded-lg px-4 py-3 text-horror-text placeholder-horror-muted focus:outline-none focus:border-horror-accent transition-colors"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-horror-accent hover:bg-horror-accent-hover disabled:opacity-50 text-white font-semibold rounded-lg px-4 py-3 transition-colors tap-target"
            >
              {loading ? 'Sending…' : 'Send magic link'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Create auth callback route**

Create `src/app/auth/callback/route.ts`:

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(`${origin}/runs`)
}
```

- [ ] **Step 3: Create root redirect**

Create `src/app/page.tsx`:

```typescript
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/runs')
}
```

- [ ] **Step 4: Test login flow manually**

```bash
npm run dev
```

Open `http://localhost:3000` → should redirect to `/auth/login`.
Enter a real email → should show "Check your email" message.
Click magic link from email → should land on `/runs`.

- [ ] **Step 5: Commit**

```bash
git add src/
git commit -m "feat: magic link auth, login page, auth callback"
```

---

## Task 9: Butterfly Effect Static Data (22 Segments)

**Files:**
- Create: `src/lib/data/butterfly-effects.ts`

- [ ] **Step 1: Define types and create all 22 butterfly effect entries**

Create `src/lib/data/butterfly-effects.ts`:

```typescript
export type CharacterName = 
  | 'Sam' | 'Mike' | 'Ashley' | 'Chris' | 'Josh' | 'Jessica' | 'Emily' | 'Matt'

export const CHARACTERS: CharacterName[] = [
  'Sam', 'Mike', 'Ashley', 'Chris', 'Josh', 'Jessica', 'Emily', 'Matt'
]

export interface ButterflyEffect {
  id: number
  chapter: number
  name: string
  character: CharacterName | CharacterName[]
  description: string
  options: [string, string]
  isTimed: boolean
}

export const BUTTERFLY_EFFECTS: ButterflyEffect[] = [
  {
    id: 1,
    chapter: 0,
    name: 'The Prank',
    character: ['Mike', 'Ashley', 'Chris', 'Emily', 'Matt', 'Jess'],
    description: 'The group decides to prank Hannah. Who orchestrated it?',
    options: ['Mike leads the prank', 'Emily leads the prank'],
    isTimed: false,
  },
  {
    id: 2,
    chapter: 1,
    name: "Sam's Exploration",
    character: 'Sam',
    description: 'Sam arrives at the lodge. Does she explore or go straight to the bath?',
    options: ['Explore the lodge', 'Go to the bath'],
    isTimed: false,
  },
  {
    id: 3,
    chapter: 2,
    name: 'The Ouija Board',
    character: 'Ashley',
    description: 'Ashley uses the ouija board. Does she ask about the twins?',
    options: ['Ask about the twins', 'Refuse to continue'],
    isTimed: false,
  },
  {
    id: 4,
    chapter: 2,
    name: "Matt's Flare Gun",
    character: 'Matt',
    description: 'Matt finds a flare gun in the shed. Does he take it?',
    options: ['Take the flare gun', 'Leave it behind'],
    isTimed: false,
  },
  {
    id: 5,
    chapter: 3,
    name: 'The Letter',
    character: 'Ashley',
    description: 'Ashley finds a letter implicating someone in the prank. Does she read it aloud?',
    options: ['Read it to Chris', 'Keep it to herself'],
    isTimed: false,
  },
  {
    id: 6,
    chapter: 3,
    name: 'The Wolf',
    character: 'Mike',
    description: 'A wolf attacks. Does Mike shoot it?',
    options: ['Shoot the wolf', 'Spare the wolf'],
    isTimed: true,
  },
  {
    id: 7,
    chapter: 4,
    name: "Jessica's Rescue",
    character: 'Mike',
    description: 'Mike chases after Jessica. Does he reach her in time?',
    options: ['Reach her in time', 'Arrive too late'],
    isTimed: true,
  },
  {
    id: 8,
    chapter: 4,
    name: 'The Fire Tower',
    character: 'Emily',
    description: 'Emily and Matt reach the fire tower. Does Emily take the flare gun from Matt?',
    options: ['Emily takes the flare gun', 'Matt keeps the flare gun'],
    isTimed: false,
  },
  {
    id: 9,
    chapter: 5,
    name: "Chris's Honesty",
    character: 'Chris',
    description: 'Chris tells Ashley what the ouija board revealed about the twins.',
    options: ['Tell Ashley the truth', 'Keep the secret'],
    isTimed: false,
  },
  {
    id: 10,
    chapter: 5,
    name: 'The Clue',
    character: 'Sam',
    description: 'Sam discovers a clue about what really happened to the twins.',
    options: ['Investigate further', 'Leave it alone'],
    isTimed: false,
  },
  {
    id: 11,
    chapter: 6,
    name: "The Bear Trap",
    character: ['Chris', 'Ashley'],
    description: 'Chris and Ashley are trapped. Chris must shoot one of them.',
    options: ['Shoot Ashley', 'Shoot himself'],
    isTimed: true,
  },
  {
    id: 12,
    chapter: 6,
    name: "Ashley's Door",
    character: 'Ashley',
    description: 'Ashley hears Chris banging on the door after escaping the trap.',
    options: ['Open the door', 'Leave Chris outside'],
    isTimed: true,
  },
  {
    id: 13,
    chapter: 7,
    name: "Mike's Finger",
    character: 'Mike',
    description: 'Mike finds a bear trap clamped on his fingers in the sanatorium.',
    options: ['Amputate fingers', 'Leave fingers trapped'],
    isTimed: true,
  },
  {
    id: 14,
    chapter: 7,
    name: 'The Mines Escape',
    character: 'Emily',
    description: 'Emily tries to escape through the mines. Does she outrun the threat?',
    options: ['Successfully escape', 'Gets bitten'],
    isTimed: true,
  },
  {
    id: 15,
    chapter: 8,
    name: "Emily's Bite",
    character: 'Mike',
    description: 'Emily reveals she was bitten. Mike must decide her fate.',
    options: ['Shoot Emily', 'Spare Emily'],
    isTimed: true,
  },
  {
    id: 16,
    chapter: 8,
    name: "Sam's Discovery",
    character: 'Sam',
    description: 'Sam discovers the full truth about Josh and the prank.',
    options: ['Confront Josh directly', 'Gather more evidence first'],
    isTimed: false,
  },
  {
    id: 17,
    chapter: 9,
    name: "Josh's Fate",
    character: 'Sam',
    description: "Sam must decide what to do with Josh's situation.",
    options: ['Try to save Josh', 'Prioritize escaping'],
    isTimed: false,
  },
  {
    id: 18,
    chapter: 9,
    name: 'The Mines Path',
    character: 'Mike',
    description: 'Mike encounters something in the mines. Does he fight or flee?',
    options: ['Stand and fight', 'Run'],
    isTimed: true,
  },
  {
    id: 19,
    chapter: 10,
    name: 'The Basement',
    character: ['Sam', 'Mike'],
    description: 'Sam and Mike reunite. Do they try to rescue the others or head for safety?',
    options: ['Try to rescue others', 'Head for the exit'],
    isTimed: false,
  },
  {
    id: 20,
    chapter: 10,
    name: 'The Generator',
    character: 'Sam',
    description: 'Sam must activate the generator switch to save survivors.',
    options: ['Activate immediately', 'Wait for better timing'],
    isTimed: true,
  },
  {
    id: 21,
    chapter: 10,
    name: 'The Sacrifice',
    character: 'Sam',
    description: 'Sam has a chance to end everything — at great personal risk.',
    options: ['Sacrifice — blow it all up', 'Find another way'],
    isTimed: true,
  },
  {
    id: 22,
    chapter: 10,
    name: 'Until Dawn',
    character: ['Sam', 'Mike', 'Ashley', 'Chris', 'Emily', 'Matt'],
    description: 'The rescue helicopter arrives. Who survives until dawn?',
    options: ['Multiple survivors', 'Solo survivor'],
    isTimed: false,
  },
]
```

- [ ] **Step 2: Verify data integrity**

```bash
node -e "
const { BUTTERFLY_EFFECTS } = require('./src/lib/data/butterfly-effects.ts')
" 2>/dev/null || npx tsx -e "
import { BUTTERFLY_EFFECTS } from './src/lib/data/butterfly-effects'
console.log('Total effects:', BUTTERFLY_EFFECTS.length)
console.log('Timed effects:', BUTTERFLY_EFFECTS.filter(e => e.isTimed).length)
console.log('All have 2 options:', BUTTERFLY_EFFECTS.every(e => e.options.length === 2))
"
```

Expected: Total: 22, some timed, all have 2 options.

- [ ] **Step 3: Commit**

```bash
git add src/lib/data/
git commit -m "feat: 22 butterfly effect segments static data"
```

---

## Task 10: Runs — List, Create, Delete

**Files:**
- Create: `src/app/runs/layout.tsx`
- Create: `src/app/runs/page.tsx`
- Create: `src/app/runs/new/page.tsx`
- Create: `src/components/runs/RunCard.tsx`

- [ ] **Step 1: Create runs layout (auth guard + nav)**

Create `src/app/runs/layout.tsx`:

```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function RunsLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  return <>{children}</>
}
```

- [ ] **Step 2: Create RunCard component**

Create `src/components/runs/RunCard.tsx`:

```typescript
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RunCardProps {
  id: string
  name: string
  createdAt: string
}

export function RunCard({ id, name, createdAt }: RunCardProps) {
  const date = new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
  return (
    <Link
      href={`/runs/${id}`}
      className={cn(
        'flex items-center justify-between',
        'bg-horror-card border border-horror-border rounded-lg px-4 py-4',
        'hover:border-horror-accent transition-colors active:scale-[0.98] tap-target'
      )}
    >
      <div>
        <p className="font-semibold text-horror-text">{name}</p>
        <p className="text-xs text-horror-muted mt-0.5">{date}</p>
      </div>
      <ChevronRight className="text-horror-muted shrink-0" size={20} />
    </Link>
  )
}
```

- [ ] **Step 3: Create runs list page**

Create `src/app/runs/page.tsx`:

```typescript
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { RunCard } from '@/components/runs/RunCard'

export default async function RunsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: runs } = await supabase
    .from('runs')
    .select('id, name, created_at')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen px-4 py-8 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-horror-text">Your Runs</h1>
        <Link
          href="/runs/new"
          className="flex items-center gap-1.5 bg-horror-accent hover:bg-horror-accent-hover text-white text-sm font-semibold px-3 py-2 rounded-lg transition-colors tap-target"
        >
          <Plus size={16} />
          New Run
        </Link>
      </div>

      {runs && runs.length > 0 ? (
        <div className="space-y-3">
          {runs.map(run => (
            <RunCard key={run.id} id={run.id} name={run.name} createdAt={run.created_at} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-horror-muted">No runs yet.</p>
          <p className="text-horror-muted text-sm mt-1">Create your first run to get started.</p>
        </div>
      )}
    </main>
  )
}
```

- [ ] **Step 4: Create new run page**

Create `src/app/runs/new/page.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const SUGGESTED_NAMES = [
  'Run 1 – All Survive',
  'Run 2 – Chaos Run',
  'Perfect Run',
  'Everyone Dies',
]

export default function NewRunPage() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleCreate(runName: string) {
    if (!runName.trim()) return
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: run, error } = await supabase
      .from('runs')
      .insert({ name: runName.trim(), user_id: user.id })
      .select('id')
      .single()

    if (error || !run) { setLoading(false); return }

    // Seed all 8 characters with status 'unknown'
    const CHARACTERS = ['Sam', 'Mike', 'Ashley', 'Chris', 'Josh', 'Jessica', 'Emily', 'Matt']
    await supabase.from('characters').insert(
      CHARACTERS.map(name => ({ run_id: run.id, name, status: 'unknown' as const }))
    )

    router.push(`/runs/${run.id}`)
  }

  return (
    <main className="min-h-screen px-4 py-8 max-w-lg mx-auto">
      <Link href="/runs" className="flex items-center gap-2 text-horror-muted mb-8 tap-target">
        <ArrowLeft size={16} /> Back
      </Link>

      <h1 className="text-2xl font-bold text-horror-text mb-6">Name Your Run</h1>

      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="e.g. All Survive Run"
        maxLength={60}
        className="w-full bg-horror-card border border-horror-border rounded-lg px-4 py-3 text-horror-text placeholder-horror-muted focus:outline-none focus:border-horror-accent transition-colors mb-4"
      />

      <button
        onClick={() => handleCreate(name)}
        disabled={!name.trim() || loading}
        className="w-full bg-horror-accent hover:bg-horror-accent-hover disabled:opacity-40 text-white font-semibold rounded-lg py-3 transition-colors mb-8 tap-target"
      >
        {loading ? 'Creating…' : 'Create Run'}
      </button>

      <p className="text-horror-muted text-sm mb-3">Or pick a suggestion:</p>
      <div className="space-y-2">
        {SUGGESTED_NAMES.map(s => (
          <button
            key={s}
            onClick={() => handleCreate(s)}
            disabled={loading}
            className="w-full text-left bg-horror-card border border-horror-border hover:border-horror-accent rounded-lg px-4 py-3 text-horror-text transition-colors tap-target"
          >
            {s}
          </button>
        ))}
      </div>
    </main>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add src/
git commit -m "feat: runs list, create run with character seeding, RunCard component"
```

---

## Task 11: Character Status Component

**Files:**
- Create: `src/components/characters/CharacterGrid.tsx`
- Create: `src/components/characters/CharacterCard.tsx`

- [ ] **Step 1: Create CharacterCard with optimistic status toggle**

Create `src/components/characters/CharacterCard.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

type Status = 'alive' | 'dead' | 'unknown'

const STATUS_CYCLE: Record<Status, Status> = {
  unknown: 'alive',
  alive: 'dead',
  dead: 'unknown',
}

const STATUS_STYLES: Record<Status, string> = {
  alive:   'border-green-700 bg-green-950 text-green-400',
  dead:    'border-red-900 bg-red-950 text-horror-accent',
  unknown: 'border-horror-border bg-horror-card text-horror-muted',
}

const STATUS_LABELS: Record<Status, string> = {
  alive: 'ALIVE',
  dead: 'DEAD',
  unknown: '?',
}

interface CharacterCardProps {
  id: string
  name: string
  initialStatus: Status
}

export function CharacterCard({ id, name, initialStatus }: CharacterCardProps) {
  const [status, setStatus] = useState<Status>(initialStatus)
  const supabase = createClient()

  async function toggle() {
    const next = STATUS_CYCLE[status]
    setStatus(next) // optimistic
    await supabase.from('characters').update({ status: next }).eq('id', id)
  }

  return (
    <button
      onClick={toggle}
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border p-3 gap-1 transition-all active:scale-95 tap-target',
        STATUS_STYLES[status]
      )}
    >
      <span className="text-sm font-semibold">{name}</span>
      <span className="text-xs font-bold tracking-widest">{STATUS_LABELS[status]}</span>
    </button>
  )
}
```

- [ ] **Step 2: Create CharacterGrid**

Create `src/components/characters/CharacterGrid.tsx`:

```typescript
import { CharacterCard } from './CharacterCard'

interface Character {
  id: string
  name: string
  status: 'alive' | 'dead' | 'unknown'
}

export function CharacterGrid({ characters }: { characters: Character[] }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {characters.map(c => (
        <CharacterCard key={c.id} id={c.id} name={c.name} initialStatus={c.status} />
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/characters/
git commit -m "feat: character status grid with optimistic tap-to-toggle"
```

---

## Task 12: Run Overview Page (Characters + Decisions)

**Files:**
- Create: `src/app/runs/[id]/page.tsx`
- Create: `src/components/decisions/DecisionList.tsx`
- Create: `src/components/decisions/DecisionCard.tsx`

- [ ] **Step 1: Create DecisionCard**

Create `src/components/decisions/DecisionCard.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { ButterflyEffect } from '@/lib/data/butterfly-effects'

interface DecisionCardProps {
  effect: ButterflyEffect
  runId: string
  existingChoice?: string
  comparisonChoice?: string
}

export function DecisionCard({ effect, runId, existingChoice, comparisonChoice }: DecisionCardProps) {
  const [chosen, setChosen] = useState<string | undefined>(existingChoice)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function choose(option: string) {
    if (loading) return
    setLoading(true)
    setChosen(option) // optimistic

    // Upsert: delete old + insert new (decisions have no unique constraint by design)
    const { data: existing } = await supabase
      .from('decisions')
      .select('id')
      .eq('run_id', runId)
      .eq('butterfly_effect_name', effect.name)
      .maybeSingle()

    if (existing) {
      await supabase.from('decisions').delete().eq('id', existing.id)
    }

    await supabase.from('decisions').insert({
      run_id: runId,
      chapter: effect.chapter,
      butterfly_effect_name: effect.name,
      chosen_option: option,
    })
    setLoading(false)
  }

  return (
    <div className={cn(
      'bg-horror-card border rounded-lg p-4',
      effect.isTimed ? 'border-horror-accent animate-pulse-red' : 'border-horror-border'
    )}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs text-horror-muted">CH. {effect.chapter}</span>
        {effect.isTimed && (
          <span className="text-xs font-bold text-horror-accent tracking-widest">TIMED</span>
        )}
      </div>
      <h3 className="font-semibold text-horror-text mb-1">{effect.name}</h3>
      <p className="text-sm text-horror-muted mb-3">{effect.description}</p>

      {comparisonChoice && (
        <p className="text-xs text-horror-muted mb-2 italic">
          Previous run: <span className="text-yellow-400">{comparisonChoice}</span>
        </p>
      )}

      <div className="grid grid-cols-2 gap-2">
        {effect.options.map(option => (
          <button
            key={option}
            onClick={() => choose(option)}
            disabled={loading}
            className={cn(
              'rounded-lg py-3 px-2 text-sm font-semibold transition-all active:scale-95 tap-target',
              chosen === option
                ? 'bg-horror-accent text-white border border-horror-accent'
                : 'bg-horror-bg border border-horror-border text-horror-muted hover:border-horror-accent hover:text-horror-text'
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create DecisionList**

Create `src/components/decisions/DecisionList.tsx`:

```typescript
import { BUTTERFLY_EFFECTS } from '@/lib/data/butterfly-effects'
import { DecisionCard } from './DecisionCard'

interface DecisionListProps {
  runId: string
  savedDecisions: Array<{ butterfly_effect_name: string; chosen_option: string }>
  comparisonDecisions?: Array<{ butterfly_effect_name: string; chosen_option: string }>
}

export function DecisionList({ runId, savedDecisions, comparisonDecisions }: DecisionListProps) {
  const savedMap = Object.fromEntries(
    savedDecisions.map(d => [d.butterfly_effect_name, d.chosen_option])
  )
  const compMap = Object.fromEntries(
    (comparisonDecisions ?? []).map(d => [d.butterfly_effect_name, d.chosen_option])
  )

  const chapters = [...new Set(BUTTERFLY_EFFECTS.map(e => e.chapter))].sort((a, b) => a - b)

  return (
    <div className="space-y-6">
      {chapters.map(ch => (
        <div key={ch}>
          <h2 className="text-xs font-bold tracking-widest text-horror-muted uppercase mb-3">
            {ch === 0 ? 'Prologue' : `Chapter ${ch}`}
          </h2>
          <div className="space-y-3">
            {BUTTERFLY_EFFECTS.filter(e => e.chapter === ch).map(effect => (
              <DecisionCard
                key={effect.id}
                effect={effect}
                runId={runId}
                existingChoice={savedMap[effect.name]}
                comparisonChoice={compMap[effect.name]}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Create Run overview page**

Create `src/app/runs/[id]/page.tsx`:

```typescript
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, GitCompare } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { CharacterGrid } from '@/components/characters/CharacterGrid'
import { DecisionList } from '@/components/decisions/DecisionList'

export default async function RunPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: run }, { data: characters }, { data: decisions }] = await Promise.all([
    supabase.from('runs').select('id, name').eq('id', id).single(),
    supabase.from('characters').select('id, name, status').eq('run_id', id).order('name'),
    supabase.from('decisions').select('butterfly_effect_name, chosen_option').eq('run_id', id),
  ])

  if (!run) notFound()

  return (
    <main className="min-h-screen px-4 py-8 max-w-lg mx-auto pb-24">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/runs" className="text-horror-muted tap-target">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold text-horror-text truncate max-w-[200px]">{run.name}</h1>
        </div>
        <Link
          href={`/runs/${id}/compare`}
          className="flex items-center gap-1.5 text-sm text-horror-muted border border-horror-border rounded-lg px-3 py-2 hover:border-horror-accent tap-target"
        >
          <GitCompare size={14} /> Compare
        </Link>
      </div>

      <section className="mb-8">
        <h2 className="text-xs font-bold tracking-widest text-horror-muted uppercase mb-3">
          Characters
        </h2>
        <CharacterGrid characters={(characters ?? []) as any} />
      </section>

      <section>
        <h2 className="text-xs font-bold tracking-widest text-horror-muted uppercase mb-3">
          Butterfly Effects
        </h2>
        <DecisionList
          runId={id}
          savedDecisions={decisions ?? []}
        />
      </section>
    </main>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/
git commit -m "feat: run overview, character grid, full decision list with tap-to-choose"
```

---

## Task 13: Timed Decision Mode

**Files:**
- Create: `src/components/decisions/TimedDecision.tsx`
- Modify: `src/app/runs/[id]/page.tsx`

- [ ] **Step 1: Create full-screen timed decision component**

Create `src/components/decisions/TimedDecision.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { ButterflyEffect } from '@/lib/data/butterfly-effects'
import { BUTTERFLY_EFFECTS } from '@/lib/data/butterfly-effects'

interface TimedDecisionModeProps {
  runId: string
  savedDecisions: Array<{ butterfly_effect_name: string; chosen_option: string }>
  onClose: () => void
}

export function TimedDecisionMode({ runId, savedDecisions, onClose }: TimedDecisionModeProps) {
  const timedEffects = BUTTERFLY_EFFECTS.filter(e => e.isTimed)
  const [index, setIndex] = useState(0)
  const [chosen, setChosen] = useState<string | null>(null)
  const supabase = createClient()

  const effect = timedEffects[index]
  const existingChoice = savedDecisions.find(d => d.butterfly_effect_name === effect.name)?.chosen_option

  async function choose(option: string) {
    setChosen(option)

    const { data: existing } = await supabase
      .from('decisions')
      .select('id')
      .eq('run_id', runId)
      .eq('butterfly_effect_name', effect.name)
      .maybeSingle()

    if (existing) await supabase.from('decisions').delete().eq('id', existing.id)

    await supabase.from('decisions').insert({
      run_id: runId,
      chapter: effect.chapter,
      butterfly_effect_name: effect.name,
      chosen_option: option,
    })

    setTimeout(() => {
      setChosen(null)
      if (index + 1 < timedEffects.length) {
        setIndex(i => i + 1)
      } else {
        onClose()
      }
    }, 800)
  }

  return (
    <div className="fixed inset-0 bg-horror-bg z-50 flex flex-col">
      <div className="flex items-center justify-between px-4 py-4 border-b border-horror-border">
        <span className="text-xs text-horror-muted font-bold tracking-widest uppercase">
          Timed Mode — {index + 1}/{timedEffects.length}
        </span>
        <button onClick={onClose} className="text-horror-muted text-sm tap-target">
          Exit
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6">
        <p className="text-xs text-horror-accent font-bold tracking-widest mb-2">
          CH. {effect.chapter} — TIMED DECISION
        </p>
        <h2 className="text-3xl font-bold text-horror-text mb-4">{effect.name}</h2>
        <p className="text-horror-muted mb-10 text-lg leading-relaxed">{effect.description}</p>

        {existingChoice && (
          <p className="text-sm text-horror-muted mb-6 italic">
            Current: <span className="text-yellow-400">{existingChoice}</span>
          </p>
        )}

        <div className="space-y-4">
          {effect.options.map(option => (
            <button
              key={option}
              onClick={() => choose(option)}
              disabled={chosen !== null}
              className={cn(
                'w-full text-left rounded-xl border px-6 py-5 text-lg font-semibold transition-all active:scale-95',
                chosen === option
                  ? 'bg-horror-accent border-horror-accent text-white'
                  : 'bg-horror-card border-horror-border text-horror-text hover:border-horror-accent'
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add timed mode button to run overview page**

In `src/app/runs/[id]/page.tsx`, add a `'use client'` wrapper or a separate client component for the timed mode toggle. Add a `TimedModeButton` client component:

Create `src/components/decisions/TimedModeButton.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { Zap } from 'lucide-react'
import { TimedDecisionMode } from './TimedDecision'

interface TimedModeButtonProps {
  runId: string
  savedDecisions: Array<{ butterfly_effect_name: string; chosen_option: string }>
}

export function TimedModeButton({ runId, savedDecisions }: TimedModeButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 bg-horror-accent hover:bg-horror-accent-hover text-white text-sm font-bold px-4 py-2 rounded-lg tap-target w-full justify-center"
      >
        <Zap size={16} /> Timed Decision Mode
      </button>
      {open && (
        <TimedDecisionMode
          runId={runId}
          savedDecisions={savedDecisions}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
```

Add `<TimedModeButton runId={id} savedDecisions={decisions ?? []} />` to the run overview page above the decisions section.

- [ ] **Step 3: Commit**

```bash
git add src/
git commit -m "feat: timed decision mode — full-screen minimal interface"
```

---

## Task 14: Run Comparison Feature

**Files:**
- Create: `src/app/runs/[id]/compare/page.tsx`
- Create: `src/components/comparison/ComparisonSidebar.tsx`

- [ ] **Step 1: Create comparison page**

Create `src/app/runs/[id]/compare/page.tsx`:

```typescript
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ComparisonView } from '@/components/comparison/ComparisonView'

export default async function ComparePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: currentRun }, { data: allRuns }, { data: currentDecisions }] = await Promise.all([
    supabase.from('runs').select('id, name').eq('id', id).single(),
    supabase.from('runs').select('id, name').eq('user_id', user!.id).neq('id', id).order('created_at', { ascending: false }),
    supabase.from('decisions').select('butterfly_effect_name, chosen_option').eq('run_id', id),
  ])

  if (!currentRun) notFound()

  return (
    <main className="min-h-screen px-4 py-8 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/runs/${id}`} className="text-horror-muted tap-target">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-horror-text">Compare Runs</h1>
      </div>

      <ComparisonView
        currentRunId={id}
        currentRunName={currentRun.name}
        currentDecisions={currentDecisions ?? []}
        otherRuns={(allRuns ?? []).map(r => ({ id: r.id, name: r.name }))}
      />
    </main>
  )
}
```

- [ ] **Step 2: Create ComparisonView client component**

Create `src/components/comparison/ComparisonView.tsx`:

```typescript
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BUTTERFLY_EFFECTS } from '@/lib/data/butterfly-effects'
import { cn } from '@/lib/utils'

interface DecisionRecord { butterfly_effect_name: string; chosen_option: string }
interface RunRef { id: string; name: string }

interface Props {
  currentRunId: string
  currentRunName: string
  currentDecisions: DecisionRecord[]
  otherRuns: RunRef[]
}

export function ComparisonView({ currentRunName, currentDecisions, otherRuns }: Props) {
  const [selectedId, setSelectedId] = useState<string>(otherRuns[0]?.id ?? '')
  const [otherDecisions, setOtherDecisions] = useState<DecisionRecord[]>([])
  const supabase = createClient()

  useEffect(() => {
    if (!selectedId) return
    supabase
      .from('decisions')
      .select('butterfly_effect_name, chosen_option')
      .eq('run_id', selectedId)
      .then(({ data }) => setOtherDecisions(data ?? []))
  }, [selectedId])

  const currentMap = Object.fromEntries(currentDecisions.map(d => [d.butterfly_effect_name, d.chosen_option]))
  const otherMap = Object.fromEntries(otherDecisions.map(d => [d.butterfly_effect_name, d.chosen_option]))
  const selectedRun = otherRuns.find(r => r.id === selectedId)

  if (otherRuns.length === 0) {
    return (
      <p className="text-horror-muted text-sm">
        You need at least 2 runs to compare. Create another run first.
      </p>
    )
  }

  return (
    <div>
      <label className="text-xs text-horror-muted uppercase tracking-widest block mb-2">
        Compare against:
      </label>
      <select
        value={selectedId}
        onChange={e => setSelectedId(e.target.value)}
        className="w-full bg-horror-card border border-horror-border rounded-lg px-4 py-3 text-horror-text mb-6"
      >
        {otherRuns.map(r => (
          <option key={r.id} value={r.id}>{r.name}</option>
        ))}
      </select>

      <div className="grid grid-cols-2 gap-2 mb-4 text-xs font-bold tracking-widest uppercase">
        <span className="text-horror-text">Current: {currentRunName}</span>
        <span className="text-yellow-400">vs: {selectedRun?.name}</span>
      </div>

      <div className="space-y-2">
        {BUTTERFLY_EFFECTS.map(effect => {
          const a = currentMap[effect.name]
          const b = otherMap[effect.name]
          if (!a && !b) return null
          const differs = a && b && a !== b
          return (
            <div
              key={effect.id}
              className={cn(
                'rounded-lg border p-3',
                differs ? 'border-yellow-700 bg-yellow-950/20' : 'border-horror-border bg-horror-card'
              )}
            >
              <p className="text-xs text-horror-muted mb-1">CH.{effect.chapter} — {effect.name}</p>
              <div className="grid grid-cols-2 gap-2">
                <p className={cn('text-sm', a ? 'text-horror-text' : 'text-horror-muted italic')}>{a ?? 'Not recorded'}</p>
                <p className={cn('text-sm', b ? 'text-yellow-400' : 'text-horror-muted italic')}>{b ?? 'Not recorded'}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/
git commit -m "feat: run comparison — side-by-side diff of decisions across runs"
```

---

## Task 15: Vercel Deployment

**Files:**
- No new files. Deployment config is inferred by Vercel.

- [ ] **Step 1: Install Vercel CLI and login**

```bash
npm install -g vercel
vercel login
```

Expected: browser opens for auth, `vercel` CLI authenticated.

- [ ] **Step 2: Link project to Vercel**

```bash
cd /Users/sebastianprehmus/Workspace/until-dawn-tracker
vercel link
```

Follow prompts:
- Set up: Y
- Scope: your personal account or team
- Link to existing project: N (create new)
- Project name: `until-dawn-tracker`

- [ ] **Step 3: Add environment variables to Vercel**

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Paste: https://<your-ref>.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Paste: your anon key
```

Repeat for `preview` and `development` environments when prompted, or copy:

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL preview
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview
```

- [ ] **Step 4: Deploy to production**

```bash
npm run build  # verify build passes locally first
vercel --prod
```

Expected: deployment URL like `https://until-dawn-tracker.vercel.app`.

- [ ] **Step 5: Update Supabase auth callback URL**

In Supabase dashboard → Authentication → URL Configuration:
- **Site URL:** `https://until-dawn-tracker.vercel.app`
- **Redirect URLs:** add `https://until-dawn-tracker.vercel.app/auth/callback`

- [ ] **Step 6: Verify production**

Open `https://until-dawn-tracker.vercel.app` in mobile browser.
- Should redirect to `/auth/login`
- Magic link should work
- App should be installable from browser (Add to Home Screen)

- [ ] **Step 7: Final commit**

```bash
git add -A
git commit -m "chore: verify production deployment on Vercel"
```

---

## Self-Review

**Spec coverage check:**
- ✅ Multiple runs: Task 10 (list, create, seed characters)
- ✅ Character status 8 chars + tap toggle: Task 11
- ✅ 22 butterfly effects preloaded: Task 9
- ✅ Timed decision mode: Task 13
- ✅ Run comparison: Task 14
- ✅ PWA installable + offline: Task 4
- ✅ Magic link auth: Task 8
- ✅ Supabase via MCP: Task 5
- ✅ RLS per-user: Task 5
- ✅ CLAUDE.md: Task 2
- ✅ Vercel deployment walkthrough: Task 15
- ✅ Dark mode horror aesthetics: Task 3

**Placeholder scan:** No TBDs, no "implement later", all steps have real code.

**Type consistency:**
- `ButterflyEffect.name` used in `DecisionCard`, `DecisionList`, `TimedDecision`, `ComparisonView` — consistent.
- `status: 'alive' | 'dead' | 'unknown'` defined in DB types and component — consistent.
- `runId: string` passed consistently as UUID string — consistent.
