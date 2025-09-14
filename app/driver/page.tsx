"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

export default function DriverDashboard() {
  const supabase = createClient()
  const [available, setAvailable] = useState<number | null>(null)
  const [mine, setMine] = useState<number | null>(null)
  const [done, setDone] = useState<number | null>(null)

  useEffect(() => {
    const run = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth/login'; return }
      const { count: a } = await supabase.from('consignments').select('*', { count: 'exact', head: true }).is('driver_id', null).eq('status', 'pending')
      setAvailable(a ?? 0)
      const { count: m } = await supabase.from('consignments').select('*', { count: 'exact', head: true }).eq('driver_id', user.id).in('status', ['assigned','in_transit'])
      setMine(m ?? 0)
      const { count: d } = await supabase.from('consignments').select('*', { count: 'exact', head: true }).eq('driver_id', user.id).eq('status','delivered')
      setDone(d ?? 0)
    }
    void run()
  }, [supabase])

  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      <header className="card p-6 mb-6 bg-gradient-to-br from-primary to-blue-500 text-white">
        <div className="text-lg font-bold">Welcome, Driver</div>
        <div className="text-sm opacity-80">Ready to make deliveries today?</div>
      </header>
      <section>
        <h2 className="text-xl font-bold mb-3">Today&apos;s Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard title="Available Jobs" value={available?.toString() ?? '...'} color="from-blue-500 to-blue-600" icon="🚚" />
          <StatCard title="My Deliveries" value={mine?.toString() ?? '...'} color="from-orange-500 to-orange-600" icon="📦" />
          <StatCard title="Completed Today" value={done?.toString() ?? '...'} color="from-green-500 to-green-600" icon="✅" />
        </div>
      </section>
      <section className="mt-6">
        <h2 className="text-xl font-bold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a className="card" href="/driver/available">Available Consignments</a>
          <a className="card" href="/driver/deliveries">My Deliveries</a>
          <a className="card" href="/driver/delivery-notes">Delivery Notes</a>
          <a className="card" href="/driver/fuel-transactions">Fuel Transactions</a>
          <a className="card" href="/driver/fuel-card">My Fuel Card</a>
          <a className="card" href="/driver/location">Share Live Location</a>
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
