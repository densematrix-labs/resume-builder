import { useEffect, useState } from 'react'
import FingerprintJS from '@fingerprintjs/fingerprintjs'

let cachedDeviceId: string | null = null

export async function getDeviceId(): Promise<string> {
  if (cachedDeviceId) return cachedDeviceId
  
  // Check localStorage first
  const stored = localStorage.getItem('device_id')
  if (stored) {
    cachedDeviceId = stored
    return stored
  }
  
  // Generate new fingerprint
  try {
    const fp = await FingerprintJS.load()
    const result = await fp.get()
    cachedDeviceId = result.visitorId
    localStorage.setItem('device_id', cachedDeviceId)
    return cachedDeviceId
  } catch (error) {
    // Fallback to random ID
    const fallbackId = crypto.randomUUID()
    localStorage.setItem('device_id', fallbackId)
    cachedDeviceId = fallbackId
    return fallbackId
  }
}

export function useDeviceId(): string | null {
  const [deviceId, setDeviceId] = useState<string | null>(cachedDeviceId)
  
  useEffect(() => {
    getDeviceId().then(setDeviceId)
  }, [])
  
  return deviceId
}
