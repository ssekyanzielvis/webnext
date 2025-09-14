"use client"
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

type DriverLocation = {
  driver_id: string
  lat: number
  lng: number
  accuracy?: number
  heading?: number
  speed?: number
  altitude?: number
  timestamp?: string
  updated_at?: string
}

export default function DriverLocationPage() {
  const supabase = createClient()
  const watchIdRef = useRef<number | null>(null)
  const [sharing, setSharing] = useState(false)
  const [loc, setLoc] = useState<DriverLocation | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function getUserId(): Promise<string | null> {
    const { data } = await supabase.auth.getUser()
    return data.user?.id ?? null
  }

  async function upsertLocation(position: GeolocationPosition) {
    const userId = await getUserId()
    if (!userId) return
    const coords = position.coords
    const payload: DriverLocation = {
      driver_id: userId,
      lat: coords.latitude,
      lng: coords.longitude,
      accuracy: coords.accuracy,
      heading: coords.heading ?? undefined,
      speed: coords.speed ?? undefined,
      altitude: coords.altitude ?? undefined,
      timestamp: new Date(position.timestamp).toISOString(),
      updated_at: new Date().toISOString(),
    }
    setLoc(payload)
    await supabase.from('driver_locations' as any).upsert(payload as any)
  }

  const startSharing = async () => {
    setError(null)
    if (!('geolocation' in navigator)) {
      setError('Geolocation not supported by this browser')
      return
    }
    const perms = await navigator.permissions?.query({ name: 'geolocation' as PermissionName }).catch(() => null)
    if (perms && perms.state === 'denied') {
      setError('Location permission denied. Please allow location access.')
      return
    }
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setSharing(true)
        upsertLocation(pos)
      },
      (err) => {
        setError(err.message)
        setSharing(false)
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    )
  }

  const stopSharing = () => {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setSharing(false)
  }

  useEffect(() => {
    return () => {
      if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current)
    }
  }, [])

  return (
    <main className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Driver Live Location</h1>
      <div className="flex gap-2 mb-4">
        {!sharing ? (
          <button onClick={startSharing} className="px-3 py-2 bg-blue-600 text-white rounded">Start Sharing</button>
        ) : (
          <button onClick={stopSharing} className="px-3 py-2 bg-gray-600 text-white rounded">Stop Sharing</button>
        )}
      </div>
      {error && <p className="text-red-600">{error}</p>}
      {loc && (
        <div className="mt-4 text-sm space-y-1">
          <div><span className="font-semibold">Lat:</span> {loc.lat}</div>
          <div><span className="font-semibold">Lng:</span> {loc.lng}</div>
          {loc.accuracy != null && <div><span className="font-semibold">Accuracy:</span> {loc.accuracy} m</div>}
          {loc.speed != null && <div><span className="font-semibold">Speed:</span> {loc.speed} m/s</div>}
          {loc.heading != null && <div><span className="font-semibold">Heading:</span> {loc.heading}°</div>}
          {loc.timestamp && <div><span className="font-semibold">Timestamp:</span> {new Date(loc.timestamp).toLocaleString()}</div>}
        </div>
      )}
      <p className="mt-6 text-xs text-gray-600">Note: location updates every few seconds while this page is open.</p>
    </main>
  )
}
