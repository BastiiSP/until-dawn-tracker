'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { ButterflyEffect } from '@/lib/data/butterfly-effects'

interface DecisionCardProps {
  effect: ButterflyEffect
  runId: string
  existingChoice?: string
  comparisonChoice?: string
}

export function DecisionCard({ effect, runId, existingChoice, comparisonChoice }: DecisionCardProps) {
  const [chosen, setChosen] = useState<string | undefined>(existingChoice)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function choose(option: string) {
    if (loading) return
    setLoading(true)
    setChosen(option) // optimistic

    const { data: existing } = await supabase
      .from('decisions')
      .select('id')
      .eq('run_id', runId)
      .eq('butterfly_effect_name', effect.name)
      .maybeSingle()

    if (existing) {
      await supabase.from('decisions').delete().eq('id', existing.id)
    }

    await supabase.from('decisions').insert({
      run_id: runId,
      chapter: effect.chapter,
      butterfly_effect_name: effect.name,
      chosen_option: option,
    })
    setLoading(false)
  }

  return (
    <div className={cn(
      'bg-horror-card border rounded-lg p-4',
      effect.isTimed ? 'border-horror-accent animate-pulse-red' : 'border-horror-border'
    )}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs text-horror-muted">CH. {effect.chapter}</span>
        {effect.isTimed && (
          <span className="text-xs font-bold text-horror-accent tracking-widest">TIMED</span>
        )}
      </div>
      <h3 className="font-semibold text-horror-text mb-1">{effect.name}</h3>
      <p className="text-sm text-horror-muted mb-3">{effect.description}</p>

      {comparisonChoice && (
        <p className="text-xs text-horror-muted mb-2 italic">
          Previous run: <span className="text-yellow-400">{comparisonChoice}</span>
        </p>
      )}

      <div className="grid grid-cols-2 gap-2">
        {effect.options.map(option => (
          <button
            key={option}
            onClick={() => choose(option)}
            disabled={loading}
            className={cn(
              'rounded-lg py-3 px-2 text-sm font-semibold transition-all active:scale-95 tap-target',
              chosen === option
                ? 'bg-horror-accent text-white border border-horror-accent'
                : 'bg-horror-bg border border-horror-border text-horror-muted hover:border-horror-accent hover:text-horror-text'
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}
