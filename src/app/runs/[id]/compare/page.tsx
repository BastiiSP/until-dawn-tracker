import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { RunTimeline } from '@/components/comparison/RunTimeline'

export default async function ComparePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  const [{ data: currentRun }, { data: allRuns }, { data: currentDecisions }] = await Promise.all([
    supabase.from('runs').select('id, name').eq('id', id).eq('user_id', user.id).single(),
    supabase.from('runs').select('id, name').eq('user_id', user.id).neq('id', id).order('created_at', { ascending: false }),
    supabase.from('decisions').select('butterfly_effect_name, chosen_option').eq('run_id', id),
  ])

  if (!currentRun) notFound()

  const otherRunsWithDecisions = await Promise.all(
    (allRuns ?? []).map(async (r) => {
      const { data: decisions } = await supabase
        .from('decisions')
        .select('butterfly_effect_name, chosen_option')
        .eq('run_id', r.id)
      return {
        id: r.id,
        name: r.name,
        choices: Object.fromEntries(
          (decisions ?? []).map(d => [d.butterfly_effect_name, d.chosen_option])
        ),
      }
    })
  )

  return (
    <main className="min-h-screen px-4 py-8 max-w-lg mx-auto pb-24">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/runs/${id}`} className="text-horror-muted tap-target flex items-center">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-cinzel text-xl font-bold text-horror-text">Run-Vergleich</h1>
      </div>

      <RunTimeline
        currentRun={{
          id: currentRun.id,
          name: currentRun.name,
          choices: Object.fromEntries(
            (currentDecisions ?? []).map(d => [d.butterfly_effect_name, d.chosen_option])
          ),
        }}
        otherRuns={otherRunsWithDecisions}
      />
    </main>
  )
}
