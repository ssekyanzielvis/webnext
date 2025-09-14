"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

export default function AdminAnalytics() {
  const supabase = createClient()
  const [users, setUsers] = useState<number | null>(null)
  const [drivers, setDrivers] = useState<number | null>(null)
  const [consignments, setConsignments] = useState<number | null>(null)
  const [delivered, setDelivered] = useState<number | null>(null)

  useEffect(() => {
    const run = async () => {
      const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true })
      setUsers(usersCount ?? 0)
      const { count: driversCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role','driver')
      setDrivers(driversCount ?? 0)
      const { count: consCount } = await supabase.from('consignments').select('*', { count: 'exact', head: true })
      setConsignments(consCount ?? 0)
      const { count: delCount } = await supabase.from('consignments').select('*', { count: 'exact', head: true }).eq('status','delivered')
      setDelivered(delCount ?? 0)
    }
    void run()
  }, [supabase])

  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-4">Analytics</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card title="Users" value={users}/>
        <Card title="Drivers" value={drivers}/>
        <Card title="Consignments" value={consignments}/>
        <Card title="Delivered" value={delivered}/>
      </div>
    </main>
  )
}

function Card({ title, value }:{ title:string; value:number|null }) {
  return (
    <div className="card p-4">
      <div className="text-sm text-neutral-500">{title}</div>
      <div className="text-2xl font-bold">{value ?? '...'}</div>
    </div>
  )
}
