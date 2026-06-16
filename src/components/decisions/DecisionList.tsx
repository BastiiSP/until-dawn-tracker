import { BUTTERFLY_EFFECTS } from '@/lib/data/butterfly-effects'
import { DecisionCard } from './DecisionCard'

interface DecisionRecord {
  butterfly_effect_name: string
  chosen_option: string
}

interface DecisionListProps {
  runId: string
  savedDecisions: DecisionRecord[]
  comparisonDecisions?: DecisionRecord[]
}

export function DecisionList({ runId, savedDecisions, comparisonDecisions }: DecisionListProps) {
  const savedMap = Object.fromEntries(
    savedDecisions.map(d => [d.butterfly_effect_name, d.chosen_option])
  )
  const compMap = Object.fromEntries(
    (comparisonDecisions ?? []).map(d => [d.butterfly_effect_name, d.chosen_option])
  )

  const chapters = [...new Set(BUTTERFLY_EFFECTS.map(e => e.chapter))].sort((a, b) => a - b)

  return (
    <div className="space-y-6">
      {chapters.map(ch => (
        <div key={ch}>
          <h2 className="text-xs font-bold tracking-widest text-horror-muted uppercase mb-3">
            {ch === 0 ? 'Prologue' : `Chapter ${ch}`}
          </h2>
          <div className="space-y-3">
            {BUTTERFLY_EFFECTS.filter(e => e.chapter === ch).map(effect => (
              <DecisionCard
                key={effect.id}
                effect={effect}
                runId={runId}
                existingChoice={savedMap[effect.name]}
                comparisonChoice={compMap[effect.name]}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
