"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { uploadToBucket } from '@/lib/storage'
import Image from 'next/image'

export default function ConsignmentDocuments({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const id = params.id
  const [docUrl, setDocUrl] = useState<string | null>(null)
  const [err, setErr] = useState<string|null>(null)

  useEffect(() => {
    const run = async () => {
      const { data } = await supabase.from('consignments').select('document_url').eq('id', id).maybeSingle()
      setDocUrl((data as any)?.document_url || null)
    }
    void run()
  }, [id, supabase])

  async function upload() {
    const f = await selectFile(); if (!f) return
    const up = await uploadToBucket({ bucket: 'consignment-docs', file: f, path: `${id}/${Date.now()}_${f.name}` })
    if (!up) { setErr('Upload failed'); return }
    const { error } = await (supabase as any).from('consignments').update({ document_url: up.publicUrl }).eq('id', id)
    if (error) setErr(error.message); else setDocUrl(up.publicUrl)
  }

  async function remove() {
    const { error } = await (supabase as any).from('consignments').update({ document_url: null }).eq('id', id)
    if (error) setErr(error.message); else setDocUrl(null)
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-4">Consignment Documents</h1>
      {err && <div className="text-sm text-red-600 mb-3">{err}</div>}
      <div className="card p-4">
        {docUrl ? (
          <div className="space-y-3">
            <div className="relative w-full h-64">
              <Image src={docUrl} alt="Consignment document" fill className="object-contain rounded bg-neutral-50" sizes="(max-width: 768px) 100vw, 768px" />
            </div>
            <button className="px-3 py-1 rounded-md bg-neutral-100" onClick={remove}>Remove</button>
          </div>
        ) : (
          <button className="btn-primary" onClick={upload}>Upload Document</button>
        )}
      </div>
    </main>
  )
}

async function selectFile(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = () => { resolve(input.files?.[0] || null) }
    input.click()
  })
}
