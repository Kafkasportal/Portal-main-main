'use client'

import { useEffect, useState } from 'react'
import { useIsMobile } from './use-media-query'

export interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isTouch: boolean
  isIOS: boolean
  isAndroid: boolean
  isSafari: boolean
  isChrome: boolean
  isFirefox: boolean
  prefersReducedMotion: boolean
}

/**
 * Comprehensive device detection hook
 * Detects mobile, tablet, desktop, touch support, OS, and browser
 */
export function useDevice(): DeviceInfo {
  const isMobile = useIsMobile()
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isTouch: false,
        isIOS: false,
        isAndroid: false,
        isSafari: false,
        isChrome: false,
        isFirefox: false,
        prefersReducedMotion: false,
      }
    }

    const userAgent = window.navigator.userAgent.toLowerCase()
    const width = window.innerWidth

    // Touch support detection
    const isTouch =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      // @ts-expect-error - legacy support
      navigator.msMaxTouchPoints > 0

    // OS detection
    const isIOS = /iphone|ipad|ipod/.test(userAgent)
    const isAndroid = /android/.test(userAgent)

    // Browser detection
    const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent)
    const isChrome = /chrome/.test(userAgent) && !/edg/.test(userAgent)
    const isFirefox = /firefox/.test(userAgent)

    // Tablet detection (between mobile and desktop breakpoints)
    const isTablet = width >= 768 && width < 1024

    // Reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    return {
      isMobile: width < 768,
      isTablet,
      isDesktop: width >= 1024,
      isTouch,
      isIOS,
      isAndroid,
      isSafari,
      isChrome,
      isFirefox,
      prefersReducedMotion,
    }
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateDeviceInfo = () => {
      const userAgent = window.navigator.userAgent.toLowerCase()
      const width = window.innerWidth

      const isTouch =
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-expect-error - legacy support
        navigator.msMaxTouchPoints > 0

      const isIOS = /iphone|ipad|ipod/.test(userAgent)
      const isAndroid = /android/.test(userAgent)
      const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent)
      const isChrome = /chrome/.test(userAgent) && !/edg/.test(userAgent)
      const isFirefox = /firefox/.test(userAgent)
      const isTablet = width >= 768 && width < 1024
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches

      setDeviceInfo({
        isMobile: width < 768,
        isTablet,
        isDesktop: width >= 1024,
        isTouch,
        isIOS,
        isAndroid,
        isSafari,
        isChrome,
        isFirefox,
        prefersReducedMotion,
      })
    }

    // Listen to resize events
    window.addEventListener('resize', updateDeviceInfo)

    // Listen to reduced motion preference changes
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleMotionChange = () => {
      updateDeviceInfo()
    }
    mediaQuery.addEventListener('change', handleMotionChange)

    return () => {
      window.removeEventListener('resize', updateDeviceInfo)
      mediaQuery.removeEventListener('change', handleMotionChange)
    }
  }, [])

  // Update isMobile based on hook
  return {
    ...deviceInfo,
    isMobile,
  }
}

/**
 * Hook to get optimized transition duration based on device
 */
export function useTransitionDuration(): number {
  const { isMobile, prefersReducedMotion } = useDevice()

  if (prefersReducedMotion) {
    return 0 // Instant transitions for accessibility
  }

  // Mobile: faster transitions (100ms)
  // Desktop: smoother transitions (200ms)
  return isMobile ? 100 : 200
}

/**
 * Hook to check if animations should be reduced
 */
export function useShouldReduceMotion(): boolean {
  const { prefersReducedMotion, isMobile } = useDevice()
  
  // Reduce motion on mobile for better performance
  // or if user prefers reduced motion
  return prefersReducedMotion || (isMobile && false) // Set to true to disable mobile animations
}

