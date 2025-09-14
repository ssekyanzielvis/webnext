import Link from 'next/link'
import { ShieldCheck, Users, Building2 } from 'lucide-react'

export default function Home() {
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
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <Link className="card p-3" href="/admin/analytics">Admin Analytics</Link>
          <Link className="card p-3" href="/admin/fuel-cards">Fuel Cards</Link>
          <Link className="card p-3" href="/admin/lockers">Lockers</Link>
          <Link className="card p-3" href="/admin/fuel-assignments">Assignments</Link>
          <Link className="card p-3" href="/driver/delivery-notes">Delivery Notes</Link>
          <Link className="card p-3" href="/driver/fuel-transactions">Fuel Transactions</Link>
          <Link className="card p-3" href="/profile">Profile</Link>
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
