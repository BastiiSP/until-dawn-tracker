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

const STATUS_LABELS: Record<Status, string> = {
  alive:   'ALIVE',
  dead:    'DEAD',
  unknown: '?',
}

const STATUS_OVERLAY: Record<Status, string> = {
  alive:   'ring-green-600',
  dead:    'ring-red-800',
  unknown: 'ring-[#2a5a7a]',
}

const STATUS_BADGE: Record<Status, string> = {
  alive:   'bg-green-900 text-green-300',
  dead:    'bg-red-950 text-red-400',
  unknown: 'bg-[#0d2030] text-[#7db8cc]',
}

const CHARACTER_COLORS: Record<string, string> = {
  Sam: '#3b82f6', Mike: '#22c55e', Ashley: '#ec4899',
  Chris: '#f97316', Josh: '#a855f7', Jessica: '#eab308',
  Emily: '#ef4444', Matt: '#14b8a6',
}

interface CharacterCardProps {
  id: string
  name: string
  initialStatus: Status
}

export function CharacterCard({ id, name, initialStatus }: CharacterCardProps) {
  const [status, setStatus] = useState<Status>(initialStatus)
  const [imgError, setImgError] = useState(false)
  const supabase = createClient()
  const accentColor = CHARACTER_COLORS[name] ?? '#6b7280'

  async function toggle() {
    const next = STATUS_CYCLE[status]
    setStatus(next)
    await supabase.from('characters').update({ status: next }).eq('id', id)
  }

  return (
    <button
      onClick={toggle}
      className="flex flex-col items-center gap-2 w-full active:scale-95 transition-transform tap-target group"
    >
      <div className={cn(
        'relative w-16 h-16 rounded-full overflow-hidden ring-2 transition-all',
        STATUS_OVERLAY[status],
        'group-active:ring-4'
      )}>
        {!imgError ? (
          <img
            src={`/characters/${name.toLowerCase()}.png`}
            alt={name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-xl font-bold text-white"
            style={{ backgroundColor: accentColor + '33', border: `2px solid ${accentColor}55` }}
          >
            <span style={{ color: accentColor }}>{name[0]}</span>
          </div>
        )}
        {status === 'dead' && (
          <div className="absolute inset-0 bg-red-950/70 flex items-center justify-center">
            <span className="text-red-400 text-lg">✕</span>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-0.5">
        <span className="text-xs font-semibold text-horror-text leading-tight">{name}</span>
        <span className={cn('text-[10px] font-bold tracking-widest px-1.5 py-0.5 rounded', STATUS_BADGE[status])}>
          {STATUS_LABELS[status]}
        </span>
      </div>
    </button>
  )
}
