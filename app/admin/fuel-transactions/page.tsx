import { createClient } from '@/lib/supabase-server'

type Row = { id: string; fuel_card_id: string; driver_id: string | null; amount: number; quantity: number; type: string; station: string; transaction_date: string }

export const dynamic = 'force-dynamic'

export default async function AdminFuelTransactionsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <main className="max-w-5xl mx-auto p-4">Not authenticated</main>
  const role = (user.app_metadata as any)?.role || (user.user_metadata as any)?.role
  if (!['admin','other_admin'].includes(role)) return <main className="max-w-5xl mx-auto p-4">Forbidden</main>

  const { data, error } = await supabase
    .from('fuel_transactions' as any)
    .select('id, fuel_card_id, driver_id, amount, quantity, type, station, transaction_date')
    .order('transaction_date', { ascending: false })
    .limit(200)
  if (error) return <main className="max-w-5xl mx-auto p-4 text-red-600">{error.message}</main>
  const rows = (data ?? []) as Row[]
  return (
    <main className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Fuel Transactions</h1>
      <div className="mb-3 text-sm"><a className="px-3 py-2 bg-blue-600 text-white rounded" href="/api/export/fuel-transactions">Export CSV</a></div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 border text-left">Date</th>
              <th className="p-2 border text-left">Card</th>
              <th className="p-2 border text-left">Driver</th>
              <th className="p-2 border text-left">Type</th>
              <th className="p-2 border text-right">Amount</th>
              <th className="p-2 border text-right">Qty</th>
              <th className="p-2 border text-left">Station</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="odd:bg-white even:bg-gray-50">
                <td className="p-2 border">{new Date(r.transaction_date).toLocaleString()}</td>
                <td className="p-2 border font-mono text-xs">{r.fuel_card_id.slice(0,8)}</td>
                <td className="p-2 border font-mono text-xs">{r.driver_id?.slice(0,8) || '-'}</td>
                <td className="p-2 border">{r.type.toUpperCase()}</td>
                <td className="p-2 border text-right">${r.amount.toFixed(2)}</td>
                <td className="p-2 border text-right">{r.quantity.toFixed(2)}</td>
                <td className="p-2 border">{r.station}</td>
              </tr>
            ))}
            {!rows.length && (
              <tr><td className="p-2 border" colSpan={7}>No transactions</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}
