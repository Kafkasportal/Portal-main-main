import crypto from 'crypto'

/**
 * GitHub Webhook Utilities
 *
 * Shared utilities for GitHub webhook handlers.
 */

/**
 * Verify GitHub webhook signature
 * Uses HMAC SHA-256 to validate the payload
 *
 * @param payload - Raw request body as string
 * @param signature - The x-hub-signature-256 header value
 * @param secret - The webhook secret (defaults to GITHUB_WEBHOOK_SECRET env var)
 * @returns True if signature is valid
 */
export function verifyGitHubSignature(
  payload: string,
  signature: string | null,
  secret?: string
): boolean {
  const webhookSecret = secret ?? process.env.GITHUB_WEBHOOK_SECRET

  if (!webhookSecret) {
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
    .createHmac('sha256', webhookSecret)
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
 * GitHub Label interface
 */
export interface GitHubLabel {
  id: number
  name: string
  color: string
  description?: string
}

/**
 * Priority levels for issue tracking
 */
export type IssuePriority = 'critical' | 'high' | 'medium' | 'low'

/**
 * Smart Priority Detection from GitHub Labels
 *
 * Priority is automatically determined from GitHub labels:
 * - Critical: Labels containing "critical" or "urgent"
 * - High: Labels containing "high" or "bug"
 * - Medium: Default for all other issues
 * - Low: Labels containing "low" or "minor"
 *
 * @param labels - Array of GitHub labels
 * @returns The detected priority level
 */
export function detectPriorityFromLabels(labels: GitHubLabel[]): IssuePriority {
  const labelNames = labels.map((l) => l.name.toLowerCase())

  // Check for critical priority
  if (
    labelNames.some(
      (name) => name.includes('critical') || name.includes('urgent')
    )
  ) {
    return 'critical'
  }

  // Check for high priority
  if (labelNames.some((name) => name.includes('high') || name.includes('bug'))) {
    return 'high'
  }

  // Check for low priority
  if (
    labelNames.some((name) => name.includes('low') || name.includes('minor'))
  ) {
    return 'low'
  }

  // Default to medium priority
  return 'medium'
}

/**
 * Get emoji for priority level
 */
export function getPriorityEmoji(priority: IssuePriority): string {
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
