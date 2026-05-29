'use client'

import { useEffect, useState } from 'react'

export default function OfflineBanner() {
  const [online, setOnline] = useState(true)

  useEffect(() => {
    setOnline(navigator.onLine)
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (online) return null

  return (
    <div
      className="fixed inset-x-0 z-50 flex justify-center"
      style={{ top: 'env(safe-area-inset-top)' }}
    >
      <div
        className="w-full max-w-md py-2 px-4 text-center text-label-sm"
        style={{
          background: 'var(--surface)',
          borderBottom: '0.5px solid var(--border)',
          color: 'var(--text-secondary)',
        }}
      >
        Offline — changes will sync when reconnected
      </div>
    </div>
  )
}
