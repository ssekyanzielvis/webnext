"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

export default function AdminDashboard() {
  const supabase = createClient()
  const [role, setRole] = useState<string>('')
  const [counts, setCounts] = useState<{pending:number; assigned:number; in_transit:number; delivered:number}>({pending:0,assigned:0,in_transit:0,delivered:0})

  useEffect(() => {
    const run = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth/login'; return }
      const r = (user.user_metadata as any)?.role || (user.app_metadata as any)?.role
      setRole(r)
      if (r !== 'admin' && r !== 'other_admin') { window.location.href = '/'; return }
      const statuses = ['pending','assigned','in_transit','delivered'] as const
      const results = await Promise.all(statuses.map(async s => {
        const { count } = await supabase.from('consignments').select('*', { count: 'exact', head: true }).eq('status', s)
        return [s, count ?? 0] as const
      }))
      setCounts(Object.fromEntries(results) as any)
    }
    void run()
  }, [supabase])

  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      <header className="card p-6 mb-6 bg-gradient-to-br from-primary to-blue-500 text-white">
        <div className="text-lg font-bold">Admin Dashboard</div>
        <div className="text-sm opacity-80">System overview and management</div>
      </header>
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat title="Pending" value={counts.pending} />
        <Stat title="Assigned" value={counts.assigned} />
        <Stat title="In Transit" value={counts.in_transit} />
        <Stat title="Delivered" value={counts.delivered} />
      </section>
    </main>
  )
}

function Stat({ title, value }:{ title:string; value:number }) {
  return (
    <div className="card p-4">
      <div className="text-sm text-neutral-600">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  )
}
