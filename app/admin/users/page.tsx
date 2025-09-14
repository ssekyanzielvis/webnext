"use client"
import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import type { UserProfile } from '@/types/db'
import { getRoleFromUser } from '@/lib/role'

export default function UserManagement() {
  const supabase = createClient()
  const [items, setItems] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | UserProfile['role']>('all')

  const load = useCallback(async () => {
    setLoading(true)
    let q: any = (supabase as any).from('users').select('*')
    if (filter !== 'all') q = q.eq('role', filter)
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

  async function setRole(userId: string, role: UserProfile['role']) {
  const { error } = await (supabase as any).from('users').update({ role } as any).eq('id', userId)
    if (!error) load()
  }

  async function toggleActive(u: UserProfile) {
    const { error } = await (supabase as any).from('users').update({ is_active: !u.is_active } as any).eq('id', u.id)
    if (!error) load(); else setError(error.message)
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-2">User Management</h1>
      <div className="flex gap-2 overflow-auto mb-4">
        {(['all','client','driver','admin','other_admin'] as const).map(r => (
          <button key={r} onClick={()=>setFilter(r as any)} className={`px-3 py-1 rounded-full text-sm ${filter===r?'bg-[#4C6FFF] text-white':'bg-neutral-100'}`}>{r.replace('_',' ')}</button>
        ))}
      </div>
      {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
      {loading ? <div>Loading...</div> : (
        <table className="w-full text-sm card">
          <thead className="bg-neutral-50">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Role</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(u => (
              <tr key={u.id} className="border-t">
                <td className="p-3">{u.full_name || '—'}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-neutral-100">{u.role}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.is_active ? 'Active' : 'Inactive'}</span>
                  </div>
                </td>
                <td className="p-3 text-right space-x-2">
                  <button className="px-3 py-1 rounded-md bg-neutral-100" onClick={()=>setRole(u.id, 'client')}>Client</button>
                  <button className="px-3 py-1 rounded-md bg-neutral-100" onClick={()=>setRole(u.id, 'user')}>User</button>
                    <button className="px-3 py-1 rounded-md bg-neutral-100" onClick={()=>setRole(u.id, 'driver')}>Driver</button>
                    <button className="px-3 py-1 rounded-md bg-neutral-100" onClick={()=>setRole(u.id, 'admin')}>Admin</button>
                  <button className="px-3 py-1 rounded-md bg-neutral-100" onClick={()=>setRole(u.id, 'other_admin')}>Other Admin</button>
                  <button className="px-3 py-1 rounded-md bg-neutral-100" onClick={()=>toggleActive(u)}>{u.is_active ? 'Deactivate' : 'Activate'}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  )
}
