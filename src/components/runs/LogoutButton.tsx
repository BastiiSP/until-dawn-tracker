'use client'

import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-1.5 text-horror-muted hover:text-horror-text border border-horror-border hover:border-horror-accent rounded-lg px-3 py-2 text-sm transition-colors tap-target"
      title="Abmelden"
    >
      <LogOut size={16} />
      <span className="sr-only">Abmelden</span>
    </button>
  )
}
