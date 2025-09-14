import { createClient } from '@/lib/supabase-server'

type Row = {
  driver_id: string
  lat: number
  lng: number
  updated_at: string
}

export const dynamic = 'force-dynamic'

export default async function DriverLocationsAdminPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    // simple guard; middleware should redirect anyway
    return <main className="max-w-4xl mx-auto p-4">Not authenticated</main>
  }
  const { data, error } = await supabase
    .from('driver_locations' as any)
    .select('driver_id, lat, lng, updated_at')
    .order('updated_at', { ascending: false })
    .limit(100)
  if (error) {
    return <main className="max-w-4xl mx-auto p-4"><p className="text-red-600">{error.message}</p></main>
  }
  const rows = (data ?? []) as Row[]
  return (
    <main className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Driver Locations</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2 border">Driver ID</th>
              <th className="text-left p-2 border">Latitude</th>
              <th className="text-left p-2 border">Longitude</th>
              <th className="text-left p-2 border">Updated At</th>
              <th className="text-left p-2 border">Map</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.driver_id} className="odd:bg-white even:bg-gray-50">
                <td className="p-2 border font-mono text-xs">{r.driver_id}</td>
                <td className="p-2 border">{r.lat.toFixed(6)}</td>
                <td className="p-2 border">{r.lng.toFixed(6)}</td>
                <td className="p-2 border">{new Date(r.updated_at).toLocaleString()}</td>
                <td className="p-2 border">
                  <a className="text-blue-600 hover:underline" target="_blank" rel="noreferrer" href={`https://www.google.com/maps?q=${r.lat},${r.lng}`}>Open</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
