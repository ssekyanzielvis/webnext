import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const PROTECTED_PREFIXES = ['/client','/driver','/admin','/chat','/profile','/consignments']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (!PROTECTED_PREFIXES.some(p => pathname.startsWith(p))) return NextResponse.next()

  const res = NextResponse.next()

  // Validate session with Supabase using SSR helper, syncing cookies on refresh
  const supabase = createServerClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => {
            res.cookies.set({ name, value, ...options })
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const url = req.nextUrl.clone(); url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  return res
}

export const config = {
  matcher: ['/client/:path*','/driver/:path*','/admin/:path*','/chat/:path*','/profile/:path*','/consignments/:path*']
}
