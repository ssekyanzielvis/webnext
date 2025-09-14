import { createServerClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export function createClient(): SupabaseClient<any, any, any> {
  const cookieStore = cookies()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  if (!url || !anon) throw new Error('Missing Supabase envs')

  return createServerClient<any>(url, anon, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
  cookieStore.set(name, value, options)
      },
      remove(name: string, options: any) {
  cookieStore.set(name, '', { ...options, maxAge: 0 })
      }
    }
  })
}
