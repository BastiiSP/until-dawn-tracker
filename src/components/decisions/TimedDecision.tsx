'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { BUTTERFLY_EFFECTS } from '@/lib/data/butterfly-effects'

interface TimedDecisionModeProps {
  runId: string
  savedDecisions: Array<{ butterfly_effect_name: string; chosen_option: string }>
  onClose: () => void
}

export function TimedDecisionMode({ runId, savedDecisions, onClose }: TimedDecisionModeProps) {
  const timedEffects = BUTTERFLY_EFFECTS.filter(e => e.isTimed)
  const [index, setIndex] = useState(0)
  const [chosen, setChosen] = useState<string | null>(null)
  const supabase = createClient()

  const effect = timedEffects[index]
  const existingChoice = savedDecisions.find(
    d => d.butterfly_effect_name === effect.name
  )?.chosen_option

  async function choose(option: string) {
    if (chosen !== null) return
    setChosen(option)

    const { data: existing } = await supabase
      .from('decisions')
      .select('id')
      .eq('run_id', runId)
      .eq('butterfly_effect_name', effect.name)
      .maybeSingle()

    if (existing) await supabase.from('decisions').delete().eq('id', existing.id)

    await supabase.from('decisions').insert({
      run_id: runId,
      chapter: effect.chapter,
      butterfly_effect_name: effect.name,
      chosen_option: option,
    })

    setTimeout(() => {
      setChosen(null)
      if (index + 1 < timedEffects.length) {
        setIndex(i => i + 1)
      } else {
        onClose()
      }
    }, 700)
  }

  return (
    <div className="fixed inset-0 bg-horror-bg z-50 flex flex-col">
      <div className="flex items-center justify-between px-4 py-4 border-b border-horror-border">
        <span className="text-xs text-horror-muted font-bold tracking-widest uppercase">
          Timed Mode — {index + 1}/{timedEffects.length}
        </span>
        <button onClick={onClose} className="text-horror-muted text-sm tap-target px-2">
          Exit
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6">
        <p className="text-xs text-horror-accent font-bold tracking-widest mb-2 uppercase">
          Ch. {effect.chapter} — Timed Decision
        </p>
        <h2 className="text-3xl font-bold text-horror-text mb-4">{effect.name}</h2>
        <p className="text-horror-muted mb-10 text-lg leading-relaxed">{effect.description}</p>

        {existingChoice && (
          <p className="text-sm text-horror-muted mb-6 italic">
            Current: <span className="text-yellow-400">{existingChoice}</span>
          </p>
        )}

        <div className="space-y-4">
          {effect.options.map(option => (
            <button
              key={option}
              onClick={() => choose(option)}
              disabled={chosen !== null}
              className={cn(
                'w-full text-left rounded-xl border px-6 py-5 text-lg font-semibold transition-all active:scale-[0.98]',
                chosen === option
                  ? 'bg-horror-accent border-horror-accent text-white'
                  : 'bg-horror-card border-horror-border text-horror-text hover:border-horror-accent'
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
