import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient<any, any, any> | null = null

// Basic cookie helpers for the browser environment
function getAllCookies(): { name: string; value: string }[] {
  if (typeof document === 'undefined') return []
  return document.cookie
    .split(';')
    .map((c) => c.trim())
    .filter(Boolean)
    .map((c) => {
      const idx = c.indexOf('=')
      const name = idx >= 0 ? decodeURIComponent(c.slice(0, idx)) : c
      const value = idx >= 0 ? decodeURIComponent(c.slice(idx + 1)) : ''
      return { name, value }
    })
}

function setAllCookies(cookies: { name: string; value: string; options?: any }[]) {
  if (typeof document === 'undefined') return
  for (const { name, value, options } of cookies) {
    let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`
    if (options) {
      if (options.maxAge) cookie += `; Max-Age=${options.maxAge}`
      if (options.expires) cookie += `; Expires=${new Date(options.expires).toUTCString()}`
      if (options.path) cookie += `; Path=${options.path}`
      if (options.domain) cookie += `; Domain=${options.domain}`
      if (options.sameSite) cookie += `; SameSite=${options.sameSite}`
      if (options.secure) cookie += `; Secure`
      // HttpOnly cannot be set from the browser
    }
    document.cookie = cookie
  }
}

export function createClient(): SupabaseClient<any, any, any> {
  if (client) return client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  if (!url || !anon) throw new Error('Missing Supabase envs')
  client = createBrowserClient<any>(url, anon, {
    cookies: {
      getAll: async () => getAllCookies(),
      setAll: async (cookies) => setAllCookies(cookies),
    },
  })
  return client
}
