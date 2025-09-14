"use client"
import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

export default function CreateConsignment() {
  const supabase = createClient()
  const [form, setForm] = useState({ pickup: '', delivery: '', description: '', weight: '', instructions: '' })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string|null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setMsg(null)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/auth/login'; return }
    const payload = {
      id: crypto.randomUUID(),
      client_id: user.id,
      pickup_location: form.pickup.trim(),
      delivery_location: form.delivery.trim(),
      item_description: form.description.trim(),
      weight: parseFloat(form.weight),
      status: 'pending',
      special_instructions: form.instructions.trim() || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    const { error } = await (supabase as any).from('consignments').insert(payload as any)
    if (error) setMsg(error.message); else setMsg('Consignment created successfully!')
    setLoading(false)
    if (!error) setForm({ pickup:'', delivery:'', description:'', weight:'', instructions:'' })
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-4">Create Consignment</h1>
      <form onSubmit={submit} className="card p-4 space-y-4">
        {msg && (
          <div className={`text-sm ${msg.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>{msg}</div>
        )}
  <Input label="Pickup Location" value={form.pickup} onValueChange={(v)=>setForm(p=>({...p, pickup:v}))} required />
  <Input label="Delivery Location" value={form.delivery} onValueChange={(v)=>setForm(p=>({...p, delivery:v}))} required />
  <TextArea label="Item Description" value={form.description} onValueChange={(v)=>setForm(p=>({...p, description:v}))} required />
  <Input label="Weight (kg)" type="number" value={form.weight} onValueChange={(v)=>setForm(p=>({...p, weight:v}))} required />
  <TextArea label="Special Instructions (Optional)" value={form.instructions} onValueChange={(v)=>setForm(p=>({...p, instructions:v}))} />
        <button className="btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create Consignment'}</button>
      </form>
    </main>
  )
}

type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
  label: string
  onValueChange?: (value: string) => void
}

function Input({ label, onValueChange, ...props }: InputProps) {
  return (
    <label className="block">
      <span className="text-sm text-muted-500">{label}</span>
      <input
  {...props}
  onChange={(e) => onValueChange?.(e.target.value)}
        className="mt-1 w-full border rounded-md px-3 py-2"
      />
    </label>
  )
}

type TextAreaProps = Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> & {
  label: string
  onValueChange?: (value: string) => void
}

function TextArea({ label, onValueChange, ...props }: TextAreaProps) {
  return (
    <label className="block">
      <span className="text-sm text-muted-500">{label}</span>
      <textarea
  {...props}
  onChange={(e) => onValueChange?.(e.target.value)}
        className="mt-1 w-full border rounded-md px-3 py-2"
        rows={3}
      />
    </label>
  )
}
