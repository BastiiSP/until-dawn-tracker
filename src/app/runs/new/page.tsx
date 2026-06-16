'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CHARACTERS } from '@/lib/data/butterfly-effects'
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
    if (!user) { setLoading(false); return }

    const { data: run, error } = await supabase
      .from('runs')
      .insert({ name: runName.trim(), user_id: user.id })
      .select('id')
      .single()

    if (error || !run) { setLoading(false); return }

    await supabase.from('characters').insert(
      CHARACTERS.map(charName => ({
        run_id: run.id,
        name: charName,
        status: 'unknown' as const,
      }))
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
