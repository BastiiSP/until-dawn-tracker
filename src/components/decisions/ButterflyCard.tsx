'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { ButterflyEffect } from '@/lib/data/butterfly-effects'
import { Clock } from 'lucide-react'

interface OtherRunChoice {
  runName: string
  choice: string | undefined
}

interface ButterflyCardProps {
  effect: ButterflyEffect
  runId: string
  existingChoice: string | undefined
  otherRunChoices: OtherRunChoice[]
  onChoiceChanged: (effectName: string, choice: string | null) => void
}

const CHAPTER_GRADIENTS: Record<number, string> = {
  0:  'from-[#1a0a0a] via-[#0d0508] to-[#050505]',
  1:  'from-[#0a0e1a] via-[#080c14] to-[#050505]',
  2:  'from-[#0f0f1a] via-[#0a0a14] to-[#050505]',
  3:  'from-[#1a0f08] via-[#140c06] to-[#050505]',
  4:  'from-[#0a1a10] via-[#08140c] to-[#050505]',
  5:  'from-[#1a1408] via-[#141006] to-[#050505]',
  6:  'from-[#1a0808] via-[#140606] to-[#050505]',
  7:  'from-[#120a1a] via-[#0e0814] to-[#050505]',
  8:  'from-[#1a0a0a] via-[#0d0508] to-[#050505]',
  9:  'from-[#08141a] via-[#061014] to-[#050505]',
  10: 'from-[#1a0808] via-[#140606] to-[#050505]',
}

export function ButterflyCard({ effect, runId, existingChoice, otherRunChoices, onChoiceChanged }: ButterflyCardProps) {
  const [chosen, setChosen] = useState<string | undefined>(existingChoice)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleOption(option: string) {
    if (loading) return

    // Undo: erneuter Klick auf gewählte Option → Auswahl aufheben
    if (chosen === option) {
      setLoading(true)
      setChosen(undefined)
      onChoiceChanged(effect.name, null)
      await supabase
        .from('decisions')
        .delete()
        .eq('run_id', runId)
        .eq('butterfly_effect_name', effect.name)
      setLoading(false)
      return
    }

    setLoading(true)
    setChosen(option)
    onChoiceChanged(effect.name, option)

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

  const gradient = CHAPTER_GRADIENTS[effect.chapter] ?? CHAPTER_GRADIENTS[0]
  const chapterLabel = effect.chapter === 0 ? 'Prolog' : `Kapitel ${effect.chapter}`

  return (
    <div className="rounded-xl overflow-hidden border border-horror-border shadow-2xl">
      {/* Szenen-Bild oder Gradient-Fallback */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={`/scenes/${effect.sceneImage}`}
          alt=""
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none'
          }}
        />
        <div className={cn('absolute inset-0 bg-gradient-to-b', gradient)} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-horror-bg" />

        {/* Kapitel + Szenenname */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-horror-muted tracking-widest uppercase font-cinzel">
              {chapterLabel}
            </span>
            {effect.isTimed && (
              <span className="flex items-center gap-1 text-xs font-bold text-horror-accent tracking-widest">
                <Clock size={10} /> ZEITENTSCHEIDUNG
              </span>
            )}
          </div>
          <h2 className="font-cinzel-decorative text-xl font-bold text-horror-text">
            {effect.nameDe}
          </h2>
        </div>
      </div>

      {/* Karten-Inhalt */}
      <div className="bg-horror-card p-4">
        <p className="text-sm text-horror-muted mb-4 leading-relaxed">
          {effect.descriptionDe}
        </p>

        {/* Andere Runs — Badges */}
        {otherRunChoices.some(r => r.choice) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {otherRunChoices
              .filter(r => r.choice)
              .map(r => {
                const isOption1 = r.choice === effect.options[0]
                return (
                  <span
                    key={r.runName}
                    className={cn(
                      'text-[10px] font-semibold px-2 py-1 rounded-full border tracking-wide',
                      isOption1
                        ? 'bg-[#0d2030] text-[#7db8cc] border-[#2a5a7a]'
                        : 'bg-[#1a0a0a] text-[#cc7d7d] border-[#4a2020]'
                    )}
                  >
                    {r.runName}: {isOption1 ? effect.optionsDe[0] : effect.optionsDe[1]}
                  </span>
                )
              })}
          </div>
        )}

        {/* Optionen */}
        <div className="grid grid-cols-2 gap-3">
          {effect.optionsDe.map((label, i) => {
            const dbOption = effect.options[i]
            const isChosen = chosen === dbOption
            return (
              <button
                key={dbOption}
                onClick={() => handleOption(dbOption)}
                disabled={loading}
                className={cn(
                  'rounded-lg py-4 px-3 text-sm font-semibold transition-all duration-150 active:scale-95 tap-target text-center leading-tight',
                  isChosen
                    ? 'bg-horror-accent text-white border border-horror-accent shadow-lg shadow-red-900/30'
                    : 'bg-horror-bg border border-horror-border text-horror-muted hover:border-horror-accent hover:text-horror-text'
                )}
              >
                {label}
                {isChosen && (
                  <span className="block text-[10px] mt-1 opacity-70">Tippen zum Rückgängig</span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
