import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { toCSV } from '@/lib/csv'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })
  // basic admin check based on metadata
  const role = (user.app_metadata as any)?.role || (user.user_metadata as any)?.role
  if (!['admin','other_admin'].includes(role)) return new NextResponse('Forbidden', { status: 403 })

  const { data, error } = await supabase
    .from('fuel_transactions' as any)
    .select('*')
    .order('transaction_date', { ascending: false })
    .limit(5000)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const rows = (data ?? []) as any[]
  const csv = toCSV(rows)
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="fuel_transactions_export_${Date.now()}.csv"`
    }
  })
}
