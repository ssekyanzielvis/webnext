"use client"
import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import type { Consignment, UserProfile } from '@/types/db'
import Link from 'next/link'

export default function ClientDashboard() {
  const supabase = createClient()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [active, setActive] = useState<number | null>(null)
  const [completed, setCompleted] = useState<number | null>(null)

  useEffect(() => {
    const run = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth/login'; return }
      const { data: p } = await supabase.from('users').select('*').eq('id', user.id).maybeSingle()
      if (p) setProfile(p as any)
      const { count: a } = await supabase.from('consignments').select('*', { count: 'exact', head: true }).eq('client_id', user.id).in('status', ['pending','assigned','in_transit'])
      setActive(a ?? 0)
      const { count: c } = await supabase.from('consignments').select('*', { count: 'exact', head: true }).eq('client_id', user.id).eq('status', 'delivered')
      setCompleted(c ?? 0)
    }
    void run()
  }, [supabase])

  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      <header className="card p-6 mb-6 bg-gradient-to-br from-primary to-blue-500 text-white">
        <div className="text-lg font-bold">Welcome{profile?.full_name ? `, ${profile.full_name}` : ''}</div>
        <div className="text-sm opacity-80">Track and manage your deliveries</div>
      </header>

      <section>
        <h2 className="text-xl font-bold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <ActionCard title="Create New Order" href="/client/new" color="from-green-500 to-green-600" icon="➕" />
          <ActionCard title="Track Order" href="/client/track" color="from-blue-500 to-blue-600" icon="🎯" />
          <StatCard title="Active Orders" value={active?.toString() ?? '...'} color="from-orange-500 to-orange-600" icon="📋" />
          <StatCard title="Completed Orders" value={completed?.toString() ?? '...'} color="from-purple-500 to-purple-600" icon="✅" />
          <ActionCard title="Order History" href="/client/orders" color="from-amber-500 to-amber-600" icon="🕘" />
          <ActionCard title="Support" href="/client/support" color="from-red-500 to-red-600" icon="🆘" />
        </div>
      </section>
    </main>
  )
}

function StatCard({ title, value, color, icon }:{ title:string; value:string; color:string; icon:string }) {
  return (
    <div className={`card p-4 text-white bg-gradient-to-br ${color}`}>
      <div className="text-3xl">{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="opacity-90">{title}</div>
    </div>
  )
}

function ActionCard({ title, href, color, icon }:{ title:string; href:string; color:string; icon:string }) {
  return (
    <Link href={href} className={`card p-4 text-white bg-gradient-to-br ${color}`}>
      <div className="text-3xl">{icon}</div>
      <div className="font-bold">{title}</div>
    </Link>
  )
}
