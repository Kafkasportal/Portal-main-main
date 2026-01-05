import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST, GET } from '../route'
import { NextRequest } from 'next/server'
import * as utils from '@/lib/github-webhook-utils'

vi.mock('@/lib/github-webhook-utils', () => ({
    verifyGitHubSignature: vi.fn(),
    detectPriorityFromLabels: vi.fn(),
    getPriorityEmoji: vi.fn()
}))

describe('GitHub Issues Webhook Route', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(utils.verifyGitHubSignature).mockReturnValue(true)
        vi.mocked(utils.detectPriorityFromLabels).mockReturnValue('medium')
        vi.mocked(utils.getPriorityEmoji).mockReturnValue('🟡')
    })

    describe('GET', () => {
        it('should return health check info', async () => {
            const response = await GET()
            const data = await response.json()
            expect(response.status).toBe(200)
            expect(data.message).toContain('active')
        })
    })

    describe('POST', () => {
        const createRequest = (body: any, headers: Record<string, string> = {}) => {
            return new NextRequest('http://localhost/api/webhooks/github/issues', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'x-hub-signature-256': 'sha256=test',
                    'x-github-event': 'issues',
                    ...headers
                },
                body: JSON.stringify(body)
            })
        }

        it('should return 401 if signature is invalid', async () => {
            vi.mocked(utils.verifyGitHubSignature).mockReturnValue(false)
            const req = createRequest({ action: 'opened' })
            const response = await POST(req)
            expect(response.status).toBe(401)
        })

        it('should ignore non-issues events', async () => {
            const req = createRequest({}, { 'x-github-event': 'push' })
            const response = await POST(req)
            const data = await response.json()
            expect(response.status).toBe(200)
            expect(data.message).toContain('ignored')
        })

        it('should process "opened" action correctly', async () => {
            const payload = {
                action: 'opened',
                issue: {
                    id: 1,
                    number: 42,
                    title: 'Test Issue',
                    html_url: 'http://test.com',
                    user: { login: 'tester' },
                    labels: []
                },
                repository: { full_name: 'test/repo' }
            }
            const req = createRequest(payload)
            const response = await POST(req)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.action).toBe('opened')
            expect(data.issue_number).toBe(42)
            expect(utils.detectPriorityFromLabels).toHaveBeenCalled()
        })

        it('should process "closed" action correctly', async () => {
            const payload = {
                action: 'closed',
                issue: {
                    id: 1,
                    number: 42,
                    title: 'Test Issue',
                    html_url: 'http://test.com',
                    user: { login: 'tester' },
                    labels: []
                },
                repository: { full_name: 'test/repo' }
            }
            const req = createRequest(payload)
            const response = await POST(req)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.action).toBe('closed')
        })

        it('should return 200 for untracked actions', async () => {
            const payload = { action: 'labeled', issue: {}, repository: {} }
            const req = createRequest(payload)
            const response = await POST(req)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.message).toContain('not tracked')
        })

        it('should return 400 for invalid JSON', async () => {
            const req = new NextRequest('http://localhost', {
                method: 'POST',
                headers: { 'x-hub-signature-256': 'sha256=test', 'x-github-event': 'issues' },
                body: 'invalid json'
            })
            const response = await POST(req)
            expect(response.status).toBe(400)
        })
    })
})
