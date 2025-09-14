"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import type { Consignment } from '@/types/db'

export default function OrdersPage() {
  const supabase = createClient()
  const [items, setItems] = useState<Consignment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | Consignment['status']>('all')

  useEffect(() => {
    const run = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth/login'; return }
      let query = supabase.from('consignments').select('*').eq('client_id', user.id)
      if (filter !== 'all') query = query.eq('status', filter)
      const { data, error } = await query.order('created_at', { ascending: false })
      if (!error && data) setItems(data as any)
      setLoading(false)
    }
    void run()
  }, [filter, supabase])

  return (
    <main className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-4">My Consignments</h1>
      <div className="flex gap-2 overflow-auto">
        {['all','pending','assigned','in_transit','delivered'].map(s=> (
          <button key={s} onClick={()=>setFilter(s as any)} className={`px-3 py-1 rounded-full text-sm ${filter===s?'bg-primary text-white':'bg-neutral-100'}`}>{s.toString().replace('_',' ')}</button>
        ))}
      </div>
      <div className="mt-4">
        {loading ? <div>Loading...</div> : items.length===0 ? <div className="text-neutral-500">No consignments found</div> : (
          <ul className="space-y-3">
            {items.map(c => (
              <li key={c.id} className="card p-4">
                <div className="font-semibold">{c.item_description}</div>
                <div className="text-sm text-neutral-600">From: {c.pickup_location} → To: {c.delivery_location}</div>
                <div className="text-sm text-neutral-600">Weight: {c.weight} kg</div>
                <div className="mt-2 inline-block text-xs px-2 py-1 rounded-full bg-neutral-100">{c.status.replace('_',' ')}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
