"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'

export default function RegisterPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<'client'|'driver'>('client')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // If already authenticated, send to their dashboard (mirror login page)
  useEffect(() => {
    const run = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      let next = '/client'
      const { data: profile } = await (supabase as any).from('users').select('role').eq('id', user.id).maybeSingle()
      const metaRole = (user.user_metadata as any)?.role || (user as any).app_metadata?.role
      const r = (profile?.role || metaRole || 'user') as string
      if (r === 'admin' || r === 'other_admin') next = '/admin'
      else if (r === 'driver') next = '/driver'
      else next = '/client'
      window.location.href = next
    }
    run()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null); setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone, role }
      }
    })
    if (error) { setError(error.message); setLoading(false); return }

    // ensure profile row
    const userId = data.user?.id
    if (userId) {
      await (supabase as any).from('users').upsert({
        id: userId,
        email,
        full_name: fullName,
        phone,
        role,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })

      // Post-registration check: ensure role is set in users table
      const { data: profile } = await (supabase as any).from('users').select('role').eq('id', userId).maybeSingle()
      if (!profile || profile.role !== role) {
        // Try to update again if not set
        await (supabase as any).from('users').update({ role }).eq('id', userId)
      }
    }

    // Redirect based on chosen role
    window.location.href = role === 'driver' ? '/driver' : '/client'
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      <form onSubmit={onSubmit} className="card w-full max-w-md p-6 space-y-4">
        <h1 className="text-xl font-bold">Create account</h1>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <input placeholder="Full name" className="w-full border rounded-md px-3 py-2" value={fullName} onChange={e=>setFullName(e.target.value)} />
        <input type="email" placeholder="Email" className="w-full border rounded-md px-3 py-2" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input placeholder="Phone" className="w-full border rounded-md px-3 py-2" value={phone} onChange={e=>setPhone(e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          <label className={`border rounded-md px-3 py-2 flex items-center gap-2 ${role==='client'?'bg-neutral-100':''}`}>
            <input type="radio" name="role" checked={role==='client'} onChange={()=>setRole('client')} />
            <span>Client</span>
          </label>
          <label className={`border rounded-md px-3 py-2 flex items-center gap-2 ${role==='driver'?'bg-neutral-100':''}`}>
            <input type="radio" name="role" checked={role==='driver'} onChange={()=>setRole('driver')} />
            <span>Driver</span>
          </label>
        </div>
        <input type="password" placeholder="Password" className="w-full border rounded-md px-3 py-2" value={password} onChange={e=>setPassword(e.target.value)} required />
        <button className="btn-primary w-full" disabled={loading}>{loading ? 'Creating...' : 'Sign up'}</button>
      </form>
    </main>
  )
}
