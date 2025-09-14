import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'

export default async function DriverLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const { data: profile } = await (supabase as any).from('users').select('role').eq('id', user.id).maybeSingle()
  const role = (profile as any)?.role || (user as any).user_metadata?.role || (user as any).app_metadata?.role || 'user'
  if (role !== 'driver' && role !== 'admin' && role !== 'other_admin') redirect('/client')
  return <>{children}</>
}
