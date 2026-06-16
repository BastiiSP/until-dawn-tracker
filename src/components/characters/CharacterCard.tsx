'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

type Status = 'alive' | 'dead' | 'unknown'

const STATUS_CYCLE: Record<Status, Status> = {
  unknown: 'alive',
  alive:   'dead',
  dead:    'unknown',
}

const STATUS_STYLES: Record<Status, string> = {
  alive:   'border-green-700 bg-green-950 text-green-400',
  dead:    'border-red-900 bg-red-950 text-red-400',
  unknown: 'border-horror-border bg-horror-card text-horror-muted',
}

const STATUS_LABELS: Record<Status, string> = {
  alive:   'ALIVE',
  dead:    'DEAD',
  unknown: '?',
}

interface CharacterCardProps {
  id: string
  name: string
  initialStatus: Status
}

export function CharacterCard({ id, name, initialStatus }: CharacterCardProps) {
  const [status, setStatus] = useState<Status>(initialStatus)
  const supabase = createClient()

  async function toggle() {
    const next = STATUS_CYCLE[status]
    setStatus(next) // optimistic update
    await supabase.from('characters').update({ status: next }).eq('id', id)
  }

  return (
    <button
      onClick={toggle}
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border p-3 gap-1 transition-all active:scale-95 tap-target w-full',
        STATUS_STYLES[status]
      )}
    >
      <span className="text-sm font-semibold leading-tight">{name}</span>
      <span className="text-xs font-bold tracking-widest">{STATUS_LABELS[status]}</span>
    </button>
  )
}
