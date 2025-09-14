import type { User } from '@supabase/supabase-js'

export function getRoleFromUser(user: User | null | undefined) {
  if (!user) return 'user'
  const meta: any = user.user_metadata || {}
  const app: any = (user as any).app_metadata || {}
  return meta.role || app.role || 'user'
}
