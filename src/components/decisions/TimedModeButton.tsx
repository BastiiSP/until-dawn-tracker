'use client'

import { useState } from 'react'
import { Zap } from 'lucide-react'
import { TimedDecisionMode } from './TimedDecision'

interface TimedModeButtonProps {
  runId: string
  savedDecisions: Array<{ butterfly_effect_name: string; chosen_option: string }>
}

export function TimedModeButton({ runId, savedDecisions }: TimedModeButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 bg-horror-accent hover:bg-horror-accent-hover text-white text-sm font-bold px-4 py-3 rounded-lg tap-target w-full justify-center"
      >
        <Zap size={16} /> Timed Decision Mode
      </button>
      {open && (
        <TimedDecisionMode
          runId={runId}
          savedDecisions={savedDecisions}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
