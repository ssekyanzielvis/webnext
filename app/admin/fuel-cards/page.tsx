"use client"
import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

type FuelCard = {
  id: string
  card_number: string
  card_holder_name: string | null
  provider: string | null
  status: 'active'|'inactive'|'blocked'|'expired'
  card_type: 'physical'|'virtual'|'digital'
  spending_limit: number
  current_balance: number
  fuel_type_restrictions: string[]
  created_at: string
}

export default function FuelCardsPage() {
  const supabase = createClient()
  const [items, setItems] = useState<FuelCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string|null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await (supabase as any).from('fuel_cards').select('*').order('created_at', { ascending: false })
    if (error) setError(error.message); else setItems(data as any)
    setLoading(false)
  }, [supabase])

  useEffect(() => { void load() }, [load])

  async function addCard() {
    const number = prompt('Card number?') || ''
    if (!number.trim()) return
    const { error } = await (supabase as any).from('fuel_cards').insert({
      card_number: number,
      card_type: 'physical',
      spending_limit: 1000,
      fuel_type_restrictions: ['petrol','diesel'],
      current_balance: 1000,
      status: 'active'
    })
    if (error) setError(error.message); else load()
  }

  async function setStatus(id: string, status: FuelCard['status']) {
    const { error } = await (supabase as any).from('fuel_cards').update({ status }).eq('id', id)
    if (error) setError(error.message); else load()
  }

  async function remove(id: string) {
    if (!confirm('Delete this card?')) return
    const { error } = await (supabase as any).from('fuel_cards').delete().eq('id', id)
    if (error) setError(error.message); else load()
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Fuel Cards</h1>
        <button className="btn-primary" onClick={addCard}>Add Card</button>
      </div>
      {error && <div className="text-sm text-red-600 mb-3">{error}</div>}
      {loading ? <div>Loading...</div> : (
        <ul className="space-y-3">
          {items.map(c => (
            <li key={c.id} className="card p-4">
              <div className="font-semibold">{c.card_number}</div>
              <div className="text-sm text-neutral-600">Balance: {c.current_balance} / Limit: {c.spending_limit}</div>
              <div className="flex items-center gap-2 mt-2">
                <select className="border rounded-md px-2 py-1" value={c.status} onChange={e=>setStatus(c.id, e.target.value as any)}>
                  {['active','inactive','blocked','expired'].map(s=> <option key={s} value={s}>{s}</option>)}
                </select>
                <button className="px-3 py-1 rounded-md bg-neutral-100" onClick={()=>remove(c.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
