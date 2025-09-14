"use client"
import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { uploadToBucket } from '@/lib/storage'

type Tx = {
  id: string
  fuel_card_id: string
  driver_id: string | null
  type: string
  amount: number
  quantity: number
  price_per_unit: number
  station: string
  location: string
  transaction_date: string
  receipt_url: string | null
}

export default function FuelTransactionsPage() {
  const supabase = createClient()
  const [items, setItems] = useState<Tx[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string|null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/auth/login'; return }
    const { data, error } = await (supabase as any)
      .from('fuel_transactions').select('*').eq('driver_id', user.id).order('transaction_date', { ascending: false })
    if (error) setErr(error.message); else setItems(data as any)
    setLoading(false)
  }, [supabase])

  useEffect(() => { void load() }, [load])

  async function add() {
    const { data: { user } } = await supabase.auth.getUser(); if (!user) return
    const station = prompt('Station?') || 'Station'
    const amount = Number(prompt('Amount?') || '0')
    const quantity = Number(prompt('Quantity?') || '0')
    const file = await selectFile()
    let receiptUrl: string | null = null
    if (file) {
      const up = await uploadToBucket({ bucket: 'fuel-receipts', file, path: `${user.id}/receipt_${Date.now()}_${file.name}` })
      if (up) receiptUrl = up.publicUrl
    }
    const { error } = await (supabase as any).from('fuel_transactions').insert({
      id: crypto.randomUUID(),
      driver_id: user.id,
      fuel_card_id: null,
      type: 'fuel', amount, quantity, price_per_unit: amount / (quantity || 1),
      station, location: 'N/A', transaction_date: new Date().toISOString(), receipt_url: receiptUrl
    })
    if (error) setErr(error.message); else load()
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Fuel Transactions</h1>
        <button className="btn-primary" onClick={add}>Add</button>
      </div>
      {err && <div className="text-sm text-red-600 mb-3">{err}</div>}
      {loading ? <div>Loading...</div> : (
        <ul className="space-y-3">
          {items.map(t => (
            <li key={t.id} className="card p-4">
              <div className="font-semibold">{t.station} • {t.type}</div>
              <div className="text-sm text-neutral-600">Amount: {t.amount} • Qty: {t.quantity}</div>
              <div className="text-xs text-neutral-500">{new Date(t.transaction_date).toLocaleString()}</div>
              {t.receipt_url && <a className="text-sm text-blue-600" href={t.receipt_url} target="_blank">View receipt</a>}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

async function selectFile(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = () => { resolve(input.files?.[0] || null) }
    input.click()
  })
}
