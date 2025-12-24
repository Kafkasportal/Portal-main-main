'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

export function ProgressBar() {
  const pathname = usePathname()
  const barRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const prevPath = useRef(pathname)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (
      prevPath.current !== pathname &&
      containerRef.current &&
      barRef.current
    ) {
      cancelAnimationFrame(rafRef.current)
      barRef.current.style.width = '100%'
      setTimeout(() => {
        if (containerRef.current) containerRef.current.style.opacity = '0'
        setTimeout(() => {
          if (barRef.current) barRef.current.style.width = '0%'
          if (containerRef.current) containerRef.current.style.opacity = '1'
        }, 80)
      }, 80)
      prevPath.current = pathname
    }
  }, [pathname])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a')
      if (a?.href.startsWith(location.origin)) {
        const url = new URL(a.href)
        if (
          url.pathname !== pathname &&
          barRef.current &&
          containerRef.current
        ) {
          containerRef.current.style.opacity = '1'
          barRef.current.style.width = '0%'
          let w = 0
          const step = () => {
            w += (88 - w) * 0.18
            if (barRef.current) barRef.current.style.width = `${w}%`
            if (w < 85) rafRef.current = requestAnimationFrame(step)
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
  }, [pathname])

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed top-0 right-0 left-0 z-9999 h-0.5"
      style={{ opacity: 0 }}
    >
      <div ref={barRef} className="bg-primary h-full" style={{ width: '0%' }} />
    </div>
  )
}
