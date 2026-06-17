'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { BUTTERFLY_EFFECTS } from '@/lib/data/butterfly-effects'
import { ButterflyCard } from './ButterflyCard'
import { cn } from '@/lib/utils'

interface OtherRun {
  runId: string
  runName: string
  choices: Record<string, string>
}

interface CardNavigatorProps {
  runId: string
  initialDecisions: Array<{ butterfly_effect_name: string; chosen_option: string }>
  otherRuns: OtherRun[]
}

export function CardNavigator({ runId, initialDecisions, otherRuns }: CardNavigatorProps) {
  const [index, setIndex] = useState(0)
  const [slideDir, setSlideDir] = useState<'left' | 'right' | null>(null)
  const [decisions, setDecisions] = useState<Record<string, string>>(
    Object.fromEntries(initialDecisions.map(d => [d.butterfly_effect_name, d.chosen_option]))
  )

  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const total = BUTTERFLY_EFFECTS.length

  function navigate(newIndex: number, dir: 'forward' | 'back') {
    if (newIndex < 0 || newIndex >= total) return
    setSlideDir(dir === 'forward' ? 'left' : 'right')
    setTimeout(() => {
      setIndex(newIndex)
      setSlideDir(null)
    }, 180)
  }

  function goNext() { navigate(index + 1, 'forward') }
  function goPrev() { navigate(index - 1, 'back') }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null || touchStartY.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 44) {
      if (dx < 0) goNext(); else goPrev()
    }
    touchStartX.current = null
    touchStartY.current = null
  }

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') goNext()
    if (e.key === 'ArrowLeft') goPrev()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  function handleChoiceChanged(effectName: string, choice: string | null) {
    setDecisions(prev => {
      const next = { ...prev }
      if (choice === null) delete next[effectName]; else next[effectName] = choice
      return next
    })
  }

  const effect = BUTTERFLY_EFFECTS[index]
  const completedCount = Object.keys(decisions).length
  const chapterLabel = effect.chapter === 0 ? 'Prolog' : `Kapitel ${effect.chapter}`

  return (
    <div>
      {/* Progress */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-horror-muted font-cinzel tracking-widest uppercase">
          {chapterLabel}
        </span>
        <span className="text-xs text-horror-muted">
          {index + 1} / {total}
          {completedCount > 0 && (
            <span className="ml-2 text-horror-accent">{completedCount} entschieden</span>
          )}
        </span>
      </div>

      {/* Fortschritts-Dots */}
      <div className="flex gap-0.5 mb-4 overflow-x-hidden py-2">
        {BUTTERFLY_EFFECTS.map((e, i) => (
          <button
            key={e.id}
            onClick={() => navigate(i, i > index ? 'forward' : 'back')}
            className={cn(
              'h-2 flex-1 rounded-full transition-all duration-200',
              i === index
                ? 'bg-horror-accent scale-y-150'
                : decisions[e.name]
                ? 'bg-green-800'
                : 'bg-horror-border'
            )}
            aria-label={`Szene ${i + 1}: ${e.nameDe}`}
            title={e.nameDe}
          />
        ))}
      </div>

      {/* Karte */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={cn(
          'transition-all duration-200',
          slideDir === 'left' && '-translate-x-4 opacity-0',
          slideDir === 'right' && 'translate-x-4 opacity-0',
          !slideDir && 'translate-x-0 opacity-100'
        )}
      >
        <ButterflyCard
          key={effect.id}
          effect={effect}
          runId={runId}
          existingChoice={decisions[effect.name]}
          otherRunChoices={otherRuns.map(r => ({
            runName: r.runName,
            choice: r.choices[effect.name],
          }))}
          onChoiceChanged={handleChoiceChanged}
        />
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={goPrev}
          disabled={index === 0}
          className={cn(
            'flex items-center gap-2 px-4 py-3 rounded-lg border transition-all tap-target',
            index === 0
              ? 'border-horror-border text-horror-border opacity-30 cursor-not-allowed'
              : 'border-horror-border text-horror-muted hover:border-horror-accent hover:text-horror-text'
          )}
        >
          <ChevronLeft size={18} />
          <span className="text-sm">Zurück</span>
        </button>

        <button
          onClick={goNext}
          disabled={index === total - 1}
          className={cn(
            'flex items-center gap-2 px-4 py-3 rounded-lg border transition-all tap-target',
            index === total - 1
              ? 'border-horror-border text-horror-border opacity-30 cursor-not-allowed'
              : 'border-horror-accent text-horror-accent hover:bg-horror-accent hover:text-white'
          )}
        >
          <span className="text-sm">Weiter</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}
