'use client'

import { useUserStore } from '@/stores/user-store'
import { useEffect } from 'react'

export function AuthInitializer() {
  const { initializeAuth } = useUserStore()

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  return null
}
