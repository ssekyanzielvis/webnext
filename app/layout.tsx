import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Logistics Portal',
  description: 'Logistics & Procurement Management',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="w-full">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="/" className="font-extrabold">Logistics</a>
            <nav className="flex gap-3 text-sm">
              <a href="/client" className="hover:underline">Client</a>
              <a href="/driver" className="hover:underline">Driver</a>
              <a href="/admin" className="hover:underline">Admin</a>
              <a href="/admin/analytics" className="hover:underline">Analytics</a>
              <a href="/admin/fuel-cards" className="hover:underline">Fuel Cards</a>
              <a href="/admin/driver-locations" className="hover:underline">Driver Locations</a>
              <a href="/admin/settings" className="hover:underline">Settings</a>
              <a href="/admin/fuel-transactions" className="hover:underline">Fuel Txns</a>
              <a href="/chat" className="hover:underline">Chat</a>
              <a href="/chat/new" className="hover:underline">New Chat</a>
              <a href="/profile" className="hover:underline">Profile</a>
              <a href="/auth/logout" className="hover:underline">Logout</a>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  )
}
