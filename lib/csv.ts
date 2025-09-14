export function toCSV<T extends Record<string, any>>(rows: T[], headerOrder?: string[]): string {
  if (!rows.length) return ''
  const headers = headerOrder && headerOrder.length ? headerOrder : Object.keys(rows[0])
  const esc = (val: any) => {
    if (val === null || val === undefined) return ''
    const s = String(val)
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return '"' + s.replace(/"/g, '""') + '"'
    }
    return s
  }
  const lines = [headers.join(',')]
  for (const row of rows) {
    lines.push(headers.map(h => esc(row[h])).join(','))
  }
  return lines.join('\n')
}
