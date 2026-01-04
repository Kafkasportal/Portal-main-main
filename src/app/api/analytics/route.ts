import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

interface WebVitalMetric {
  name: string
  value: number
  id: string
  rating?: string
  navigationType?: string
}

/**
 * Custom Analytics Endpoint
 *
 * Receives and logs Web Vitals metrics
 * Can be extended to store in database or forward to analytics service
 */
export async function POST(request: NextRequest) {
  try {
    const metric: WebVitalMetric = await request.json()

    // Validate metric data
    if (!metric.name || typeof metric.value !== 'number') {
      return NextResponse.json(
        { error: 'Invalid metric data' },
        { status: 400 }
      )
    }

    // Log metric (in production, you might want to:
    // - Store in database
    // - Forward to external analytics service
    // - Aggregate and analyze trends
    console.log('[Analytics] Web Vital received:', {
      name: metric.name,
      value: metric.value,
      id: metric.id,
      rating: metric.rating,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json(
      { success: true, received: metric.name },
      { status: 200 }
    )
  } catch (error) {
    console.error('[Analytics] Error processing metric:', error)
    return NextResponse.json(
      { error: 'Failed to process metric' },
      { status: 500 }
    )
  }
}
