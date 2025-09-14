"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

type Card = {
  id: string
  card_number: string
  card_holder_name: string
  provider: string
  status: string
  current_balance: number
}
type Tx = {
  id: string
  amount: number
  quantity: number
  type: string
  station: string
  transaction_date: string
}

export default function DriverFuelCardPage() {
  const supabase = createClient()
  const [card, setCard] = useState<Card | null>(null)
  const [txs, setTxs] = useState<Tx[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      setError(null)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth/login'; return }
      // find active assignment for this driver
      const { data: assign } = await supabase
        .from('fuel_card_assignments' as any)
        .select('fuel_card_id')
        .eq('driver_id', user.id)
        .is('unassigned_date', null)
        .order('assigned_date', { ascending: false })
        .limit(1)
        .maybeSingle()
      const cardId = (assign as any)?.fuel_card_id
      if (!cardId) { setLoading(false); return }
      const { data: cardRow } = await supabase.from('fuel_cards' as any).select('id, card_number, card_holder_name, provider, status, current_balance').eq('id', cardId).single()
      setCard(cardRow as any)
      const { data: transactions } = await supabase
        .from('fuel_transactions' as any)
        .select('id, amount, quantity, type, station, transaction_date')
        .eq('fuel_card_id', cardId)
        .order('transaction_date', { ascending: false })
        .limit(20)
      setTxs((transactions ?? []) as any)
      setLoading(false)
    }
    run()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) return <main className="max-w-3xl mx-auto p-4">Loading…</main>
  if (error) return <main className="max-w-3xl mx-auto p-4 text-red-600">{error}</main>

  return (
    <main className="max-w-3xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">My Fuel Card</h1>
      {!card && <div className="card p-4">No active card assigned.</div>}
      {card && (
        <div className="card p-4 space-y-2">
          <div className="text-sm text-gray-600">{card.provider.toUpperCase()}</div>
          <div className="text-lg font-semibold">{card.card_holder_name}</div>
          <div className="font-mono">•••• •••• •••• {card.card_number.slice(-4)}</div>
          <div className="text-sm">Status: <span className="px-2 py-0.5 rounded bg-gray-100">{card.status}</span></div>
          <div className="text-sm">Balance: ${card.current_balance?.toFixed(2) ?? '0.00'}</div>
        </div>
      )}
      <section>
        <h2 className="text-lg font-semibold mb-2">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-2 border">Date</th>
                <th className="text-left p-2 border">Type</th>
                <th className="text-right p-2 border">Amount</th>
                <th className="text-right p-2 border">Qty</th>
                <th className="text-left p-2 border">Station</th>
              </tr>
            </thead>
            <tbody>
              {txs.map(t => (
                <tr key={t.id} className="odd:bg-white even:bg-gray-50">
                  <td className="p-2 border">{new Date(t.transaction_date).toLocaleString()}</td>
                  <td className="p-2 border">{t.type.toUpperCase()}</td>
                  <td className="p-2 border text-right">${t.amount.toFixed(2)}</td>
                  <td className="p-2 border text-right">{t.quantity.toFixed(2)}</td>
                  <td className="p-2 border">{t.station}</td>
                </tr>
              ))}
              {!txs.length && (
                <tr><td className="p-2 border" colSpan={5}>No transactions</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
