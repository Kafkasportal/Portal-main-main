import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Render.com Webhook Handler
 *
 * Render webhook'larını dinler ve deployment event'lerini işler.
 * Webhook URL: https://your-domain.com/api/webhooks/render
 *
 * Render Dashboard'dan webhook oluştururken:
 * - URL: https://your-domain.com/api/webhooks/render
 * - Secret: RENDER_WEBHOOK_SECRET environment variable'ından alınır
 */

// Webhook secret'ı environment variable'dan al
const WEBHOOK_SECRET = process.env.RENDER_WEBHOOK_SECRET

// Render webhook event tipleri
type RenderEventType =
  | 'autoscaling.config.changed'
  | 'autoscaling.ended'
  | 'autoscaling.started'
  | 'branch.deleted'
  | 'build.ended'
  | 'build.started'
  | 'deploy.activated'
  | 'deploy.canceled'
  | 'deploy.created'
  | 'deploy.failed'
  | 'deploy.live'
  | 'deploy.updated'
  | 'service.created'
  | 'service.deleted'
  | 'service.updated'
  | 'suspend.activated'
  | 'suspend.deactivated'

interface RenderWebhookPayload {
  event: RenderEventType
  service: {
    id: string
    name: string
    type: string
    ownerId: string
    repo: string
    branch: string
    createdAt: string
    updatedAt: string
  }
  deploy?: {
    id: string
    commit: {
      id: string
      message: string
      createdAt: string
    }
    status: string
    createdAt: string
    finishedAt?: string
  }
  build?: {
    id: string
    status: string
    createdAt: string
    finishedAt?: string
  }
  timestamp: string
}

/**
 * Webhook signature doğrulama
 * Render.com webhook'ları signature göndermez,
 * bu yüzden secret ile basit bir doğrulama yapılabilir
 */
function verifyWebhook(payload: string, signature: string | null): boolean {
  if (!WEBHOOK_SECRET) {
    // Secret yoksa, development'ta tüm istekleri kabul et
    if (process.env.NODE_ENV === 'development') {
      return true
    }
    return false
  }

  if (!signature) {
    return false
  }

  // Render.com signature format'ı: sha256=<hash>
  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex')

  return (
    signature === expectedSignature ||
    signature === `sha256=${expectedSignature}`
  )
}

/**
 * Webhook event'lerini işle
 */
async function handleWebhookEvent(payload: RenderWebhookPayload) {
  const { event, service, deploy, build } = payload

  // Log event (production'da bir logging servisine gönderilebilir)
  console.log(`[Render Webhook] Event: ${event}`, {
    service: service.name,
    deploy: deploy?.id,
    build: build?.id,
  })

  // Event tipine göre işlem yap
  switch (event) {
    case 'deploy.activated':
    case 'deploy.live':
      // Deployment başarılı olduğunda yapılacak işlemler
      // Örn: Bildirim gönder, cache temizle, vb.
      await handleDeploymentSuccess(service, deploy)
      break

    case 'deploy.failed':
      // Deployment başarısız olduğunda yapılacak işlemler
      // Örn: Hata bildirimi gönder
      await handleDeploymentFailure(service, deploy)
      break

    case 'build.ended':
      // Build tamamlandığında yapılacak işlemler
      await handleBuildEnd(service, build)
      break

    default:
      // Diğer event'ler için varsayılan işlem
      console.log(`[Render Webhook] Unhandled event: ${event}`)
  }
}

/**
 * Başarılı deployment işlemleri
 */
async function handleDeploymentSuccess(
  service: RenderWebhookPayload['service'],
  deploy?: RenderWebhookPayload['deploy']
) {
  // Örnek işlemler:
  // - Slack/Discord bildirimi
  // - Cache temizleme
  // - Health check
  // - Analytics event gönderme

  console.log(`✅ Deployment successful: ${service.name}`, {
    deployId: deploy?.id,
    commit: deploy?.commit.id,
  })

  // Burada gerçek işlemler yapılabilir
  // Örn: Supabase'de deployment log kaydetme
}

/**
 * Başarısız deployment işlemleri
 */
async function handleDeploymentFailure(
  service: RenderWebhookPayload['service'],
  deploy?: RenderWebhookPayload['deploy']
) {
  console.error(`❌ Deployment failed: ${service.name}`, {
    deployId: deploy?.id,
    commit: deploy?.commit.id,
  })

  // Hata bildirimi gönder
  // Örn: Email, Slack, Sentry
}

/**
 * Build tamamlandığında yapılacak işlemler
 */
async function handleBuildEnd(
  service: RenderWebhookPayload['service'],
  build?: RenderWebhookPayload['build']
) {
  console.log(`🔨 Build ended: ${service.name}`, {
    buildId: build?.id,
    status: build?.status,
  })
}

/**
 * POST /api/webhooks/render
 * Render.com webhook endpoint'i
 */
export async function POST(request: NextRequest) {
  try {
    // Request body'yi al
    const body = await request.text()
    const signature =
      request.headers.get('x-render-signature') ||
      request.headers.get('x-signature') ||
      request.headers.get('signature')

    // Webhook doğrulama (opsiyonel - Render.com signature göndermeyebilir)
    if (WEBHOOK_SECRET && signature) {
      const isValid = verifyWebhook(body, signature)
      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        )
      }
    }

    // JSON parse
    let payload: RenderWebhookPayload
    try {
      payload = JSON.parse(body)
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      )
    }

    // Event'i işle
    await handleWebhookEvent(payload)

    // Başarılı yanıt
    return NextResponse.json(
      {
        success: true,
        event: payload.event,
        message: 'Webhook processed successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[Render Webhook] Error:', error)

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/webhooks/render
 * Webhook endpoint'inin çalıştığını doğrulamak için
 */
export async function GET() {
  return NextResponse.json({
    message: 'Render webhook endpoint is active',
    timestamp: new Date().toISOString(),
  })
}
