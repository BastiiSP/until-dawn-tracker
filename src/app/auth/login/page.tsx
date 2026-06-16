'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

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
