"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import Link from 'next/link'

export default function LoginPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // If already logged in, send to their dashboard
  useEffect(() => {
    const run = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await redirectByRole(supabase)
    }
    run()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null); setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    await redirectByRole(supabase)
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      <form onSubmit={onSubmit} className="card w-full max-w-md p-6 space-y-4">
        <h1 className="text-xl font-bold">Login</h1>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <input type="email" placeholder="Email" className="w-full border rounded-md px-3 py-2" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" className="w-full border rounded-md px-3 py-2" value={password} onChange={e=>setPassword(e.target.value)} required />
        <button className="btn-primary w-full" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
        <div className="text-sm text-center">
          <Link href="/auth/register" className="text-primary">Create account</Link>
        </div>
      </form>
    </main>
  )
}

async function redirectByRole(supabase: ReturnType<typeof createClient>) {
  // Prefer role from users table, then fallback to auth metadata
  const { data: u } = await supabase.auth.getUser()
  const user = u.user
  if (!user) return
  let role: string | null = null
  const { data: profile } = await (supabase as any).from('users').select('role').eq('id', user.id).maybeSingle()
  if (profile?.role) role = profile.role
  if (!role) {
    const meta: any = user.user_metadata || {}
    const app: any = (user as any).app_metadata || {}
    role = meta.role || app.role || 'user'
  }
  if (role === 'admin' || role === 'other_admin') window.location.href = '/admin'
  else if (role === 'driver') window.location.href = '/driver'
  else window.location.href = '/client'
}
