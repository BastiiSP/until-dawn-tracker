'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface DeleteRunButtonProps {
  runId: string
  runName: string
}

export function DeleteRunButton({ runId, runName }: DeleteRunButtonProps) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleDelete() {
    if (loading) return
    setLoading(true)
    const { error } = await supabase.from('runs').delete().eq('id', runId)
    if (error) {
      setLoading(false)
      return
    }
    router.refresh()
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-horror-muted hidden sm:inline">
          „{runName}" löschen?
        </span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-xs text-red-400 border border-red-900 hover:bg-red-950 rounded px-2 py-1 transition-colors disabled:opacity-50"
        >
          {loading ? '…' : 'Ja'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={loading}
          className="text-xs text-horror-muted border border-horror-border hover:border-horror-accent rounded px-2 py-1 transition-colors disabled:opacity-50"
        >
          Nein
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={(e) => { e.preventDefault(); setConfirming(true) }}
      className={cn(
        'shrink-0 text-horror-muted hover:text-red-400 p-2 rounded transition-colors tap-target',
      )}
      title={`„${runName}" löschen`}
    >
      <Trash2 size={16} />
    </button>
  )
}
