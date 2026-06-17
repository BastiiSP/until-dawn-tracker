'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [otpError, setOtpError] = useState<string | null>(null)
  const supabase = createClient()
  const searchParams = useSearchParams()
  const errorMsg = searchParams.get('error')

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setOtpError(null)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    })
    if (error) {
      setOtpError('Fehler beim Senden. Bitte versuche es erneut.')
      setLoading(false)
      return
    }
    setSent(true)
    setLoading(false)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-between px-6 py-12 pb-32">

      {/* Logo-Bereich */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-xs">

        <h1
          className="font-cinzel-decorative text-5xl font-black tracking-[0.2em] text-horror-text"
          style={{ textShadow: '0 0 30px rgba(220,38,38,0.4), 0 0 60px rgba(220,38,38,0.15)' }}
        >
          UNTIL
        </h1>

        <svg
          viewBox="0 0 100 130"
          className="w-28 h-36 my-1"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <defs>
            <filter id="login-goldGlow">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="login-sandTop" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c9a84c" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#c9a84c" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="login-sandBottom" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c9a84c" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#c9a84c" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          <rect x="8" y="3" width="84" height="7" rx="2" fill="#c9a84c" filter="url(#login-goldGlow)" />

          <polygon points="8,10 92,10 50,62" fill="#0a0a0a" stroke="#c9a84c" strokeWidth="1.5" />
          <polygon points="12,13 88,13 50,57" fill="url(#login-sandTop)" />

          <line x1="50" y1="62" x2="50" y2="72" stroke="#c9a84c" strokeWidth="1.8" opacity="0.9" />
          <ellipse cx="50" cy="67" rx="2" ry="5" fill="#c9a84c" opacity="0.3" />

          <polygon points="8,120 92,120 50,68" fill="#0a0a0a" stroke="#c9a84c" strokeWidth="1.5" />
          <polygon points="14,116 86,116 50,74" fill="url(#login-sandBottom)" />

          <rect x="8" y="120" width="84" height="7" rx="2" fill="#c9a84c" filter="url(#login-goldGlow)" />

          <rect x="4" y="10" width="4" height="110" rx="1" fill="#111" stroke="#c9a84c" strokeWidth="0.5" />
          <rect x="92" y="10" width="4" height="110" rx="1" fill="#111" stroke="#c9a84c" strokeWidth="0.5" />

          <circle cx="50" cy="65" r="3" fill="#c9a84c" opacity="0.9" filter="url(#login-goldGlow)" />
        </svg>

        <h2
          className="font-cinzel-decorative text-5xl font-black tracking-[0.2em] text-horror-text"
          style={{ textShadow: '0 0 30px rgba(220,38,38,0.4), 0 0 60px rgba(220,38,38,0.15)' }}
        >
          DAWN
        </h2>

        <div className="mt-5 flex items-center gap-3 w-full">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#c9a84c]" />
          <span className="text-[#c9a84c] text-[9px] tracking-[0.3em] font-cinzel uppercase opacity-70">
            Blackwood Mountain
          </span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#c9a84c]" />
        </div>
      </div>

      {/* Formular-Bereich */}
      <div className="w-full max-w-xs">
        {errorMsg && (
          <div className="bg-red-950/80 border border-red-800 rounded-lg p-3 mb-4 text-sm text-red-300">
            {errorMsg}
          </div>
        )}

        {otpError && (
          <div className="bg-red-950/80 border border-red-800 rounded-lg p-3 mb-4 text-sm text-red-300">
            {otpError}
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
