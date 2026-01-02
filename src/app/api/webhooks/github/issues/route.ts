import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GitHub Issues Webhook Handler
 *
 * Listens to GitHub webhook events for Issues.
 * Webhook URL: https://your-domain.com/api/webhooks/github/issues
 *
 * GitHub Repository Settings:
 * - URL: https://your-domain.com/api/webhooks/github/issues
 * - Content type: application/json
 * - Secret: GITHUB_WEBHOOK_SECRET from environment variables
 * - Events: Select "Issues"
 */

// Webhook secret from environment variable
const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET

// Priority levels for issue tracking
export type IssuePriority = 'critical' | 'high' | 'medium' | 'low'

// GitHub Issue event action types
type GitHubIssueAction =
  | 'opened'
  | 'edited'
  | 'deleted'
  | 'pinned'
  | 'unpinned'
  | 'closed'
  | 'reopened'
  | 'assigned'
  | 'unassigned'
  | 'labeled'
  | 'unlabeled'
  | 'locked'
  | 'unlocked'
  | 'transferred'
  | 'milestoned'
  | 'demilestoned'

// Simplified payload for activity tracking
export interface GitHubIssueWebhookPayload {
  title: string
  number: number
  html_url: string
  user_login: string
  repo_full_name: string
  action: 'opened' | 'closed'
  labels?: string
  priority: IssuePriority
}

// GitHub label structure
interface GitHubLabel {
  id: number
  name: string
  color: string
  description?: string
}

// Full GitHub webhook payload structure
interface GitHubIssueEvent {
  action: GitHubIssueAction
  issue: {
    id: number
    number: number
    title: string
    html_url: string
    state: 'open' | 'closed'
    user: {
      login: string
      id: number
    }
    labels: GitHubLabel[]
    body?: string
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
 * Verify GitHub webhook signature
 * Uses HMAC SHA-256 to validate the payload
 */
function verifyGitHubSignature(
  payload: string,
  signature: string | null
): boolean {
  if (!WEBHOOK_SECRET) {
    // In development, accept all requests if no secret is configured
    if (process.env.NODE_ENV === 'development') {
      return true
    }
    return false
  }

  if (!signature) {
    return false
  }

  // GitHub signature format: sha256=<hash>
  const expectedSignature = `sha256=${crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex')}`

  // Use timing-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  } catch {
    return false
  }
}

/**
 * Smart Priority Detection from GitHub Labels
 *
 * Priority is automatically determined from GitHub labels:
 * - Critical: Labels containing "critical" or "urgent"
 * - High: Labels containing "high" or "bug"
 * - Medium: Default for all other issues
 * - Low: Labels containing "low" or "minor"
 */
export function detectPriorityFromLabels(labels: GitHubLabel[]): IssuePriority {
  const labelNames = labels.map((l) => l.name.toLowerCase())

  // Check for critical priority
  if (
    labelNames.some((name) => name.includes('critical') || name.includes('urgent'))
  ) {
    return 'critical'
  }

  // Check for high priority
  if (labelNames.some((name) => name.includes('high') || name.includes('bug'))) {
    return 'high'
  }

  // Check for low priority
  if (labelNames.some((name) => name.includes('low') || name.includes('minor'))) {
    return 'low'
  }

  // Default to medium priority
  return 'medium'
}

/**
 * Format labels as comma-separated string
 */
function formatLabels(labels: GitHubLabel[]): string | undefined {
  if (labels.length === 0) {
    return undefined
  }
  return labels.map((l) => l.name).join(', ')
}

/**
 * Determine the Issue action for activity tracking
 */
function determineIssueAction(
  event: GitHubIssueEvent
): 'opened' | 'closed' | null {
  if (event.action === 'opened') {
    return 'opened'
  }

  if (event.action === 'closed') {
    return 'closed'
  }

  // Only track opened and closed actions for activity
  return null
}

/**
 * Transform GitHub payload to simplified format
 */
function transformPayload(
  event: GitHubIssueEvent
): GitHubIssueWebhookPayload | null {
  const action = determineIssueAction(event)

  if (!action) {
    return null
  }

  const priority = detectPriorityFromLabels(event.issue.labels)
  const labels = formatLabels(event.issue.labels)

  return {
    title: event.issue.title,
    number: event.issue.number,
    html_url: event.issue.html_url,
    user_login: event.issue.user.login,
    repo_full_name: event.repository.full_name,
    action,
    labels,
    priority,
  }
}

/**
 * Handle webhook event processing
 */
async function handleWebhookEvent(payload: GitHubIssueWebhookPayload) {
  // Log event (development only)
  if (process.env.NODE_ENV === 'development') {
    console.log(`[GitHub Issues Webhook] Event: ${payload.action}`, {
      title: payload.title,
      number: payload.number,
      repo: payload.repo_full_name,
      user: payload.user_login,
      priority: payload.priority,
      labels: payload.labels,
    })
  }

  // Process based on action type
  switch (payload.action) {
    case 'opened':
      await handleIssueOpened(payload)
      break

    case 'closed':
      await handleIssueClosed(payload)
      break
  }
}

/**
 * Handle new Issue opened
 */
async function handleIssueOpened(payload: GitHubIssueWebhookPayload) {
  const priorityEmoji = getPriorityEmoji(payload.priority)

  if (process.env.NODE_ENV === 'development') {
    console.log(
      `${priorityEmoji} New issue opened: #${payload.number} - ${payload.title} [${payload.priority}]`
    )
  }

  // Future: Create task in Activity Tracker with priority
  // Future: Send notification (critical/high priority alerts)
  // Future: Update dashboard
}

/**
 * Handle Issue closed
 */
async function handleIssueClosed(payload: GitHubIssueWebhookPayload) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`✅ Issue closed: #${payload.number} - ${payload.title}`)
  }

  // Future: Update task status in Activity Tracker
  // Future: Send notification
  // Future: Update dashboard
}

/**
 * Get emoji for priority level
 */
function getPriorityEmoji(priority: IssuePriority): string {
  switch (priority) {
    case 'critical':
      return '🚨'
    case 'high':
      return '🔴'
    case 'medium':
      return '🟡'
    case 'low':
      return '🟢'
  }
}

/**
 * POST /api/webhooks/github/issues
 * GitHub Issues webhook endpoint
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

    // Verify this is an issues event
    const eventType = request.headers.get('x-github-event')
    if (eventType !== 'issues') {
      return NextResponse.json(
        {
          success: true,
          message: `Event type '${eventType}' ignored. Only 'issues' events are processed.`,
        },
        { status: 200 }
      )
    }

    // Parse JSON payload
    let event: GitHubIssueEvent
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
          message: `Issue action '${event.action}' not tracked for activity`,
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
        issue_number: payload.number,
        priority: payload.priority,
        message: 'Webhook processed successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[GitHub Issues Webhook] Error:', error)

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
 * GET /api/webhooks/github/issues
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    message: 'GitHub Issues webhook endpoint is active',
    timestamp: new Date().toISOString(),
    supported_actions: ['opened', 'closed'],
    priority_detection: {
      critical: 'Labels containing "critical" or "urgent"',
      high: 'Labels containing "high" or "bug"',
      medium: 'Default for all other issues',
      low: 'Labels containing "low" or "minor"',
    },
  })
}
