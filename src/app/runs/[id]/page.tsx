import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BarChart2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { CharacterGrid } from '@/components/characters/CharacterGrid'
import { CardNavigator } from '@/components/decisions/CardNavigator'

export default async function RunPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  const [
    { data: run },
    { data: characters },
    { data: decisions },
    { data: allRuns },
  ] = await Promise.all([
    supabase.from('runs').select('id, name').eq('id', id).eq('user_id', user.id).single(),
    supabase.from('characters').select('id, name, status').eq('run_id', id).order('name'),
    supabase.from('decisions').select('butterfly_effect_name, chosen_option').eq('run_id', id),
    supabase.from('runs').select('id, name').eq('user_id', user.id).neq('id', id).order('created_at', { ascending: false }),
  ])

  if (!run) notFound()

  const otherRunDecisions = await Promise.all(
    (allRuns ?? []).map(async (r) => {
      const { data: otherDecisions } = await supabase
        .from('decisions')
        .select('butterfly_effect_name, chosen_option')
        .eq('run_id', r.id)
      return {
        runId: r.id,
        runName: r.name,
        choices: Object.fromEntries(
          (otherDecisions ?? []).map(d => [d.butterfly_effect_name, d.chosen_option])
        ),
      }
    })
  )

  return (
    <main className="min-h-screen px-4 py-8 max-w-lg mx-auto pb-24">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/runs" className="text-horror-muted tap-target flex items-center">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-cinzel text-lg font-bold text-horror-text truncate max-w-[200px]">
            {run.name}
          </h1>
        </div>
        {(allRuns ?? []).length > 0 && (
          <Link
            href={`/runs/${id}/compare`}
            className="flex items-center gap-1.5 text-sm text-horror-muted border border-horror-border rounded-lg px-3 py-2 hover:border-horror-accent tap-target"
          >
            <BarChart2 size={14} /> Vergleich
          </Link>
        )}
      </div>

      <section className="mb-8">
        <h2 className="text-xs font-bold tracking-widest text-horror-muted uppercase mb-3 font-cinzel">
          Charaktere
        </h2>
        <CharacterGrid characters={(characters ?? []) as Array<{ id: string; name: string; status: 'alive' | 'dead' | 'unknown' }>} />
      </section>

      <section>
        <h2 className="text-xs font-bold tracking-widest text-horror-muted uppercase mb-4 font-cinzel">
          Schmetterlingseffekte
        </h2>
        <CardNavigator
          runId={id}
          initialDecisions={decisions ?? []}
          otherRuns={otherRunDecisions}
        />
      </section>
    </main>
  )
}
