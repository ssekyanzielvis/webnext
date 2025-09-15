"use client"

import Link from 'next/link'
import { ShieldCheck, Users, Building2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

export default function Home() {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    run()
  }, [supabase])

  if (loading) {
    return <main className="min-h-screen flex items-center justify-center"><span>Loading...</span></main>
  }

  if (user) {
    // Show welcome and dashboard link based on role
    const role = user.user_metadata?.role || user.app_metadata?.role || 'user'
    let dashboard = '/client'
    if (role === 'admin' || role === 'other_admin') dashboard = '/admin'
    else if (role === 'driver') dashboard = '/driver'
    return (
      <main className="min-h-screen flex items-center justify-center">
        <section className="max-w-xl mx-auto p-8 card text-center">
          <h1 className="text-2xl font-bold mb-4">Welcome, {user.email}!</h1>
          <p className="mb-6">You are logged in as <span className="font-semibold">{role}</span>.</p>
          <Link href={dashboard} className="btn-primary">Go to Dashboard</Link>
          {role === 'client' && (
            <Link href="/client" className="btn-secondary mt-4">Go to Client Dashboard</Link>
          )}
        </section>
      </main>
    )
  }

  // Not logged in: show login buttons
  return (
    <main className="min-h-screen">
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h1 className="text-center text-2xl font-extrabold text-muted-700">Select your access level to continue</h1>
        <div className="mt-6 grid gap-4 md:gap-6">
          <AccessCard
            title="ADMIN LOGIN"
            desc="Full system access and administrative privileges"
            badge="Full Access"
            icon={<ShieldCheck className="text-primary" />}
            iconBg="bg-[#E9EDFF]"
            badgeBg="bg-[#E9EDFF]"
            badgeFg="text-primary"
            href="/auth/login"
          />
          <AccessCard
            title="CLIENT/DRIVER LOGIN"
            desc="Access for clients and drivers to manage assignments"
            badge="User Access"
            icon={<Users className="text-green-600" />}
            iconBg="bg-[#E9FCEB]"
            badgeBg="bg-[#E9FCEB]"
            badgeFg="text-green-700"
            href="/auth/login"
          />
          <AccessCard
            title="OTHER ADMIN LOGIN"
            desc="Department heads and supervisors with limited permissions"
            badge="Limited Access"
            icon={<Building2 className="text-amber-500" />}
            iconBg="bg-[#FFF4E5]"
            badgeBg="bg-[#FFF4E5]"
            badgeFg="text-amber-600"
            href="/auth/login"
          />
        </div>
      </section>
    </main>
  )
}

function AccessCard({ title, desc, icon, iconBg, badge, badgeBg, badgeFg, href }: {
  title: string; desc: string; icon: React.ReactNode; iconBg: string; badge: string; badgeBg: string; badgeFg: string; href: string;
}) {
  return (
    <Link href={href} className="card block p-4 md:p-6">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg}`}>{icon}</div>
        <div className="flex-1">
          <div className="font-extrabold text-lg text-neutral-900">{title}</div>
          <div className="text-sm text-muted-500 mt-1">{desc}</div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeBg} ${badgeFg}`}>{badge}</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
        </div>
      </div>
    </Link>
  )
}
