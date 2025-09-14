import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function OtherAdminGate() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const { data: profile } = await (supabase as any).from('users').select('role').eq('id', user.id).maybeSingle()
  const meta: any = user.user_metadata || {}; const app: any = (user as any).app_metadata || {}
  const role = profile?.role || meta.role || app.role || 'user'
  if (role === 'admin' || role === 'other_admin') redirect('/admin')
  if (role === 'driver') redirect('/driver')
  redirect('/client')
}
