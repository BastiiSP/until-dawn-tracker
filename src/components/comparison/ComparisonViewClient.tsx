'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BUTTERFLY_EFFECTS } from '@/lib/data/butterfly-effects'
import { cn } from '@/lib/utils'

interface DecisionRecord {
  butterfly_effect_name: string
  chosen_option: string
}

interface RunRef {
  id: string
  name: string
}

interface ComparisonViewClientProps {
  currentRunName: string
  currentDecisions: DecisionRecord[]
  otherRuns: RunRef[]
}

export function ComparisonViewClient({ currentRunName, currentDecisions, otherRuns }: ComparisonViewClientProps) {
  const [selectedId, setSelectedId] = useState<string>(otherRuns[0]?.id ?? '')
  const [otherDecisions, setOtherDecisions] = useState<DecisionRecord[]>([])
  const supabase = createClient()

  useEffect(() => {
    if (!selectedId) return
    supabase
      .from('decisions')
      .select('butterfly_effect_name, chosen_option')
      .eq('run_id', selectedId)
      .then(({ data }) => setOtherDecisions(data ?? []))
  }, [selectedId])

  const currentMap = Object.fromEntries(
    currentDecisions.map(d => [d.butterfly_effect_name, d.chosen_option])
  )
  const otherMap = Object.fromEntries(
    otherDecisions.map(d => [d.butterfly_effect_name, d.chosen_option])
  )
  const selectedRun = otherRuns.find(r => r.id === selectedId)

  if (otherRuns.length === 0) {
    return (
      <p className="text-horror-muted text-sm">
        Du brauchst mindestens 2 Runs zum Vergleichen. Erstelle zuerst einen weiteren Run.
      </p>
    )
  }

  const effectsWithData = BUTTERFLY_EFFECTS.filter(
    e => currentMap[e.name] || otherMap[e.name]
  )

  return (
    <div>
      <label className="text-xs text-horror-muted uppercase tracking-widest block mb-2 font-cinzel">
        Vergleichen mit:
      </label>
      <select
        value={selectedId}
        onChange={e => setSelectedId(e.target.value)}
        className="w-full bg-horror-card border border-horror-border rounded-lg px-4 py-3 text-horror-text mb-6 focus:outline-none focus:border-horror-accent"
      >
        {otherRuns.map(r => (
          <option key={r.id} value={r.id}>{r.name}</option>
        ))}
      </select>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <span className="text-xs font-bold tracking-widest uppercase text-horror-text truncate font-cinzel">
          {currentRunName}
        </span>
        <span className="text-xs font-bold tracking-widest uppercase text-yellow-400 truncate font-cinzel">
          {selectedRun?.name}
        </span>
      </div>

      {effectsWithData.length === 0 ? (
        <p className="text-horror-muted text-sm text-center py-8">
          Noch keine Entscheidungen in einem der Runs aufgezeichnet.
        </p>
      ) : (
        <div className="space-y-2">
          {effectsWithData.map(effect => {
            const a = currentMap[effect.name]
            const b = otherMap[effect.name]
            const differs = Boolean(a && b && a !== b)

            const labelA = a ? effect.optionsDe[effect.options.indexOf(a as typeof effect.options[0])] ?? a : undefined
            const labelB = b ? effect.optionsDe[effect.options.indexOf(b as typeof effect.options[0])] ?? b : undefined

            return (
              <div
                key={effect.id}
                className={cn(
                  'rounded-lg border p-3',
                  differs
                    ? 'border-yellow-700 bg-yellow-950/20'
                    : 'border-horror-border bg-horror-card'
                )}
              >
                <p className="text-xs text-horror-muted mb-1 font-cinzel">
                  Kap.{effect.chapter === 0 ? ' Prolog' : effect.chapter} — {effect.nameDe}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <p className={cn('text-sm', labelA ? 'text-horror-text' : 'text-horror-muted italic')}>
                    {labelA ?? 'Nicht erfasst'}
                  </p>
                  <p className={cn('text-sm', labelB ? 'text-yellow-400' : 'text-horror-muted italic')}>
                    {labelB ?? 'Nicht erfasst'}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
