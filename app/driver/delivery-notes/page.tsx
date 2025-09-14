"use client"
import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase-browser'
import { uploadToBucket } from '@/lib/storage'

type Note = {
  id: string
  driver_id: string
  customer_id: string
  customer_name: string
  delivery_address: string
  image_url: string
  created_at: string
  status: string
  notes: string | null
}

export default function DeliveryNotesPage() {
  const supabase = createClient()
  const [items, setItems] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string|null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/auth/login'; return }
    const { data, error } = await (supabase as any)
      .from('delivery_notes').select('*').eq('driver_id', user.id).order('created_at', { ascending: false })
    if (error) setErr(error.message); else setItems(data as any)
    setLoading(false)
  }, [supabase])

  useEffect(() => { void load() }, [load])

  async function add() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const customerName = prompt('Customer name?') || ''
    const deliveryAddress = prompt('Delivery address?') || ''
    const fileHandle = await selectFile()
    if (!fileHandle) return
    const uploaded = await uploadToBucket({ bucket: 'delivery-notes', file: fileHandle, path: `delivery_notes/${user.id}_${Date.now()}.jpg` })
    if (!uploaded) { setErr('Upload failed'); return }
    const { error } = await (supabase as any).from('delivery_notes').insert({
      id: crypto.randomUUID(),
      driver_id: user.id,
      customer_id: user.id,
      customer_name: customerName,
      delivery_address: deliveryAddress,
      image_url: uploaded.publicUrl,
      image_path: uploaded.path,
      status: 'delivered',
      created_at: new Date().toISOString()
    })
    if (error) setErr(error.message); else load()
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Delivery Notes</h1>
        <button className="btn-primary" onClick={add}>Add Note</button>
      </div>
      {err && <div className="text-sm text-red-600 mb-3">{err}</div>}
      {loading ? <div>Loading...</div> : (
        <ul className="space-y-3">
          {items.map(n => (
            <li key={n.id} className="card p-4 flex gap-3">
              {/* Using next/image for optimization */}
              <div className="relative w-24 h-24">
                <Image src={n.image_url} alt="proof" fill className="object-cover rounded" sizes="96px" />
              </div>
              <div className="flex-1">
                <div className="font-semibold">{n.customer_name}</div>
                <div className="text-sm text-neutral-600">{n.delivery_address}</div>
                <div className="text-xs text-neutral-500">{new Date(n.created_at).toLocaleString()}</div>
              </div>
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
    input.onchange = () => {
      const f = input.files?.[0] || null
      resolve(f)
    }
    input.click()
  })
}
