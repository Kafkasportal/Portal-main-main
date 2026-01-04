'use client'

import { useReportWebVitals } from 'next/web-vitals'

/**
 * Web Vitals Reporter
 *
 * Core Web Vitals'ı console'da raporlar (development)
 * Production'da analytics servisi ile entegre edilebilir
 *
 * Metrics:
 * - CLS: Cumulative Layout Shift
 * - FID: First Input Delay
 * - FCP: First Contentful Paint
 * - LCP: Largest Contentful Paint
 * - TTFB: Time to First Byte
 * - INP: Interaction to Next Paint
 */
export function WebVitals() {
  useReportWebVitals((metric) => {
    // Development'da console'a log
    if (process.env.NODE_ENV === 'development') {
      const value = Math.round(
        metric.name === 'CLS' ? metric.value * 1000 : metric.value
      )
      console.log(
        `[Web Vital] ${metric.name}: ${value}${metric.name === 'CLS' ? '' : 'ms'}`
      )
    }

    // Production'da analytics'e gönder
    if (process.env.NODE_ENV === 'production') {
      // Google Analytics örneği
      if (
        typeof window !== 'undefined' &&
        (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag
      ) {
        ;(window as unknown as { gtag: (...args: unknown[]) => void }).gtag(
          'event',
          metric.name,
          {
            value: Math.round(
              metric.name === 'CLS' ? metric.value * 1000 : metric.value
            ),
            event_category: 'Web Vitals',
            event_label: metric.id,
            non_interaction: true,
          }
        )
      }

      // Send to custom analytics endpoint
      fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: metric.name,
          value: metric.value,
          id: metric.id,
          rating: metric.rating,
          navigationType: metric.navigationType,
        }),
      }).catch((error) => {
        console.error('[Web Vitals] Failed to send to analytics:', error)
      })
    }
  })

  return null
}
