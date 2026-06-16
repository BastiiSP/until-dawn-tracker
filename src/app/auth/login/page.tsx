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
          {/* Until Dawn iconic hourglass — black body, gold frame, title integrated */}
          <svg
            viewBox="0 0 80 110"
            className="w-16 h-[88px] mb-5"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            {/* Outer gold frame — top bar */}
            <rect x="4" y="0" width="72" height="6" rx="2" fill="#c9a84c" />
            {/* Outer gold frame — bottom bar */}
            <rect x="4" y="104" width="72" height="6" rx="2" fill="#c9a84c" />

            {/* Hourglass body outline */}
            <path
              d="M8,6 L72,6 L40,52 L72,104 L8,104 L40,52 Z"
              fill="#0a0a0a"
              stroke="#c9a84c"
              strokeWidth="1.5"
            />

            {/* Upper sand (draining) */}
            <path d="M12,9 L68,9 L40,46 Z" fill="#c9a84c" opacity="0.25" />

            {/* Sand stream at neck */}
            <line x1="40" y1="52" x2="40" y2="62" stroke="#c9a84c" strokeWidth="1.5" opacity="0.6" />

            {/* Lower sand (accumulating) */}
            <path d="M22,101 L58,101 L52,72 L28,72 Z" fill="#c9a84c" opacity="0.35" />

            {/* Decorative side pillars */}
            <rect x="4" y="6" width="4" height="98" rx="1" fill="#1a1a1a" stroke="#c9a84c" strokeWidth="0.5" />
            <rect x="72" y="6" width="4" height="98" rx="1" fill="#1a1a1a" stroke="#c9a84c" strokeWidth="0.5" />

            {/* "UNTIL DAWN" text integrated into middle */}
            <text
              x="40"
              y="56"
              textAnchor="middle"
              fill="#c9a84c"
              fontSize="5"
              fontFamily="Georgia, serif"
              letterSpacing="2"
              fontWeight="bold"
            >UNTIL DAWN</text>
          </svg>
          <h1 className="font-cinzel text-4xl font-black text-horror-accent tracking-widest text-glow-red animate-flicker">
            UNTIL DAWN
          </h1>
          <p className="text-horror-muted text-xs tracking-widest uppercase mt-1">Blackwood Mountain — Entscheidungs-Tracker</p>
        </div>

        {errorMsg && (
          <div className="bg-red-950 border border-red-800 rounded-lg p-3 mb-4 text-sm text-red-300">
            {errorMsg}
          </div>
        )}

        {sent ? (
          <div className="bg-horror-card border border-horror-border rounded-lg p-6 text-center">
            <p className="text-horror-text">Prüfe deine E-Mails für den Magic Link.</p>
            <p className="text-horror-muted text-sm mt-2">Du kannst diesen Tab schließen.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="deine@email.de"
              required
              className="w-full bg-horror-card border border-horror-border rounded-lg px-4 py-3 text-horror-text placeholder-horror-muted focus:outline-none focus:border-horror-accent transition-colors"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-horror-accent hover:bg-horror-accent-hover disabled:opacity-50 text-white font-semibold rounded-lg px-4 py-3 transition-colors tap-target"
            >
              {loading ? 'Sende…' : 'Magic Link senden'}
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
