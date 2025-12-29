'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef, useTransition } from 'react'
import { cn } from '@/lib/utils'
import { useDevice, useTransitionDuration, useShouldReduceMotion } from '@/hooks/use-device'

interface PageTransitionProps {
  children: React.ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const containerRef = useRef<HTMLDivElement>(null)
  const prevPathnameRef = useRef(pathname)
  const { isMobile, isTouch } = useDevice()
  const transitionDuration = useTransitionDuration()
  const shouldReduceMotion = useShouldReduceMotion()

  useEffect(() => {
    if (prevPathnameRef.current !== pathname && containerRef.current) {
      // Skip animations if user prefers reduced motion
      if (shouldReduceMotion) {
        if (containerRef.current) {
          containerRef.current.style.opacity = '1'
          containerRef.current.style.transform = 'translateY(0)'
          containerRef.current.style.pointerEvents = 'auto'
          containerRef.current.style.transition = 'none'
        }
        prevPathnameRef.current = pathname
        return
      }

      // Mobile: faster, simpler transitions
      // Desktop: smoother, more elaborate transitions
      const translateY = isMobile ? '4px' : '8px'
      const delay = isMobile ? 0 : 50
      const easing = isMobile 
        ? 'cubic-bezier(0.4, 0, 0.2, 1)' // Faster easing for mobile
        : 'cubic-bezier(0.16, 1, 0.3, 1)' // Smoother easing for desktop

      // Immediate hide for instant feedback
      if (containerRef.current) {
        containerRef.current.style.opacity = '0'
        containerRef.current.style.transform = `translateY(${translateY})`
        containerRef.current.style.pointerEvents = 'none'
      }
      
      // Smooth fade transition after a brief delay
      const timeoutId = setTimeout(() => {
        startTransition(() => {
          if (containerRef.current) {
            // Use requestAnimationFrame for smoother animation
            requestAnimationFrame(() => {
              if (containerRef.current) {
                containerRef.current.style.transition = `opacity ${transitionDuration}ms ${easing}, transform ${transitionDuration}ms ${easing}`
                containerRef.current.style.opacity = '1'
                containerRef.current.style.transform = 'translateY(0)'
                containerRef.current.style.pointerEvents = 'auto'
              }
            })
          }
        })
      }, delay)
      
      prevPathnameRef.current = pathname
      
      return () => clearTimeout(timeoutId)
    }
  }, [pathname, startTransition, isMobile, transitionDuration, shouldReduceMotion])

  // Reset transition on mount
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.opacity = '1'
      containerRef.current.style.transform = 'translateY(0)'
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={cn(
        'will-change-[opacity,transform]',
        isPending && !shouldReduceMotion && 'opacity-50',
        // Add touch-specific optimizations
        isTouch && 'touch-manipulation'
      )}
    >
      {children}
    </div>
  )
}
