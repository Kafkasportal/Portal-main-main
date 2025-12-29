'use client'

import { useUserStore } from '@/stores/user-store'
import { useEffect } from 'react'

export function AuthInitializer() {
  const { initializeAuth } = useUserStore()

  useEffect(() => {
    // Only initialize on client-side
    if (typeof window !== 'undefined') {
      initializeAuth()
    }
  }, [initializeAuth])

  return null
}
