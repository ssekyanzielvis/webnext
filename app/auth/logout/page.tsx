"use client"
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'

export default function LogoutPage() {
  const supabase = createClient()
  useEffect(() => {
    const run = async () => {
      await supabase.auth.signOut()
      window.location.href = '/auth/login'
    }
    run()
  }, [supabase])
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-sm text-neutral-600">Signing out…</div>
    </main>
  )
}
