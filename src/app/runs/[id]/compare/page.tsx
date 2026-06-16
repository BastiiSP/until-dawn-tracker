import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ComparisonViewClient } from '@/components/comparison/ComparisonViewClient'

export default async function ComparePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: currentRun }, { data: allRuns }] = await Promise.all([
    supabase.from('runs').select('id, name').eq('id', id).eq('user_id', user!.id).single(),
    supabase
      .from('runs')
      .select('id, name')
      .eq('user_id', user!.id)
      .neq('id', id)
      .order('created_at', { ascending: false }),
  ])

  if (!currentRun) notFound()

  const { data: currentDecisions } = await supabase
    .from('decisions')
    .select('butterfly_effect_name, chosen_option')
    .eq('run_id', id)

  return (
    <main className="min-h-screen px-4 py-8 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/runs/${id}`} className="text-horror-muted tap-target flex items-center">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-horror-text font-cinzel">Vergleich</h1>
      </div>

      <ComparisonViewClient
        currentRunName={currentRun.name}
        currentDecisions={currentDecisions ?? []}
        otherRuns={(allRuns ?? []).map(r => ({ id: r.id, name: r.name }))}
      />
    </main>
  )
}
