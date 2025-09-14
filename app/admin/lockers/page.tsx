"use client"
import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

type Locker = { id: string; name: string; location: string; capacity: number; current_occupancy?: number; created_at?: string }

export default function LockersPage() {
  const supabase = createClient()
  const [items, setItems] = useState<Locker[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string|null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await (supabase as any).from('fuel_card_lockers').select('*').order('name')
    if (error) setErr(error.message); else setItems(data as any)
    setLoading(false)
  }, [supabase])
  useEffect(() => { void load() }, [load])

  async function add() {
    const name = prompt('Locker name?') || ''
    const location = prompt('Location?') || ''
    const capacity = Number(prompt('Capacity?') || '0')
    if (!name.trim()) return
    const { error } = await (supabase as any).from('fuel_card_lockers').insert({ name, location, capacity })
  if (error) setErr(error.message); else void load()
  }

  async function remove(id: string) {
    if (!confirm('Delete this locker?')) return
    const { error } = await (supabase as any).from('fuel_card_lockers').delete().eq('id', id)
  if (error) setErr(error.message); else void load()
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Fuel Card Lockers</h1>
        <button className="btn-primary" onClick={add}>Add Locker</button>
      </div>
      {err && <div className="text-sm text-red-600 mb-3">{err}</div>}
      {loading ? <div>Loading...</div> : (
        <ul className="space-y-3">
          {items.map(l => (
            <li key={l.id} className="card p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold">{l.name}</div>
                <div className="text-sm text-neutral-600">{l.location} • Cap: {l.capacity} • In use: {l.current_occupancy ?? 0}</div>
              </div>
              <button className="px-3 py-1 rounded-md bg-neutral-100" onClick={()=>remove(l.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
