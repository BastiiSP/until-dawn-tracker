import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { RunCard } from '@/components/runs/RunCard'
import { LogoutButton } from '@/components/runs/LogoutButton'

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
      <div className="mb-8">
        <h1 className="font-cinzel text-3xl font-bold tracking-widest text-horror-text mb-1 animate-flicker">
          UNTIL DAWN
        </h1>
        <p className="text-horror-muted text-xs tracking-widest uppercase mb-4">Entscheidungs-Tracker — Blackwood Mountain</p>
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
      </div>

      {runs && runs.length > 0 ? (
        <div className="space-y-3">
          {runs.map(run => (
            <RunCard key={run.id} id={run.id} name={run.name} createdAt={run.created_at} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-horror-muted">Noch keine Runs vorhanden.</p>
          <p className="text-horror-muted text-sm mt-1">Erstelle deinen ersten Run, um zu beginnen.</p>
        </div>
      )}
    </main>
  )
}
