import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST, GET } from '../route'
import { NextRequest } from 'next/server'
import * as utils from '@/lib/github-webhook-utils'

vi.mock('@/lib/github-webhook-utils', () => ({
    verifyGitHubSignature: vi.fn(),
}))

describe('GitHub Pull Request Webhook Route', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(utils.verifyGitHubSignature).mockReturnValue(true)
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
            return new NextRequest('http://localhost/api/webhooks/github/pull-request', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'x-hub-signature-256': 'sha256=test',
                    'x-github-event': 'pull_request',
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

        it('should ignore non-pull_request events', async () => {
            const req = createRequest({}, { 'x-github-event': 'push' })
            const response = await POST(req)
            const data = await response.json()
            expect(response.status).toBe(200)
            expect(data.message).toContain('ignored')
        })

        it('should process "opened" action correctly', async () => {
            const payload = {
                action: 'opened',
                pull_request: {
                    number: 42,
                    title: 'Test PR',
                    html_url: 'http://test.com',
                    user: { login: 'tester' },
                    merged: false
                },
                repository: { full_name: 'test/repo' }
            }
            const req = createRequest(payload)
            const response = await POST(req)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.action).toBe('opened')
            expect(data.pr_number).toBe(42)
        })

        it('should process "merged" action (closed with merged=true)', async () => {
            const payload = {
                action: 'closed',
                pull_request: {
                    number: 42,
                    title: 'Test PR',
                    html_url: 'http://test.com',
                    user: { login: 'tester' },
                    merged: true
                },
                repository: { full_name: 'test/repo' }
            }
            const req = createRequest(payload)
            const response = await POST(req)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.action).toBe('merged')
        })

        it('should process "closed" action (closed with merged=false)', async () => {
            const payload = {
                action: 'closed',
                pull_request: {
                    number: 42,
                    title: 'Test PR',
                    user: { login: 'tester' },
                    merged: false
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
            const payload = { action: 'labeled', pull_request: {}, repository: {} }
            const req = createRequest(payload)
            const response = await POST(req)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.message).toContain('not tracked')
        })
    })
})
