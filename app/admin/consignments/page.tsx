"use client"
import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import type { Consignment } from '@/types/db'
import { getRoleFromUser } from '@/lib/role'

const STATUSES: Consignment['status'][] = ['pending','assigned','picked_up','in_transit','delivered','cancelled']

export default function ConsignmentManagement() {
  const supabase = createClient()
  const [items, setItems] = useState<Consignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | Consignment['status']>('all')

  const load = useCallback(async () => {
    setLoading(true)
    let q: any = (supabase as any).from('consignments').select('*')
    if (filter !== 'all') q = q.eq('status', filter)
    const { data, error } = await q.order('created_at', { ascending: false })
    if (error) setError(error.message); else setItems(data as any)
    setLoading(false)
  }, [supabase, filter])

  useEffect(() => {
    const boot = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth/login'; return }
      const role = getRoleFromUser(user)
      if (role !== 'admin' && role !== 'other_admin') { window.location.href = '/'; return }
      await load()
    }
    void boot()
  }, [supabase, load])

  useEffect(() => { void load() }, [load])

  async function updateStatus(id: string, status: Consignment['status']) {
    const { error } = await (supabase as any)
      .from('consignments')
      .update({ status, updated_at: new Date().toISOString() } as any)
      .eq('id', id)
    if (!error) load(); else setError(error.message)
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-4">Consignment Management</h1>
      <div className="flex gap-2 overflow-auto mb-4">
        {(['all', ...STATUSES] as const).map(s => (
          <button key={s} onClick={()=>setFilter(s as any)} className={`px-3 py-1 rounded-full text-sm ${filter===s?'bg-[#4C6FFF] text-white':'bg-neutral-100'}`}>{s.toString().replace('_',' ')}</button>
        ))}
      </div>
      {error && <div className="text-sm text-red-600 mb-3">{error}</div>}
      {loading ? <div>Loading...</div> : (
        <ul className="space-y-3">
          {items.map(c => (
            <li key={c.id} className="card p-4">
              <div className="font-semibold">{c.item_description}</div>
              <div className="text-sm text-neutral-600">Client: {c.client_id} • Driver: {c.driver_id ?? '—'}</div>
              <div className="text-sm text-neutral-600">From: {c.pickup_location} → To: {c.delivery_location}</div>
              <div className="mt-2">
                <label className="text-sm mr-2">Status:</label>
                <select className="border rounded-md px-2 py-1" value={c.status} onChange={e=>updateStatus(c.id, e.target.value as Consignment['status'])}>
                  {STATUSES.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
                </select>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
