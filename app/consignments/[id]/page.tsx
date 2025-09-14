"use client"
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

type Consignment = {
  id: string
  client_id: string
  driver_id: string | null
  pickup_location: string
  delivery_location: string
  item_description: string
  weight: number
  status: 'pending'|'assigned'|'picked_up'|'in_transit'|'delivered'|'cancelled'
  special_instructions?: string | null
  created_at: string
  updated_at: string
}

export default function ConsignmentDetailsPage() {
  const supabase = createClient()
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [c, setC] = useState<Consignment | null>(null)
  const [role, setRole] = useState<string>('user')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [assignDriverId, setAssignDriverId] = useState('')

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      setError(null)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setRole((user.app_metadata as any)?.role || (user.user_metadata as any)?.role || 'user')
      const { data, error } = await supabase.from('consignments' as any).select('*').eq('id', params.id).single()
      if (error) setError(error.message)
      setC(data as any)
      setLoading(false)
    }
    run()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  const updateStatus = async (status: Consignment['status']) => {
    if (!c) return
    const { error } = await supabase.from('consignments' as any).update({ status }).eq('id', c.id)
    if (error) { setError(error.message); return }
    setC({ ...c, status })
  }

  const assignDriver = async () => {
    if (!c || !assignDriverId) return
    const { error } = await supabase.from('consignments' as any).update({ driver_id: assignDriverId, status: 'assigned' }).eq('id', c.id)
    if (error) { setError(error.message); return }
    setC({ ...c, driver_id: assignDriverId, status: 'assigned' })
    setAssignDriverId('')
  }

  if (loading) return <main className="max-w-3xl mx-auto p-4">Loading…</main>
  if (error) return <main className="max-w-3xl mx-auto p-4 text-red-600">{error}</main>
  if (!c) return <main className="max-w-3xl mx-auto p-4">Not found</main>

  const isDriver = role === 'driver'
  const isAdmin = role === 'admin' || role === 'other_admin'

  return (
    <main className="max-w-3xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Consignment #{c.id.slice(0,8)}</h1>
      <div className="card p-4 space-y-2">
        <div><span className="font-semibold">Pickup:</span> {c.pickup_location}</div>
        <div><span className="font-semibold">Delivery:</span> {c.delivery_location}</div>
        <div><span className="font-semibold">Item:</span> {c.item_description}</div>
        <div><span className="font-semibold">Weight:</span> {c.weight} kg</div>
        <div><span className="font-semibold">Status:</span> <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-800 text-xs">{c.status}</span></div>
        <div><span className="font-semibold">Driver:</span> {c.driver_id ?? 'Unassigned'}</div>
        {c.special_instructions && <div><span className="font-semibold">Notes:</span> {c.special_instructions}</div>}
        <div className="text-xs text-gray-500">Created {new Date(c.created_at).toLocaleString()}</div>
      </div>
      {(isDriver || isAdmin) && (
        <section className="card p-4 space-y-3">
          <h2 className="text-lg font-semibold">Actions</h2>
          <div className="flex flex-wrap gap-2">
            {isDriver && (
              <>
                <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={() => updateStatus('picked_up')}>Mark Picked Up</button>
                <button className="px-3 py-2 bg-indigo-600 text-white rounded" onClick={() => updateStatus('in_transit')}>Mark In Transit</button>
                <button className="px-3 py-2 bg-green-600 text-white rounded" onClick={() => updateStatus('delivered')}>Mark Delivered</button>
              </>
            )}
            {isAdmin && (
              <>
                <button className="px-3 py-2 bg-gray-700 text-white rounded" onClick={() => updateStatus('pending')}>Set Pending</button>
                <button className="px-3 py-2 bg-orange-600 text-white rounded" onClick={() => updateStatus('assigned')}>Set Assigned</button>
                <label className="flex items-center gap-2">
                  <span className="text-sm">Assign driver:</span>
                  <input value={assignDriverId} onChange={(e)=>setAssignDriverId(e.target.value)} placeholder="driver uuid" className="input" />
                  <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={assignDriver}>Assign</button>
                </label>
              </>
            )}
          </div>
        </section>
      )}
      <section>
        <a className="text-blue-600 hover:underline" href={`/consignments/${c.id}/documents`}>Manage Documents</a>
      </section>
    </main>
  )
}
