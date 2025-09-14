"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

type ChatRoom = { id: string, user1_id: string, user2_id: string, last_activity: string | null }

enum Role { user='user', driver='driver', admin='admin', other_admin='other_admin' }

export default function ChatList() {
  const supabase = createClient()
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth/login'; return }
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('id,user1_id,user2_id,last_activity')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('last_activity', { ascending: false })
      if (!error && data) setRooms(data as any)
      setLoading(false)
    }
    void run()
  }, [supabase])

  return (
    <main className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-4">Chats</h1>
      {loading ? <div>Loading...</div> : (
        <ul className="space-y-3">
          {rooms.map(r => (
            <li key={r.id} className="card p-4">
              <a href={`/chat/${r.id}`} className="font-semibold">Open chat {r.id.substring(0,8)}...</a>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
