export default function AdminSettingsPage() {
  return (
    <main className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Settings & Tools</h1>
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Exports</h2>
        <div className="flex gap-3 text-sm flex-wrap">
          <a className="px-3 py-2 bg-blue-600 text-white rounded" href="/api/export/consignments">Export Consignments (CSV)</a>
          <a className="px-3 py-2 bg-blue-600 text-white rounded" href="/api/export/fuel-transactions">Export Fuel Transactions (CSV)</a>
          <a className="px-3 py-2 bg-blue-600 text-white rounded" href="/api/export/users">Export Users (CSV)</a>
        </div>
      </section>
      <section className="mt-6 space-y-2">
        <h2 className="text-lg font-semibold">Backups</h2>
        <p className="text-sm text-gray-600">Use exports above as light backups. For full storage backups (receipts/images), use Supabase dashboard or scripts.</p>
      </section>
    </main>
  )
}
