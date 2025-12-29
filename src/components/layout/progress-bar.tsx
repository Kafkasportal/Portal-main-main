'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { useDevice, useShouldReduceMotion } from '@/hooks/use-device'

export function ProgressBar() {
  const pathname = usePathname()
  const barRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const prevPath = useRef(pathname)
  const rafRef = useRef<number>(0)
  const { isMobile } = useDevice()
  const shouldReduceMotion = useShouldReduceMotion()

  useEffect(() => {
    if (
      prevPath.current !== pathname &&
      containerRef.current &&
      barRef.current
    ) {
      // Hide progress bar if reduced motion is preferred
      if (shouldReduceMotion) {
        if (containerRef.current) {
          containerRef.current.style.opacity = '0'
        }
        prevPath.current = pathname
        return
      }

      cancelAnimationFrame(rafRef.current)
      
      // Mobile: faster, simpler progress bar
      // Desktop: smoother progress bar
      const transitionDuration = isMobile ? '0.2s' : '0.3s'
      const easing = isMobile 
        ? 'cubic-bezier(0.4, 0, 0.2, 1)' 
        : 'cubic-bezier(0.16, 1, 0.3, 1)'
      const targetWidth = isMobile ? '95%' : '90%'
      const completeDelay = isMobile ? 200 : 300
      
      // Immediate reset for new navigation
      if (barRef.current) {
        barRef.current.style.transition = 'none'
        barRef.current.style.width = '0%'
      }
      if (containerRef.current) {
        containerRef.current.style.transition = `opacity ${isMobile ? '0.05s' : '0.1s'} ease-out`
        containerRef.current.style.opacity = '1'
      }
      
      // Start progress animation
      requestAnimationFrame(() => {
        if (barRef.current) {
          barRef.current.style.transition = `width ${transitionDuration} ${easing}`
          barRef.current.style.width = targetWidth
        }
      })
      
      // Complete and fade out
      setTimeout(() => {
        if (barRef.current) {
          barRef.current.style.width = '100%'
        }
        setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.style.transition = `opacity ${isMobile ? '0.1s' : '0.15s'} ease-out`
            containerRef.current.style.opacity = '0'
          }
          setTimeout(() => {
            if (barRef.current) {
              barRef.current.style.transition = 'none'
              barRef.current.style.width = '0%'
            }
            if (containerRef.current) {
              containerRef.current.style.transition = 'none'
              containerRef.current.style.opacity = '1'
            }
          }, isMobile ? 100 : 150)
        }, isMobile ? 50 : 100)
      }, completeDelay)
      prevPath.current = pathname
    }
  }, [pathname, isMobile, shouldReduceMotion])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a')
      if (
        a?.href &&
        window.location.origin &&
        a.href.startsWith(window.location.origin)
      ) {
        const url = new URL(a.href)
        if (
          url.pathname !== pathname &&
          barRef.current &&
          containerRef.current
        ) {
          // Skip if reduced motion
          if (shouldReduceMotion) return
          
          const transitionDuration = isMobile ? '0.2s' : '0.3s'
          const easing = isMobile 
            ? 'cubic-bezier(0.4, 0, 0.2, 1)' 
            : 'cubic-bezier(0.16, 1, 0.3, 1)'
          const targetProgress = isMobile ? 92 : 88
          const stepMultiplier = isMobile ? 0.2 : 0.15
          
          containerRef.current.style.transition = `opacity ${isMobile ? '0.05s' : '0.1s'} ease-out`
          containerRef.current.style.opacity = '1'
          if (barRef.current) {
            barRef.current.style.transition = `width ${transitionDuration} ${easing}`
            barRef.current.style.width = '0%'
          }
          let w = 0
          const step = () => {
            w += (targetProgress - w) * stepMultiplier
            if (barRef.current) barRef.current.style.width = `${w}%`
            if (w < targetProgress - 2) rafRef.current = requestAnimationFrame(step)
            else {
              // Hold at target until page loads
              if (barRef.current) barRef.current.style.width = `${targetProgress}%`
            }
          }
          rafRef.current = requestAnimationFrame(step)
        }
      }
    }
    document.addEventListener('click', onClick, true)
    return () => {
      document.removeEventListener('click', onClick, true)
      cancelAnimationFrame(rafRef.current)
    }
  }, [pathname, isMobile, shouldReduceMotion])

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed top-0 right-0 left-0 z-9999 h-0.5"
      style={{ opacity: 0 }}
    >
      <div 
        ref={barRef} 
        className="bg-primary h-full shadow-lg shadow-primary/50" 
        style={{ width: '0%' }} 
      />
    </div>
  )
}
