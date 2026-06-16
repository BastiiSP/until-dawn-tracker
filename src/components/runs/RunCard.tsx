import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RunCardProps {
  id: string
  name: string
  createdAt: string
}

export function RunCard({ id, name, createdAt }: RunCardProps) {
  const date = new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
  return (
    <Link
      href={`/runs/${id}`}
      className={cn(
        'flex items-center justify-between',
        'bg-horror-card border border-horror-border rounded-lg px-4 py-4',
        'hover:border-horror-accent transition-colors active:scale-[0.98] tap-target'
      )}
    >
      <div>
        <p className="font-semibold text-horror-text">{name}</p>
        <p className="text-xs text-horror-muted mt-0.5">{date}</p>
      </div>
      <ChevronRight className="text-horror-muted shrink-0" size={20} />
    </Link>
  )
}
