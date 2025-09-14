"use client"
import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import type { Consignment } from '@/types/db'

export default function AvailableConsignments() {
  const supabase = createClient()
  const [items, setItems] = useState<Consignment[]>([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await (supabase as any)
      .from('consignments')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    if (!error && data) setItems(data as any)
    setLoading(false)
  }, [supabase])

  useEffect(() => { void load() }, [load])

  async function accept(c: Consignment) {
    setMsg(null)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/auth/login'; return }
    const { error } = await (supabase as any)
      .from('consignments')
      .update({ driver_id: user.id, status: 'assigned', updated_at: new Date().toISOString() } as any)
      .eq('id', c.id)
    if (error) setMsg(error.message)
    else { setMsg('Consignment accepted'); load() }
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-4">Available Consignments</h1>
      {msg && <div className="text-sm text-green-600 mb-3">{msg}</div>}
      {loading ? <div>Loading...</div> : items.length===0 ? <div className="text-neutral-500">No available consignments</div> : (
        <ul className="space-y-3">
          {items.map(c => (
            <li key={c.id} className="card p-4">
              <div className="font-semibold">{c.item_description} <span className="ml-2 text-xs px-2 py-1 rounded-full bg-green-50 text-green-700">{c.weight} kg</span></div>
              <div className="text-sm text-neutral-600">Pickup: {c.pickup_location}</div>
              <div className="text-sm text-neutral-600">Delivery: {c.delivery_location}</div>
              <div className="mt-3 flex justify-end">
                <button className="btn-primary" onClick={()=>accept(c)}>Accept</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
