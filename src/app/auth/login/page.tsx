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
        <div className="mb-8">
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
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
