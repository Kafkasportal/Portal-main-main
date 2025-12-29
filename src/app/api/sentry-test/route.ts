import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'

/**
 * GET /api/sentry-test
 * Test endpoint for verifying Sentry server-side error tracking
 * 
 * Query params:
 * - type: 'error' | 'message' | 'exception' (default: 'message')
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'message'

  switch (type) {
    case 'error':
      // This will be caught by Sentry's error boundary
      throw new Error('Test API error from sentry-test endpoint')

    case 'exception':
      // Manually capture an exception
      const testError = new Error('Manually captured API exception')
      Sentry.captureException(testError, {
        tags: {
          source: 'api-sentry-test',
          type: 'manual-exception',
        },
        extra: {
          timestamp: new Date().toISOString(),
          testInfo: 'This exception was manually captured for testing',
        },
      })
      return NextResponse.json({
        success: true,
        message: 'Exception captured and sent to Sentry',
        type: 'exception',
      })

    case 'message':
    default:
      // Send a test message to Sentry
      Sentry.captureMessage('Test API message from sentry-test endpoint', {
        level: 'info',
        tags: {
          source: 'api-sentry-test',
          type: 'test-message',
        },
        extra: {
          timestamp: new Date().toISOString(),
        },
      })
      return NextResponse.json({
        success: true,
        message: 'Test message sent to Sentry',
        type: 'message',
      })
  }
}

/**
 * POST /api/sentry-test
 * Trigger a test error with custom data
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    Sentry.captureException(new Error(body.message || 'Test POST error'), {
      tags: {
        source: 'api-sentry-test',
        method: 'POST',
      },
      extra: {
        requestBody: body,
        timestamp: new Date().toISOString(),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Error captured from POST request',
    })
  } catch (error) {
    Sentry.captureException(error)
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 400 }
    )
  }
}
