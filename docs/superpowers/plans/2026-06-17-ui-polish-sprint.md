# UI Polish Sprint Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix scene image rendering, improve progress dot usability, make the mountain silhouette visible, redesign the login page to match Until Dawn's atmosphere, and add logout + delete-run functionality.

**Architecture:** Six independent UI improvements to the existing Next.js PWA. Each task is self-contained with no dependency on the others. All changes are client-side rendering fixes or new client components backed by existing Supabase RLS.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS v4, Supabase JS client, Lucide React icons.

---

## File Map

| Task | Files |
|------|-------|
| 1 – Scene images | `src/components/decisions/ButterflyCard.tsx` |
| 2 – Progress dots | `src/components/decisions/CardNavigator.tsx` |
| 3 – Mountain silhouette | `src/components/effects/MountainSilhouette.tsx` |
| 4 – Login redesign | `src/app/auth/login/page.tsx` |
| 5 – Logout | `src/app/runs/page.tsx` (make client or add server action) + `src/components/runs/LogoutButton.tsx` (new) |
| 6 – Delete run | `src/components/runs/DeleteRunButton.tsx` (new) + `src/app/runs/page.tsx` |

---

## Task 1: Fix Scene Image Rendering in ButterflyCard

**Root cause:** The chapter gradient `<div>` uses fully-opaque dark colors (`from-[#1a0a0a] via-[#0d0508] to-[#050505]`) and is rendered *above* the `<img>` element with `absolute inset-0`, completely hiding any image that loads.

**Fix:** Track load/error state. Render the chapter gradient only as a fallback when the image fails. The bottom-fade gradient stays always.

**Files:**
- Modify: `src/components/decisions/ButterflyCard.tsx`

- [ ] **Step 1: Add image state tracking and fix the conditional rendering**

Replace the entire `ButterflyCard` component's image section (lines 87–117). Open `src/components/decisions/ButterflyCard.tsx`.

Change the import line to add `useState`:
```tsx
import { useState, useRef } from 'react'
```
(Already there — no change needed.)

Add two new state variables at the top of the function body, after `const supabase = createClient()`:
```tsx
const [imgError, setImgError] = useState(false)
```

Replace the entire `{/* Szenen-Bild oder Gradient-Fallback */}` block (lines 88–117) with:
```tsx
      {/* Szenen-Bild oder Gradient-Fallback */}
      <div className="relative h-48 overflow-hidden">
        {!imgError && effect.sceneImage && (
          <img
            src={`/scenes/${effect.sceneImage}`}
            alt=""
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        )}
        {/* Fallback-Gradient wenn kein Bild */}
        {(imgError || !effect.sceneImage) && (
          <div className={cn('absolute inset-0 bg-gradient-to-b', gradient)} />
        )}
        {/* Immer: Fade nach unten */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-horror-bg" />

        {/* Kapitel + Szenenname */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-horror-muted tracking-widest uppercase font-cinzel">
              {chapterLabel}
            </span>
            {effect.isTimed && (
              <span className="flex items-center gap-1 text-xs font-bold text-horror-accent tracking-widest">
                <Clock size={10} /> ZEITENTSCHEIDUNG
              </span>
            )}
          </div>
          <h2 className="font-cinzel-decorative text-xl font-bold text-horror-text">
            {effect.nameDe}
          </h2>
        </div>
      </div>
```

- [ ] **Step 2: Verify the fix manually**

Run `npm run dev`. Open a run page. Without images in `public/scenes/`, cards should show the gradient fallback cleanly. Now place any test image at `public/scenes/01-the-prank.jpg` and reload — card 1 should show the image with only the bottom fade applied over it.

Scene images for all 22 scenes should be placed as JPGs in `public/scenes/` named `01-the-prank.jpg` through `22-until-dawn.jpg` (matching the `sceneImage` field in `src/lib/data/butterfly-effects.ts`). These are game screenshots that the user provides manually.

- [ ] **Step 3: Commit**

```bash
git add src/components/decisions/ButterflyCard.tsx
git commit -m "fix: show scene images - remove opaque gradient overlay covering img element"
```

---

## Task 2: Larger, More Clickable Progress Dots

**Problem:** `h-1` = 4 px height. Near-impossible to click on desktop, especially on a screen with 22 dots.

**Fix:** Increase visual height to `h-2`, wrap each button in a taller hit-target container.

**Files:**
- Modify: `src/components/decisions/CardNavigator.tsx`

- [ ] **Step 1: Update the progress dot container and individual buttons**

In `src/components/decisions/CardNavigator.tsx`, replace the `{/* Fortschritts-Dots */}` section (lines 98–115):

```tsx
      {/* Fortschritts-Dots */}
      <div className="flex gap-0.5 mb-4 overflow-hidden py-2">
        {BUTTERFLY_EFFECTS.map((e, i) => (
          <button
            key={e.id}
            onClick={() => navigate(i, i > index ? 'forward' : 'back')}
            className={cn(
              'h-2 flex-1 rounded-full transition-all duration-200',
              i === index
                ? 'bg-horror-accent scale-y-150'
                : decisions[e.name]
                ? 'bg-green-800'
                : 'bg-horror-border'
            )}
            aria-label={`Szene ${i + 1}: ${e.nameDe}`}
            title={e.nameDe}
          />
        ))}
      </div>
```

Key changes:
- `h-1` → `h-2` (doubles visual height to 8 px)
- `py-2` on container (adds 8 px padding above/below, greatly increasing the hit target)
- `scale-y-150` on active dot (active dot is visually 50% taller than inactive)

- [ ] **Step 2: Verify manually**

Run `npm run dev`. Navigate to a run page. On desktop, the progress bar dots should be taller and easier to click. Hover/click individual dots — they should navigate to that scene. The active dot should appear slightly taller.

- [ ] **Step 3: Commit**

```bash
git add src/components/decisions/CardNavigator.tsx
git commit -m "fix: increase progress dot height and click target area"
```

---

## Task 3: Make Mountain Silhouette Visible

**Problem:** Mountain SVG colors (`#0a0c10`, `#0d0f12`, `#080a0d`) are nearly identical to the background (`#050505`). The silhouette is invisible.

**Fix:** Shift mountain colors toward dark blue-grey (`#10141c`, `#161b24`, `#0c1018`) to simulate moonlit mountains against the night sky.

**Files:**
- Modify: `src/components/effects/MountainSilhouette.tsx`

- [ ] **Step 1: Update mountain colors for visibility**

Replace the entire content of `src/components/effects/MountainSilhouette.tsx`:

```tsx
export function MountainSilhouette() {
  return (
    <div className="pointer-events-none fixed bottom-0 left-0 right-0" aria-hidden>
      <svg
        viewBox="0 0 800 200"
        preserveAspectRatio="xMidYMax slice"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full block"
        style={{ height: '160px' }}
      >
        <defs>
          <linearGradient id="fogGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#050505" stopOpacity="0" />
            <stop offset="100%" stopColor="#050505" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="snowGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c8d8e8" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#c8d8e8" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="moonGlow" cx="65%" cy="0%" r="40%">
            <stop offset="0%" stopColor="#c8d8e8" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#c8d8e8" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Mondlicht-Schimmer */}
        <rect x="0" y="0" width="800" height="200" fill="url(#moonGlow)" />

        {/* Hintergrund-Gebirge — sichtbares Dunkelblau */}
        <path
          d="M0,200 L0,140 L60,90 L100,115 L150,65 L200,100 L250,50 L300,88 L350,40 L400,75 L450,35 L500,70 L550,45 L600,80 L650,30 L700,70 L750,55 L800,80 L800,200 Z"
          fill="#10141c"
        />

        {/* Schnee-Highlights auf Hintergrundgipfeln */}
        <path
          d="M150,65 L160,80 L140,80 Z
             M250,50 L262,68 L238,68 Z
             M350,40 L363,60 L337,60 Z
             M450,35 L464,56 L436,56 Z
             M550,45 L562,63 L538,63 Z
             M650,30 L665,52 L635,52 Z"
          fill="url(#snowGrad)"
          opacity="0.7"
        />

        {/* Mittelgrund-Berge — leicht heller */}
        <path
          d="M0,200 L0,155 L50,130 L80,145 L120,100 L155,125 L195,80 L225,108 L270,58 L310,90 L345,68 L375,88 L410,48 L445,78 L480,55 L510,80 L545,38 L580,72 L615,58 L650,85 L685,42 L720,75 L760,60 L800,85 L800,200 Z"
          fill="#161b24"
        />

        {/* Schnee-Highlights Mittelgrund */}
        <path
          d="M270,58 L285,80 L255,80 Z
             M410,48 L427,73 L393,73 Z
             M545,38 L563,65 L527,65 Z
             M685,42 L702,68 L668,68 Z"
          fill="#c8d8e8"
          opacity="0.75"
        />

        {/* Scharfe Schnee-Kanten */}
        <path
          d="M270,58 L280,72 L270,70 L260,72 Z
             M410,48 L421,64 L410,62 L399,64 Z
             M545,38 L557,56 L545,54 L533,56 Z
             M685,42 L697,60 L685,58 L673,60 Z"
          fill="#e8f0f8"
          opacity="0.6"
        />

        {/* Vordergrund-Kamm — dunkelster Layer */}
        <path
          d="M0,200 L0,175 L30,170 L60,178 L90,165 L120,172 L150,160 L180,170 L210,158 L240,168 L270,155 L300,165 L330,158 L360,170 L390,162 L420,172 L450,160 L480,170 L510,162 L540,172 L570,165 L600,175 L630,168 L660,177 L690,165 L720,174 L750,168 L780,175 L800,170 L800,200 Z"
          fill="#0c1018"
        />

        {/* Tannen-Silhouetten */}
        <path
          d="M0,200 L8,168 L16,200 Z M18,200 L26,162 L34,200 Z M36,200 L46,156 L56,200 Z
             M58,200 L66,165 L74,200 Z M76,200 L85,158 L94,200 Z M96,200 L104,163 L112,200 Z
             M114,200 L124,154 L134,200 Z M136,200 L144,160 L152,200 Z M154,200 L162,157 L170,200 Z
             M172,200 L182,151 L192,200 Z M194,200 L202,159 L210,200 Z M212,200 L220,155 L228,200 Z
             M230,200 L240,149 L250,200 Z M252,200 L260,156 L268,200 Z M270,200 L280,153 L290,200 Z
             M292,200 L300,160 L308,200 Z M310,200 L320,154 L330,200 Z M332,200 L340,158 L348,200 Z
             M350,200 L360,152 L370,200 Z M372,200 L380,157 L388,200 Z M390,200 L400,153 L410,200 Z
             M412,200 L420,158 L428,200 Z M430,200 L440,151 L450,200 Z M452,200 L460,156 L468,200 Z
             M470,200 L480,153 L490,200 Z M492,200 L500,159 L508,200 Z M510,200 L520,154 L530,200 Z
             M532,200 L540,157 L548,200 Z M550,200 L560,151 L570,200 Z M572,200 L580,156 L588,200 Z
             M590,200 L600,153 L610,200 Z M612,200 L620,158 L628,200 Z M630,200 L640,154 L650,200 Z
             M652,200 L660,157 L668,200 Z M670,200 L680,152 L690,200 Z M692,200 L700,156 L708,200 Z
             M710,200 L720,153 L730,200 Z M732,200 L740,158 L748,200 Z M750,200 L760,154 L770,200 Z
             M772,200 L782,157 L792,200 Z M794,200 L800,160 L806,200 Z"
          fill="#090c11"
        />

        {/* Nebel-Overlay */}
        <rect x="0" y="130" width="800" height="70" fill="url(#fogGrad)" />
      </svg>
    </div>
  )
}
```

Key changes: background mountains `#0a0c10` → `#10141c`, midground `#0d0f12` → `#161b24`, foreground `#080a0d` → `#0c1018`, firs `#060809` → `#090c11`. Added a subtle moonlight radial gradient. Snow opacity increased.

- [ ] **Step 2: Verify manually**

Run `npm run dev`. Scroll to the bottom of any page. The mountain silhouette should now be clearly visible as dark blue-grey layers with snow-white peaks. The fir trees should also be distinguishable.

- [ ] **Step 3: Commit**

```bash
git add src/components/effects/MountainSilhouette.tsx
git commit -m "fix: increase mountain silhouette contrast with blue-grey tones and moonlight"
```

---

## Task 4: Immersive Login Page Redesign

**Problem:** The login page feels generic. The SVG hourglass is small (64×88px) and technically correct but not atmospherically matching the Until Dawn game title screen. The form box feels like a standard web app.

**Goal:** Recreate the game's title-screen atmosphere — dominant logo, dark cinematic presentation, minimal form.

Key Until Dawn aesthetic signals:
- Logo dominates the screen (not squeezed into a small SVG)
- "UNTIL" stacked above "DAWN" in large Cinzel Decorative, with the hourglass between them
- The hourglass is rendered large (200×280px), geometrically clean, gold + dark
- No card/box around the form — the form floats in darkness
- Gold separator line between logo area and form

**Files:**
- Modify: `src/app/auth/login/page.tsx`

- [ ] **Step 1: Rewrite the login page**

Replace the entire contents of `src/app/auth/login/page.tsx`:

```tsx
'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const searchParams = useSearchParams()
  const errorMsg = searchParams.get('error')

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
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
    <main className="min-h-screen flex flex-col items-center justify-between px-6 py-12 pb-32">

      {/* Logo-Bereich — dominant, cinematic */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-xs">

        {/* "UNTIL" */}
        <h1
          className="font-cinzel-decorative text-5xl font-black tracking-[0.2em] text-horror-text"
          style={{ textShadow: '0 0 30px rgba(220,38,38,0.4), 0 0 60px rgba(220,38,38,0.15)' }}
        >
          UNTIL
        </h1>

        {/* Hourglass SVG — groß, ikonisch */}
        <svg
          viewBox="0 0 100 130"
          className="w-28 h-36 my-1"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <defs>
            <filter id="goldGlow">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="sandTop" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c9a84c" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#c9a84c" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="sandBottom" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c9a84c" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#c9a84c" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Obere goldene Querleiste */}
          <rect x="8" y="3" width="84" height="7" rx="2" fill="#c9a84c" filter="url(#goldGlow)" />

          {/* Oberes Dreieck (Sand läuft aus) */}
          <polygon points="8,10 92,10 50,62" fill="#0a0a0a" stroke="#c9a84c" strokeWidth="1.5" />
          <polygon points="12,13 88,13 50,57" fill="url(#sandTop)" />

          {/* Sandfaden am Hals */}
          <line x1="50" y1="62" x2="50" y2="72" stroke="#c9a84c" strokeWidth="1.8" opacity="0.9" />
          <ellipse cx="50" cy="67" rx="2" ry="5" fill="#c9a84c" opacity="0.3" />

          {/* Unteres Dreieck (Sand sammelt sich) */}
          <polygon points="8,120 92,120 50,68" fill="#0a0a0a" stroke="#c9a84c" strokeWidth="1.5" />
          <polygon points="14,116 86,116 50,74" fill="url(#sandBottom)" />

          {/* Untere goldene Querleiste */}
          <rect x="8" y="120" width="84" height="7" rx="2" fill="#c9a84c" filter="url(#goldGlow)" />

          {/* Seitliche Pfeiler */}
          <rect x="4" y="10" width="4" height="110" rx="1" fill="#111" stroke="#c9a84c" strokeWidth="0.5" />
          <rect x="92" y="10" width="4" height="110" rx="1" fill="#111" stroke="#c9a84c" strokeWidth="0.5" />

          {/* Goldener Mittelpunkt-Akzent */}
          <circle cx="50" cy="65" r="3" fill="#c9a84c" opacity="0.9" filter="url(#goldGlow)" />
        </svg>

        {/* "DAWN" */}
        <h2
          className="font-cinzel-decorative text-5xl font-black tracking-[0.2em] text-horror-text"
          style={{ textShadow: '0 0 30px rgba(220,38,38,0.4), 0 0 60px rgba(220,38,38,0.15)' }}
        >
          DAWN
        </h2>

        {/* Goldene Trennlinie */}
        <div className="mt-5 flex items-center gap-3 w-full">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#c9a84c]" />
          <span className="text-[#c9a84c] text-[9px] tracking-[0.3em] font-cinzel uppercase opacity-70">
            Blackwood Mountain
          </span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#c9a84c]" />
        </div>
      </div>

      {/* Formular-Bereich — minimal, im Dunkel schwebend */}
      <div className="w-full max-w-xs">
        {errorMsg && (
          <div className="bg-red-950/80 border border-red-800 rounded-lg p-3 mb-4 text-sm text-red-300">
            {errorMsg}
          </div>
        )}

        {sent ? (
          <div className="text-center py-4">
            <p className="text-horror-text text-sm">Prüfe deine E-Mails für den Magic Link.</p>
            <p className="text-horror-muted text-xs mt-2">Du kannst diesen Tab schließen.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="deine@email.de"
              required
              className="w-full bg-black/60 border border-horror-border rounded-lg px-4 py-3 text-horror-text placeholder-horror-muted/50 focus:outline-none focus:border-[#c9a84c] transition-colors text-sm tracking-wide"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full border border-[#c9a84c]/60 hover:border-[#c9a84c] hover:bg-[#c9a84c]/10 disabled:opacity-40 text-[#c9a84c] font-cinzel text-sm font-bold tracking-[0.15em] uppercase rounded-lg px-4 py-3 transition-all tap-target"
            >
              {loading ? 'Sende…' : 'Eintreten'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
```

Key design changes:
- "UNTIL" and "DAWN" are now two large headings flanking the hourglass (stacked logo)
- Hourglass is `w-28 h-36` (112×144px) — significantly larger and more detailed
- Form floats at the bottom with no card/box
- Input field: dark transparent background, gold focus ring
- Submit button: gold-outlined ghost button (instead of red filled) — matches the game's aesthetic
- Button text changed to "Eintreten" ("Enter") for atmosphere

- [ ] **Step 2: Verify manually**

Run `npm run dev`. Open `/auth/login`. The page should show "UNTIL" at top, large hourglass in the center, "DAWN" below it, then a Blackwood Mountain divider, and the floating form at the bottom. Snow and lightning effects from the global layout should overlay everything. Mountain silhouette should be visible at the bottom.

- [ ] **Step 3: Commit**

```bash
git add src/app/auth/login/page.tsx
git commit -m "redesign: immersive Until Dawn login screen with stacked UNTIL/hourglass/DAWN logo"
```

---

## Task 5: Add Logout Button

**Approach:** Create a `LogoutButton` client component (needs `supabase.auth.signOut()` + router redirect). Add it to the runs list page header.

**Files:**
- Create: `src/components/runs/LogoutButton.tsx`
- Modify: `src/app/runs/page.tsx`

- [ ] **Step 1: Create LogoutButton component**

Create `src/components/runs/LogoutButton.tsx`:

```tsx
'use client'

import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-1.5 text-horror-muted hover:text-horror-text border border-horror-border hover:border-horror-accent rounded-lg px-3 py-2 text-sm transition-colors tap-target"
      title="Abmelden"
    >
      <LogOut size={16} />
      <span className="sr-only">Abmelden</span>
    </button>
  )
}
```

- [ ] **Step 2: Add LogoutButton to the runs page header**

In `src/app/runs/page.tsx`, add the import at the top:

```tsx
import { LogoutButton } from '@/components/runs/LogoutButton'
```

Then find the `<div className="flex items-center justify-between">` line that contains the run count and "Neuer Run" button. Change it to include a logout button:

```tsx
        <div className="flex items-center justify-between">
          <span className="text-horror-muted text-sm">{runs?.length ?? 0} {(runs?.length ?? 0) === 1 ? 'Run' : 'Runs'}</span>
          <div className="flex items-center gap-2">
            <LogoutButton />
            <Link
              href="/runs/new"
              className="flex items-center gap-1.5 bg-horror-accent hover:bg-horror-accent-hover text-white text-sm font-semibold px-3 py-2 rounded-lg transition-colors tap-target"
            >
              <Plus size={16} />
              Neuer Run
            </Link>
          </div>
        </div>
```

- [ ] **Step 3: Verify manually**

Run `npm run dev`. Log in and navigate to `/runs`. A logout icon button should appear left of "Neuer Run". Click it → redirected to `/auth/login` and the session is ended.

- [ ] **Step 4: Commit**

```bash
git add src/components/runs/LogoutButton.tsx src/app/runs/page.tsx
git commit -m "feat: add logout button to runs page header"
```

---

## Task 6: Delete Run Functionality

**Approach:** Create a `DeleteRunButton` client component that shows a confirmation dialog before deleting. The runs page wraps each `RunCard` with this button. Supabase RLS ensures only the run owner can delete (existing policy: `auth.uid() = user_id`). Use `router.refresh()` to re-fetch the updated list after deletion.

**Files:**
- Create: `src/components/runs/DeleteRunButton.tsx`
- Modify: `src/app/runs/page.tsx`

- [ ] **Step 1: Create DeleteRunButton component**

Create `src/components/runs/DeleteRunButton.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface DeleteRunButtonProps {
  runId: string
  runName: string
}

export function DeleteRunButton({ runId, runName }: DeleteRunButtonProps) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleDelete() {
    setLoading(true)
    await supabase.from('runs').delete().eq('id', runId)
    router.refresh()
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-horror-muted hidden sm:inline">
          „{runName}" löschen?
        </span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-xs text-red-400 border border-red-900 hover:bg-red-950 rounded px-2 py-1 transition-colors disabled:opacity-50"
        >
          {loading ? '…' : 'Ja'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs text-horror-muted border border-horror-border hover:border-horror-accent rounded px-2 py-1 transition-colors"
        >
          Nein
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={(e) => { e.preventDefault(); setConfirming(true) }}
      className={cn(
        'shrink-0 text-horror-muted hover:text-red-400 p-2 rounded transition-colors tap-target',
      )}
      title={`„${runName}" löschen`}
    >
      <Trash2 size={16} />
    </button>
  )
}
```

Note: `e.preventDefault()` is essential — the `DeleteRunButton` is rendered inside a `<Link>`, so without it, clicking the trash icon would navigate to the run.

- [ ] **Step 2: Add DeleteRunButton to the runs list**

In `src/app/runs/page.tsx`, add the import:

```tsx
import { DeleteRunButton } from '@/components/runs/DeleteRunButton'
```

Then find the `{runs.map(run => ...)}` block and update it to wrap each run in a flex row that shows the card + delete button:

```tsx
      {runs && runs.length > 0 ? (
        <div className="space-y-3">
          {runs.map(run => (
            <div key={run.id} className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <RunCard id={run.id} name={run.name} createdAt={run.created_at} />
              </div>
              <DeleteRunButton runId={run.id} runName={run.name} />
            </div>
          ))}
        </div>
      ) : (
```

- [ ] **Step 3: Verify manually**

Run `npm run dev`. Navigate to `/runs`. A trash icon should appear to the right of each run card. Click it → "Ja/Nein" confirmation appears inline. Click "Ja" → run disappears from the list. Click "Nein" → returns to normal. Verify in Supabase dashboard that the row (and its cascaded characters + decisions) is deleted.

- [ ] **Step 4: Commit**

```bash
git add src/components/runs/DeleteRunButton.tsx src/app/runs/page.tsx
git commit -m "feat: add delete run button with inline confirmation"
```

---

## Self-Review

**Spec coverage check:**
- ✅ Progress dots larger/clickable → Task 2
- ✅ Scene images showing → Task 1 (fix + note about placing images)
- ✅ Login immersive redesign → Task 4
- ✅ Mountain silhouette visible → Task 3
- ✅ Logout function → Task 5
- ✅ Delete runs → Task 6

**No placeholders found.** All steps contain concrete code.

**Type consistency:**
- `DeleteRunButton` props: `runId: string`, `runName: string` — matches the `runs` table `id` and `name` fields used in `runs/page.tsx`.
- `LogoutButton` takes no props — correct.
- `ButterflyCard` adds only `const [imgError, setImgError] = useState(false)` — existing props unchanged.
