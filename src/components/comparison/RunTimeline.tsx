'use client'

import { BUTTERFLY_EFFECTS } from '@/lib/data/butterfly-effects'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface RunData {
  id: string
  name: string
  choices: Record<string, string>
}

interface RunTimelineProps {
  currentRun: RunData
  otherRuns: RunData[]
}

export function RunTimeline({ currentRun, otherRuns }: RunTimelineProps) {
  const [expandedEffect, setExpandedEffect] = useState<number | null>(null)
  const allRuns = [currentRun, ...otherRuns]

  if (otherRuns.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-horror-muted">Du brauchst mindestens 2 Runs für einen Vergleich.</p>
        <p className="text-horror-muted text-sm mt-1">Erstelle einen weiteren Run, um Unterschiede zu sehen.</p>
      </div>
    )
  }

  const chapters = [...new Set(BUTTERFLY_EFFECTS.map(e => e.chapter))].sort((a, b) => a - b)

  return (
    <div>
      {/* Run-Legende */}
      <div className="flex flex-wrap gap-2 mb-6">
        {allRuns.map((run, i) => (
          <div key={run.id} className="flex items-center gap-1.5">
            <div className={cn('w-3 h-3 rounded-full', i === 0 ? 'bg-horror-accent' : 'bg-[#7db8cc]')} />
            <span className="text-xs text-horror-muted">{run.name}</span>
          </div>
        ))}
      </div>

      {/* Zeitstrahl pro Kapitel */}
      {chapters.map(ch => {
        const effects = BUTTERFLY_EFFECTS.filter(e => e.chapter === ch)
        const chapterLabel = ch === 0 ? 'Prolog' : `Kapitel ${ch}`

        return (
          <div key={ch} className="mb-6">
            <h3 className="text-xs font-bold tracking-widest text-horror-muted uppercase mb-2 font-cinzel">
              {chapterLabel}
            </h3>

            <div className="space-y-1">
              {effects.map(effect => {
                const choices = allRuns.map(r => r.choices[effect.name])
                const anyChosen = choices.some(Boolean)
                const hasDivergence = anyChosen &&
                  choices.filter(Boolean).length > 1 &&
                  new Set(choices.filter(Boolean)).size > 1

                const isExpanded = expandedEffect === effect.id

                return (
                  <button
                    key={effect.id}
                    onClick={() => setExpandedEffect(isExpanded ? null : effect.id)}
                    className={cn(
                      'w-full text-left rounded-lg border px-3 py-2.5 transition-all',
                      hasDivergence
                        ? 'border-[#4a3800] bg-[#1a1400]'
                        : anyChosen
                        ? 'border-horror-border bg-horror-card'
                        : 'border-horror-border/40 bg-transparent opacity-50'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        'text-sm font-semibold',
                        hasDivergence ? 'text-[#c9a84c]' : 'text-horror-text'
                      )}>
                        {effect.nameDe}
                        {hasDivergence && ' ⚡'}
                      </span>

                      {/* Run-Dots */}
                      <div className="flex gap-1.5 ml-2 shrink-0">
                        {allRuns.map((run, i) => {
                          const choice = run.choices[effect.name]
                          const isOpt1 = choice === effect.options[0]
                          return (
                            <div
                              key={run.id}
                              className={cn(
                                'w-2.5 h-2.5 rounded-full',
                                !choice && 'bg-horror-border opacity-40',
                                choice && isOpt1 && (i === 0 ? 'bg-horror-accent' : 'bg-[#7db8cc]'),
                                choice && !isOpt1 && (i === 0 ? 'bg-red-900' : 'bg-[#4a6a7a]')
                              )}
                              title={choice ?? 'Nicht entschieden'}
                            />
                          )
                        })}
                      </div>
                    </div>

                    {/* Expandierte Details */}
                    {isExpanded && anyChosen && (
                      <div className="mt-2 pt-2 border-t border-horror-border/50 space-y-1">
                        {allRuns.map((run, i) => {
                          const choice = run.choices[effect.name]
                          if (!choice) return null
                          const isOpt1 = choice === effect.options[0]
                          const label = isOpt1 ? effect.optionsDe[0] : effect.optionsDe[1]
                          return (
                            <div key={run.id} className="flex items-center gap-2">
                              <div className={cn(
                                'w-2 h-2 rounded-full shrink-0',
                                i === 0 ? 'bg-horror-accent' : 'bg-[#7db8cc]'
                              )} />
                              <span className="text-xs text-horror-muted">{run.name}:</span>
                              <span className="text-xs text-horror-text">{label}</span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
