"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import Image from 'next/image'
import { uploadToBucket } from '@/lib/storage'

export default function ProfilePage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string|null>(null)

  useEffect(() => {
    const run = async () => {
      const { data: { user } } = await supabase.auth.getUser(); if (!user) { window.location.href = '/auth/login'; return }
      const { data } = await supabase.from('users').select('*').eq('id', user.id).maybeSingle()
      setProfile(data || { id: user.id, email: user.email, full_name: '', phone: '' })
    }
    void run()
  }, [supabase])

  async function save() {
    setSaving(true)
    const { error } = await (supabase as any).from('users').upsert({
      id: profile.id, email: profile.email, full_name: profile.full_name, phone: profile.phone, profile_image: profile.profile_image
    })
    if (error) setErr(error.message)
    setSaving(false)
  }

  async function uploadImage() {
    const f = await selectFile(); if (!f) return
    const up = await uploadToBucket({ bucket: 'profile-images', file: f, path: `${profile.id}/${Date.now()}_${f.name}` })
    if (up) setProfile({ ...profile, profile_image: up.publicUrl })
  }

  if (!profile) return <main className="max-w-xl mx-auto px-4 py-6">Loading...</main>

  return (
    <main className="max-w-xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-4">Profile</h1>
      {err && <div className="text-sm text-red-600 mb-3">{err}</div>}
      <div className="card p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative w-16 h-16">
            <Image src={profile.profile_image || 'https://placehold.co/80x80'} alt="Profile avatar" fill className="rounded-full object-cover" sizes="64px" />
          </div>
          <button className="px-3 py-1 rounded-md bg-neutral-100" onClick={uploadImage}>Change Photo</button>
        </div>
        <label className="text-sm">Full name</label>
        <input className="border rounded-md px-3 py-2" value={profile.full_name || ''} onChange={e=>setProfile({...profile, full_name: e.target.value})} />
        <label className="text-sm">Phone</label>
        <input className="border rounded-md px-3 py-2" value={profile.phone || ''} onChange={e=>setProfile({...profile, phone: e.target.value})} />
        <button className="btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
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
