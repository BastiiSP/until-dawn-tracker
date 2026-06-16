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
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          {/* Hourglass — Until Dawn's iconic symbol */}
          <svg
            viewBox="0 0 40 60"
            className="w-10 h-14 text-horror-accent opacity-60 mb-5"
            fill="currentColor"
            aria-hidden
          >
            <rect x="3" y="0" width="34" height="3" rx="1" />
            <rect x="3" y="57" width="34" height="3" rx="1" />
            <path
              d="M5,3 L35,3 L20,29 L35,57 L5,57 L20,29 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path d="M8,5 L32,5 L20,25 Z" opacity="0.35" />
            <line x1="20" y1="29" x2="20" y2="36" stroke="currentColor" strokeWidth="1" opacity="0.55" />
            <path d="M13,55 L27,55 L24,41 L16,41 Z" opacity="0.45" />
          </svg>
          <h1 className="font-cinzel text-4xl font-black text-horror-accent tracking-widest text-glow-red animate-flicker">
            UNTIL DAWN
          </h1>
          <p className="text-horror-muted text-xs tracking-widest uppercase mt-1">Blackwood Mountain — Decision Tracker</p>
        </div>

        {errorMsg && (
          <div className="bg-red-950 border border-red-800 rounded-lg p-3 mb-4 text-sm text-red-300">
            {errorMsg}
          </div>
        )}

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

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
