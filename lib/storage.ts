import { createClient } from '@/lib/supabase-browser'

export async function uploadToBucket(opts: { bucket: string; file: File; path?: string }): Promise<{ publicUrl: string; path: string } | null> {
  const supabase = createClient()
  const { bucket, file } = opts
  const path = opts.path || `${Date.now()}_${Math.random().toString(36).slice(2)}_${file.name}`
  const { error } = await (supabase as any).storage.from(bucket).upload(path, file)
  if (error) return null
  const { data } = (supabase as any).storage.from(bucket).getPublicUrl(path)
  return { publicUrl: data.publicUrl, path }
}
