"use client"
import { useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { uploadToBucket } from '@/lib/storage'

export default function ChatRoomPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const chatRoomId = params.id
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [otherId, setOtherId] = useState<string|null>(null)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const boot = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth/login'; return }

      // Load room to compute other user
      const { data: room } = await supabase.from('chat_rooms').select('*').eq('id', chatRoomId).maybeSingle()
      if (room) {
        setOtherId(room.user1_id === user.id ? room.user2_id : room.user1_id)
      }

      // Initial load
      const { data } = await supabase.from('messages').select('*').eq('chat_room_id', chatRoomId).order('created_at', { ascending: true })
      setMessages(data || [])

      // Realtime stream
      const channel = supabase
        .channel(`messages:${chatRoomId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_room_id=eq.${chatRoomId}` }, (payload) => {
          setMessages(prev => [...prev, payload.new])
        })
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    }
    void boot()
  }, [chatRoomId, supabase])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function send() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !otherId) return
    const text = input.trim(); if (!text) return
    setInput('')
    await supabase.from('messages').insert({
      chat_room_id: chatRoomId,
      sender_id: user.id,
      receiver_id: otherId,
      message: text,
      type: 'text',
      created_at: new Date().toISOString()
    })
  }

  async function sendImage() {
    const { data: { user } } = await supabase.auth.getUser(); if (!user || !otherId) return
    const file = await selectFile(); if (!file) return
    const up = await uploadToBucket({ bucket: 'chat-images', file, path: `${chatRoomId}/${user.id}_${Date.now()}_${file.name}` })
    if (!up) return
    await supabase.from('messages').insert({
      chat_room_id: chatRoomId,
      sender_id: user.id,
      receiver_id: otherId,
      image_url: up.publicUrl,
      type: 'image',
      created_at: new Date().toISOString()
    })
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-6">
      <div className="card p-4 h-[70vh] flex flex-col">
        <div className="flex-1 overflow-auto space-y-2">
          {messages.map((m) => (
            <div key={m.id} className={`max-w-[75%] px-3 py-2 rounded-md ${m.type==='image' ? 'bg-neutral-100' : (m.message ? 'bg-neutral-100' : 'bg-neutral-50')} ${m.sender_id===otherId ? '' : 'ml-auto bg-[#E9EDFF]'}`}>
              {m.message}
            </div>
          ))}
          <div ref={endRef} />
        </div>
        <div className="mt-2 flex gap-2">
          <input className="flex-1 border rounded-md px-3 py-2" value={input} onChange={e=>setInput(e.target.value)} placeholder="Type a message" />
          <button className="px-3 py-2 rounded-md bg-neutral-100" onClick={sendImage}>Image</button>
          <button className="btn-primary" onClick={send}>Send</button>
        </div>
      </div>
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
