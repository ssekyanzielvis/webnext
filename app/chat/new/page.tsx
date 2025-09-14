"use client"
import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

type UserRow = { id: string; email: string | null; full_name?: string | null }

export default function NewChatPage() {
  const supabase = createClient()
  const router = useRouter()
  const [me, setMe] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [rows, setRows] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(false)
  const debounced = useMemo(() => q.trim().toLowerCase(), [q])

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setMe(user.id)
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    let active = true
    const run = async () => {
      if (!debounced) { setRows([]); return }
      setLoading(true)
      // search in public.users table if present; else fall back to auth users via rpc
      const { data, error } = await supabase
        .from('users' as any)
        .select('id, email, full_name')
        .ilike('email', `%${debounced}%`)
        .limit(20)
      setLoading(false)
      if (!active) return
      if (error) { setRows([]); return }
      setRows((data as any[]) as UserRow[])
    }
    run()
    return () => { active = false }
  }, [debounced, supabase])

  const startChat = async (otherId: string) => {
    if (!me) return
    // Prefer RPC helper if exists
    try {
      const { data, error } = await supabase.rpc('get_or_create_chat_room', { u1: me, u2: otherId })
      if (error) throw error
      const roomId = (data as any) as string
      router.push(`/chat/${roomId}`)
    } catch {
      // Fallback: try to insert room in ordered pair style
      const a = me < otherId ? me : otherId
      const b = me < otherId ? otherId : me
      const { data: room, error: insErr } = await supabase
        .from('chat_rooms' as any)
        .upsert({ user1_id: a, user2_id: b }, { onConflict: 'user1_id,user2_id' })
        .select('id')
        .single()
      if (insErr || !room) return
      router.push(`/chat/${(room as any).id}`)
    }
  }

  return (
    <main className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-3">Start a new conversation</h1>
      <input
        className="input w-full"
        placeholder="Search by email"
        value={q}
        onChange={(e)=>setQ(e.target.value)}
      />
      {loading && <div className="mt-2 text-sm">Searching…</div>}
      <ul className="mt-4 divide-y border rounded">
        {rows.map(u => (
          <li key={u.id} className="p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{u.full_name || u.email || u.id}</div>
              <div className="text-xs text-gray-600">{u.email}</div>
            </div>
            <button className="px-3 py-1.5 bg-blue-600 text-white rounded" onClick={() => startChat(u.id)}>Chat</button>
          </li>
        ))}
        {!rows.length && !!debounced && !loading && (
          <li className="p-3 text-sm text-gray-600">No users found</li>
        )}
      </ul>
    </main>
  )
}
