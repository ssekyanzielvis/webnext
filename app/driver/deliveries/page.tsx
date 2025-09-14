"use client"
import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import type { Consignment } from '@/types/db'

export default function MyDeliveries() {
  const supabase = createClient()
  const [items, setItems] = useState<Consignment[]>([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState<string | null>(null)

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/auth/login'; return }
    setLoading(true)
    const { data, error } = await (supabase as any)
      .from('consignments')
      .select('*')
      .eq('driver_id', user.id)
      .in('status', ['assigned','in_transit'])
      .order('updated_at', { ascending: false })
    if (!error && data) setItems(data as any)
    setLoading(false)
  }, [supabase])

  useEffect(() => { void load() }, [load])

  async function updateStatus(id: string, status: Consignment['status']) {
    setMsg(null)
    const { error } = await (supabase as any)
      .from('consignments')
      .update({ status, updated_at: new Date().toISOString() } as any)
      .eq('id', id)
    if (error) setMsg(error.message); else { setMsg('Updated'); load() }
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-4">My Deliveries</h1>
      {msg && <div className="text-sm text-green-600 mb-3">{msg}</div>}
      {loading ? <div>Loading...</div> : items.length===0 ? <div className="text-neutral-500">No active deliveries</div> : (
        <ul className="space-y-3">
          {items.map(c => (
            <li key={c.id} className="card p-4">
              <div className="font-semibold">{c.item_description}</div>
              <div className="text-sm text-neutral-600">From: {c.pickup_location} → To: {c.delivery_location}</div>
              <div className="mt-3 flex gap-2 justify-end">
                {c.status === 'assigned' && (
                  <button className="btn-primary" onClick={()=>updateStatus(c.id, 'in_transit')}>Start</button>
                )}
                <button className="btn-primary" onClick={()=>updateStatus(c.id, 'delivered')}>Mark Delivered</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
