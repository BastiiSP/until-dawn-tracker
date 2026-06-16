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
