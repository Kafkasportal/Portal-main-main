/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Unit tests for Sentry initialization and configuration
 *
 * Tests cover:
 * - SDK initialization with valid DSN
 * - Graceful skip when DSN is missing
 * - beforeSend PII filtering
 * - Error filtering (browser extensions, ResizeObserver, etc.)
 */

import * as Sentry from '@sentry/nextjs'

// Type assertion for process.env to allow modification in tests
const env = process.env as Record<string, string | undefined>

// Mock @sentry/nextjs
jest.mock('@sentry/nextjs', () => ({
  init: jest.fn(),
  setUser: jest.fn(),
  browserTracingIntegration: jest.fn(() => ({})),
}))

// Helper to get the beforeSend function from the last Sentry.init call
function getBeforeSendFromLastInit(): ((event: Sentry.Event, hint: Sentry.EventHint) => Sentry.Event | null) | undefined {
  const mockInit = Sentry.init as jest.Mock
  const lastCall = mockInit.mock.calls[mockInit.mock.calls.length - 1]
  if (lastCall && lastCall[0]?.beforeSend) {
    return lastCall[0].beforeSend
  }
  return undefined
}

describe('Sentry Client Configuration', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  describe('initialization', () => {
    it('should initialize Sentry when DSN is provided', () => {
      env.NEXT_PUBLIC_SENTRY_DSN = 'https://test@sentry.io/123'
      env.NODE_ENV = 'test'

      // Re-import to trigger initialization
      jest.isolateModules(() => {
        require('../sentry.client.config')
      })

      expect(Sentry.init).toHaveBeenCalledTimes(1)
      expect(Sentry.init).toHaveBeenCalledWith(
        expect.objectContaining({
          dsn: 'https://test@sentry.io/123',
        })
      )
    })

    it('should NOT initialize Sentry when DSN is missing', () => {
      delete env.NEXT_PUBLIC_SENTRY_DSN
      env.NODE_ENV = 'development'

      // Spy on console.warn
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation()

      jest.isolateModules(() => {
        require('../sentry.client.config')
      })

      expect(Sentry.init).not.toHaveBeenCalled()
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('NEXT_PUBLIC_SENTRY_DSN is not set')
      )

      warnSpy.mockRestore()
    })

    it('should NOT log warning in production when DSN is missing', () => {
      delete env.NEXT_PUBLIC_SENTRY_DSN
      env.NODE_ENV = 'production'

      const warnSpy = jest.spyOn(console, 'warn').mockImplementation()

      jest.isolateModules(() => {
        require('../sentry.client.config')
      })

      expect(Sentry.init).not.toHaveBeenCalled()
      expect(warnSpy).not.toHaveBeenCalled()

      warnSpy.mockRestore()
    })

    it('should set correct environment from NODE_ENV', () => {
      env.NEXT_PUBLIC_SENTRY_DSN = 'https://test@sentry.io/123'
      env.NODE_ENV = 'production'

      jest.isolateModules(() => {
        require('../sentry.client.config')
      })

      expect(Sentry.init).toHaveBeenCalledWith(
        expect.objectContaining({
          environment: 'production',
        })
      )
    })

    it('should use lower sample rate in production', () => {
      env.NEXT_PUBLIC_SENTRY_DSN = 'https://test@sentry.io/123'
      env.NODE_ENV = 'production'

      jest.isolateModules(() => {
        require('../sentry.client.config')
      })

      expect(Sentry.init).toHaveBeenCalledWith(
        expect.objectContaining({
          tracesSampleRate: 0.1,
        })
      )
    })

    it('should use full sample rate in development', () => {
      env.NEXT_PUBLIC_SENTRY_DSN = 'https://test@sentry.io/123'
      env.NODE_ENV = 'development'

      jest.isolateModules(() => {
        require('../sentry.client.config')
      })

      expect(Sentry.init).toHaveBeenCalledWith(
        expect.objectContaining({
          tracesSampleRate: 1.0,
        })
      )
    })

    it('should disable sendDefaultPii for privacy', () => {
      env.NEXT_PUBLIC_SENTRY_DSN = 'https://test@sentry.io/123'

      jest.isolateModules(() => {
        require('../sentry.client.config')
      })

      expect(Sentry.init).toHaveBeenCalledWith(
        expect.objectContaining({
          sendDefaultPii: false,
        })
      )
    })
  })

  describe('beforeSend filtering', () => {
    beforeEach(() => {
      env.NEXT_PUBLIC_SENTRY_DSN = 'https://test@sentry.io/123'
      env.NODE_ENV = 'test'
    })

    it('should filter out browser extension errors', () => {
      jest.isolateModules(() => {
        require('../sentry.client.config')
      })

      const beforeSend = getBeforeSendFromLastInit()
      expect(beforeSend).toBeDefined()

      const extensionError = new Error('Error from chrome-extension://abc123')
      const result = beforeSend!(
        { event_id: 'test' },
        { originalException: extensionError }
      )

      expect(result).toBeNull()
    })

    it('should filter out moz-extension errors', () => {
      jest.isolateModules(() => {
        require('../sentry.client.config')
      })

      const beforeSend = getBeforeSendFromLastInit()
      const mozError = new Error('Error from moz-extension://def456')
      const result = beforeSend!(
        { event_id: 'test' },
        { originalException: mozError }
      )

      expect(result).toBeNull()
    })

    it('should filter out ResizeObserver errors', () => {
      jest.isolateModules(() => {
        require('../sentry.client.config')
      })

      const beforeSend = getBeforeSendFromLastInit()
      const resizeError = new Error('ResizeObserver loop limit exceeded')
      const result = beforeSend!(
        { event_id: 'test' },
        { originalException: resizeError }
      )

      expect(result).toBeNull()
    })

    it('should pass through normal errors', () => {
      jest.isolateModules(() => {
        require('../sentry.client.config')
      })

      const beforeSend = getBeforeSendFromLastInit()
      const normalError = new Error('Something went wrong')
      const event: Sentry.Event = { event_id: 'test', message: 'Test' }
      const result = beforeSend!(
        event,
        { originalException: normalError }
      )

      expect(result).toEqual(event)
    })

    it('should strip Authorization header from requests', () => {
      jest.isolateModules(() => {
        require('../sentry.client.config')
      })

      const beforeSend = getBeforeSendFromLastInit()
      const event: Sentry.Event = {
        event_id: 'test',
        request: {
          headers: {
            'Authorization': 'Bearer secret-token',
            'authorization': 'Bearer another-token',
            'Content-Type': 'application/json',
          },
        },
      }

      const result = beforeSend!(event, {})

      expect(result?.request?.headers).toBeDefined()
      expect(result?.request?.headers?.['Authorization']).toBeUndefined()
      expect(result?.request?.headers?.['authorization']).toBeUndefined()
      expect(result?.request?.headers?.['Content-Type']).toBe('application/json')
    })

    it('should strip Cookie header from requests', () => {
      jest.isolateModules(() => {
        require('../sentry.client.config')
      })

      const beforeSend = getBeforeSendFromLastInit()
      const event: Sentry.Event = {
        event_id: 'test',
        request: {
          headers: {
            'Cookie': 'session=abc123',
            'cookie': 'other=value',
            'Accept': 'text/html',
          },
        },
      }

      const result = beforeSend!(event, {})

      expect(result?.request?.headers?.['Cookie']).toBeUndefined()
      expect(result?.request?.headers?.['cookie']).toBeUndefined()
      expect(result?.request?.headers?.['Accept']).toBe('text/html')
    })

    it('should filter sensitive fields from request data', () => {
      jest.isolateModules(() => {
        require('../sentry.client.config')
      })

      const beforeSend = getBeforeSendFromLastInit()
      const event: Sentry.Event = {
        event_id: 'test',
        request: {
          data: {
            username: 'test@example.com',
            password: 'secret123',
            token: 'jwt-token',
            secret: 'api-secret',
            api_key: 'key-123',
            normalField: 'keep this',
          } as Record<string, unknown>,
        },
      }

      const result = beforeSend!(event, {})

      expect(result?.request?.data).toEqual({
        username: 'test@example.com',
        password: '[FILTERED]',
        token: '[FILTERED]',
        secret: '[FILTERED]',
        api_key: '[FILTERED]',
        normalField: 'keep this',
      })
    })

    it('should handle events without request data gracefully', () => {
      jest.isolateModules(() => {
        require('../sentry.client.config')
      })

      const beforeSend = getBeforeSendFromLastInit()
      const event: Sentry.Event = {
        event_id: 'test',
        message: 'Simple error message',
      }

      const result = beforeSend!(event, {})

      expect(result).toEqual(event)
    })
  })
})

describe('Sentry Server Configuration', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  describe('initialization', () => {
    it('should initialize Sentry on server when DSN is provided', () => {
      env.NEXT_PUBLIC_SENTRY_DSN = 'https://test@sentry.io/123'
      env.NODE_ENV = 'test'

      jest.isolateModules(() => {
        require('../sentry.server.config')
      })

      expect(Sentry.init).toHaveBeenCalledTimes(1)
      expect(Sentry.init).toHaveBeenCalledWith(
        expect.objectContaining({
          dsn: 'https://test@sentry.io/123',
        })
      )
    })

    it('should NOT initialize server Sentry when DSN is missing', () => {
      delete env.NEXT_PUBLIC_SENTRY_DSN
      env.NODE_ENV = 'development'

      const warnSpy = jest.spyOn(console, 'warn').mockImplementation()

      jest.isolateModules(() => {
        require('../sentry.server.config')
      })

      expect(Sentry.init).not.toHaveBeenCalled()
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Server-side error tracking is disabled')
      )

      warnSpy.mockRestore()
    })

    it('should configure appropriate sample rates for server', () => {
      env.NEXT_PUBLIC_SENTRY_DSN = 'https://test@sentry.io/123'
      env.NODE_ENV = 'production'

      jest.isolateModules(() => {
        require('../sentry.server.config')
      })

      expect(Sentry.init).toHaveBeenCalledWith(
        expect.objectContaining({
          tracesSampleRate: 0.1,
          sampleRate: 1.0,
        })
      )
    })
  })

  describe('server-specific error filtering', () => {
    beforeEach(() => {
      env.NEXT_PUBLIC_SENTRY_DSN = 'https://test@sentry.io/123'
      env.NODE_ENV = 'test'
    })

    it('should filter ECONNRESET errors', () => {
      jest.isolateModules(() => {
        require('../sentry.server.config')
      })

      const beforeSend = getBeforeSendFromLastInit()
      expect(beforeSend).toBeDefined()

      const connError = new Error('read ECONNRESET')
      const result = beforeSend!(
        { event_id: 'test' },
        { originalException: connError }
      )

      expect(result).toBeNull()
    })

    it('should filter socket hang up errors', () => {
      jest.isolateModules(() => {
        require('../sentry.server.config')
      })

      const beforeSend = getBeforeSendFromLastInit()
      const socketError = new Error('socket hang up')
      const result = beforeSend!(
        { event_id: 'test' },
        { originalException: socketError }
      )

      expect(result).toBeNull()
    })

    it('should strip additional server-sensitive headers', () => {
      jest.isolateModules(() => {
        require('../sentry.server.config')
      })

      const beforeSend = getBeforeSendFromLastInit()
      const event: Sentry.Event = {
        event_id: 'test',
        request: {
          headers: {
            'x-supabase-auth': 'supabase-token',
            'x-api-key': 'api-key-123',
            'Authorization': 'Bearer token',
            'Host': 'example.com',
          },
        },
      }

      const result = beforeSend!(event, {})

      expect(result?.request?.headers?.['x-supabase-auth']).toBeUndefined()
      expect(result?.request?.headers?.['x-api-key']).toBeUndefined()
      expect(result?.request?.headers?.['Authorization']).toBeUndefined()
      expect(result?.request?.headers?.['Host']).toBe('example.com')
    })

    it('should filter additional sensitive fields from server request data', () => {
      jest.isolateModules(() => {
        require('../sentry.server.config')
      })

      const beforeSend = getBeforeSendFromLastInit()
      const event: Sentry.Event = {
        event_id: 'test',
        request: {
          data: {
            access_token: 'access-123',
            refresh_token: 'refresh-456',
            service_role_key: 'role-key',
            apiKey: 'api-key',
            username: 'keep-this',
          } as Record<string, unknown>,
        },
      }

      const result = beforeSend!(event, {})

      expect(result?.request?.data).toEqual({
        access_token: '[FILTERED]',
        refresh_token: '[FILTERED]',
        service_role_key: '[FILTERED]',
        apiKey: '[FILTERED]',
        username: 'keep-this',
      })
    })
  })
})

describe('Sentry Edge Configuration', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('should initialize Sentry for edge runtime when DSN is provided', () => {
    env.NEXT_PUBLIC_SENTRY_DSN = 'https://test@sentry.io/123'
    env.NODE_ENV = 'test'

    jest.isolateModules(() => {
      require('../sentry.edge.config')
    })

    expect(Sentry.init).toHaveBeenCalledTimes(1)
    expect(Sentry.init).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: 'https://test@sentry.io/123',
      })
    )
  })

  it('should NOT initialize edge Sentry when DSN is missing', () => {
    delete env.NEXT_PUBLIC_SENTRY_DSN
    env.NODE_ENV = 'development'

    const warnSpy = jest.spyOn(console, 'warn').mockImplementation()

    jest.isolateModules(() => {
      require('../sentry.edge.config')
    })

    expect(Sentry.init).not.toHaveBeenCalled()
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Edge runtime error tracking is disabled')
    )

    warnSpy.mockRestore()
  })
})
