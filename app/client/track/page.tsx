"use client"
import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import type { Consignment } from '@/types/db'

export default function TrackPage() {
  const supabase = createClient()
  const [id, setId] = useState('')
  const [item, setItem] = useState<Consignment | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function find() {
    setError(null); setItem(null)
    const { data, error } = await supabase.from('consignments').select('*').eq('id', id).maybeSingle()
    if (error) setError(error.message)
    else if (!data) setError('Not found')
    else setItem(data as any)
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-4">Track Consignment</h1>
      <div className="card p-4 space-y-3">
        <input placeholder="Enter consignment ID" value={id} onChange={e=>setId(e.target.value)} className="w-full border rounded-md px-3 py-2" />
        <button className="btn-primary w-full" onClick={find}>Track</button>
        {error && <div className="text-sm text-red-600">{error}</div>}
        {item && (
          <div className="text-sm text-neutral-700 space-y-1">
            <div><b>Status:</b> {item.status.replace('_',' ')}</div>
            <div><b>From:</b> {item.pickup_location} → <b>To:</b> {item.delivery_location}</div>
            <div><b>Weight:</b> {item.weight} kg</div>
          </div>
        )}
      </div>
    </main>
  )
}
