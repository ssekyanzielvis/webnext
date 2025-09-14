"use client"
import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

type Assignment = { id: string; fuel_card_id: string; driver_id: string; assigned_date: string; unassigned_date: string | null }
type FuelCard = { id: string; card_number: string }
type Driver = { id: string; full_name: string | null; email: string }

export default function FuelAssignmentsPage() {
  const supabase = createClient()
  const [items, setItems] = useState<Assignment[]>([])
  const [cards, setCards] = useState<FuelCard[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string|null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const [a, c, d] = await Promise.all([
      (supabase as any).from('fuel_card_assignments').select('*').order('assigned_date', { ascending: false }),
      (supabase as any).from('fuel_cards').select('id,card_number').order('card_number'),
      (supabase as any).from('users').select('id,full_name,email').eq('role','driver').order('full_name')
    ])
    if (a.error) setErr(a.error.message); else setItems(a.data as any)
    setCards((c.data || []) as any)
    setDrivers((d.data || []) as any)
    setLoading(false)
  }, [supabase])
  useEffect(() => { void load() }, [load])

  async function assign() {
    const cardId = prompt('Fuel Card ID (copy from list below):') || ''
    const driverId = prompt('Driver ID (copy from list below):') || ''
    if (!cardId || !driverId) return
    const { error } = await (supabase as any).from('fuel_card_assignments').insert({ fuel_card_id: cardId, driver_id: driverId, assigned_by: 'admin', assigned_date: new Date().toISOString() })
    if (error) setErr(error.message); else load()
  }

  async function unassign(id: string) {
    const { error } = await (supabase as any).from('fuel_card_assignments').update({ unassigned_date: new Date().toISOString() }).eq('id', id)
    if (error) setErr(error.message); else load()
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Fuel Card Assignments</h1>
        <button className="btn-primary" onClick={assign}>Assign Card</button>
      </div>
      {err && <div className="text-sm text-red-600 mb-3">{err}</div>}
      {loading ? <div>Loading...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <h2 className="font-semibold mb-2">Assignments</h2>
            <ul className="space-y-3">
              {items.map(a => (
                <li key={a.id} className="card p-4 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Card: {a.fuel_card_id}</div>
                    <div className="text-sm text-neutral-600">Driver: {a.driver_id}</div>
                    <div className="text-xs text-neutral-500">Assigned {new Date(a.assigned_date).toLocaleString()}{a.unassigned_date ? ` • Unassigned ${new Date(a.unassigned_date).toLocaleString()}` : ''}</div>
                  </div>
                  {!a.unassigned_date && (
                    <button className="px-3 py-1 rounded-md bg-neutral-100" onClick={()=>unassign(a.id)}>Unassign</button>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-1">Cards</h3>
              <ul className="text-sm card p-3 max-h-64 overflow-auto">
                {cards.map(c => <li key={c.id}>{c.id} • {c.card_number}</li>)}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Drivers</h3>
              <ul className="text-sm card p-3 max-h-64 overflow-auto">
                {drivers.map(d => <li key={d.id}>{d.id} • {d.full_name || d.email}</li>)}
              </ul>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
