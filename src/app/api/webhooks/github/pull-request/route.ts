import { NextRequest, NextResponse } from 'next/server'
import { verifyGitHubSignature } from '@/lib/github-webhook-utils'

/**
 * GitHub Pull Request Webhook Handler
 *
 * Listens to GitHub webhook events for Pull Requests.
 * Webhook URL: https://your-domain.com/api/webhooks/github/pull-request
 *
 * GitHub Repository Settings:
 * - URL: https://your-domain.com/api/webhooks/github/pull-request
 * - Content type: application/json
 * - Secret: GITHUB_WEBHOOK_SECRET from environment variables
 * - Events: Select "Pull requests"
 */

// GitHub PR event action types
type GitHubPRAction =
  | 'opened'
  | 'closed'
  | 'reopened'
  | 'edited'
  | 'assigned'
  | 'unassigned'
  | 'review_requested'
  | 'review_request_removed'
  | 'labeled'
  | 'unlabeled'
  | 'synchronize'
  | 'ready_for_review'
  | 'converted_to_draft'
  | 'locked'
  | 'unlocked'

// Simplified payload for activity tracking
export interface GitHubPRWebhookPayload {
  title: string
  number: number
  html_url: string
  user_login: string
  repo_full_name: string
  action: 'opened' | 'closed' | 'merged'
}

// Full GitHub webhook payload structure
interface GitHubPullRequestEvent {
  action: GitHubPRAction
  number: number
  pull_request: {
    id: number
    number: number
    title: string
    html_url: string
    state: 'open' | 'closed'
    merged: boolean
    merged_at: string | null
    user: {
      login: string
      id: number
    }
    head: {
      ref: string
      sha: string
    }
    base: {
      ref: string
      sha: string
    }
    created_at: string
    updated_at: string
    closed_at: string | null
  }
  repository: {
    id: number
    full_name: string
    name: string
    owner: {
      login: string
    }
  }
  sender: {
    login: string
    id: number
  }
}

/**
 * Determine the PR action for activity tracking
 */
function determinePRAction(
  event: GitHubPullRequestEvent
): 'opened' | 'closed' | 'merged' | null {
  if (event.action === 'opened') {
    return 'opened'
  }

  if (event.action === 'closed') {
    // Check if the PR was merged or just closed
    return event.pull_request.merged ? 'merged' : 'closed'
  }

  // Only track opened, closed, and merged actions for activity
  return null
}

/**
 * Transform GitHub payload to simplified format
 */
function transformPayload(
  event: GitHubPullRequestEvent
): GitHubPRWebhookPayload | null {
  const action = determinePRAction(event)

  if (!action) {
    return null
  }

  return {
    title: event.pull_request.title,
    number: event.pull_request.number,
    html_url: event.pull_request.html_url,
    user_login: event.pull_request.user.login,
    repo_full_name: event.repository.full_name,
    action,
  }
}

/**
 * Handle webhook event processing
 */
async function handleWebhookEvent(payload: GitHubPRWebhookPayload) {
  // Log event (development only)
  if (process.env.NODE_ENV === 'development') {
    console.log(`[GitHub PR Webhook] Event: ${payload.action}`, {
      title: payload.title,
      number: payload.number,
      repo: payload.repo_full_name,
      user: payload.user_login,
    })
  }

  // Process based on action type
  switch (payload.action) {
    case 'opened':
      await handlePROpened(payload)
      break

    case 'merged':
      await handlePRMerged(payload)
      break

    case 'closed':
      await handlePRClosed(payload)
      break
  }
}

/**
 * Handle new PR opened
 */
async function handlePROpened(payload: GitHubPRWebhookPayload) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🆕 New PR opened: #${payload.number} - ${payload.title}`)
  }

  // Future: Create task in Activity Tracker
  // Future: Send notification
  // Future: Update dashboard
}

/**
 * Handle PR merged
 */
async function handlePRMerged(payload: GitHubPRWebhookPayload) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`✅ PR merged: #${payload.number} - ${payload.title}`)
  }

  // Future: Update task status in Activity Tracker
  // Future: Trigger deployment tracking
  // Future: Update dashboard
}

/**
 * Handle PR closed without merging
 */
async function handlePRClosed(payload: GitHubPRWebhookPayload) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`❌ PR closed: #${payload.number} - ${payload.title}`)
  }

  // Future: Update task status in Activity Tracker
  // Future: Send notification
  // Future: Update dashboard
}

/**
 * POST /api/webhooks/github/pull-request
 * GitHub Pull Request webhook endpoint
 */
export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await request.text()
    const signature = request.headers.get('x-hub-signature-256')

    // Verify webhook signature
    if (!verifyGitHubSignature(body, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Verify this is a pull_request event
    const eventType = request.headers.get('x-github-event')
    if (eventType !== 'pull_request') {
      return NextResponse.json(
        {
          success: true,
          message: `Event type '${eventType}' ignored. Only 'pull_request' events are processed.`,
        },
        { status: 200 }
      )
    }

    // Parse JSON payload
    let event: GitHubPullRequestEvent
    try {
      event = JSON.parse(body)
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      )
    }

    // Transform to simplified payload
    const payload = transformPayload(event)

    if (!payload) {
      // Action not tracked (e.g., labeled, assigned, etc.)
      return NextResponse.json(
        {
          success: true,
          message: `PR action '${event.action}' not tracked for activity`,
        },
        { status: 200 }
      )
    }

    // Process the webhook event
    await handleWebhookEvent(payload)

    // Success response
    return NextResponse.json(
      {
        success: true,
        action: payload.action,
        pr_number: payload.number,
        message: 'Webhook processed successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[GitHub PR Webhook] Error:', error)

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
 * GET /api/webhooks/github/pull-request
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    message: 'GitHub Pull Request webhook endpoint is active',
    timestamp: new Date().toISOString(),
    supported_actions: ['opened', 'closed', 'merged'],
  })
}
