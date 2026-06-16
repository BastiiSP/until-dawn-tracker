import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, GitCompare } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { CharacterGrid } from '@/components/characters/CharacterGrid'
import { DecisionList } from '@/components/decisions/DecisionList'
import { TimedModeButton } from '@/components/decisions/TimedModeButton'

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
          <Link href="/runs" className="text-horror-muted tap-target flex items-center">
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
        <CharacterGrid characters={(characters ?? []) as Array<{ id: string; name: string; status: 'alive' | 'dead' | 'unknown' }>} />
      </section>

      <section className="mb-6">
        <TimedModeButton runId={id} savedDecisions={decisions ?? []} />
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
