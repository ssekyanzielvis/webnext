"use client"
import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

export default function ResetPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null); setMsg(null); setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) setErr(error.message); else setMsg('Check your email for a password reset link.')
    setLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      <form onSubmit={onSubmit} className="card w-full max-w-md p-6 space-y-4">
        <h1 className="text-xl font-bold">Reset password</h1>
        {err && <div className="text-red-600 text-sm">{err}</div>}
        {msg && <div className="text-green-700 text-sm">{msg}</div>}
        <input type="email" placeholder="Email" className="w-full border rounded-md px-3 py-2" value={email} onChange={e=>setEmail(e.target.value)} required />
        <button className="btn-primary w-full" disabled={loading}>{loading ? 'Sending...' : 'Send reset link'}</button>
      </form>
    </main>
  )
}
