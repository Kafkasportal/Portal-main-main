import { renderHook, act, waitFor } from '@testing-library/react'
import { useUserStore } from '../user-store'

// Mock Supabase client
const mockSignInWithPassword = jest.fn()
const mockSignOut = jest.fn()
const mockGetSession = jest.fn()
const mockOnAuthStateChange = jest.fn()

const mockSupabaseClient = {
  auth: {
    signInWithPassword: mockSignInWithPassword,
    signOut: mockSignOut,
    getSession: mockGetSession,
    onAuthStateChange: mockOnAuthStateChange,
  },
}

jest.mock('@/lib/supabase/client', () => ({
  getSupabaseClient: jest.fn(() => mockSupabaseClient),
}))

describe('User Store', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Default mock implementations
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null,
    })

    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    })

    // Reset store state
    const { result } = renderHook(() => useUserStore())
    act(() => {
      result.current.logout()
    })
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useUserStore())

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        user_metadata: {
          name: 'Ahmet',
          soyad: 'Yılmaz',
          role: 'admin',
        },
      }

      mockSignInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: {} },
        error: null,
      })

      const { result } = renderHook(() => useUserStore())

      let loginResult
      await act(async () => {
        loginResult = await result.current.login('test@example.com', 'password123')
      })

      expect(loginResult).toBe(true)
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user).toEqual({
        id: '123',
        email: 'test@example.com',
        name: 'Ahmet',
        soyad: 'Yılmaz',
        role: 'admin',
      })
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should handle login failure with invalid credentials', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' },
      })

      const { result } = renderHook(() => useUserStore())

      let loginResult
      await act(async () => {
        loginResult = await result.current.login('test@example.com', 'wrongpassword')
      })

      expect(loginResult).toBe(false)
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBeNull()
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBe('Invalid credentials')
    })

    it('should set loading state during login', async () => {
      let resolveLogin: ((value: unknown) => void) | undefined
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve
      })

      mockSignInWithPassword.mockReturnValue(loginPromise)

      const { result } = renderHook(() => useUserStore())

      act(() => {
        result.current.login('test@example.com', 'password123')
      })

      // Check loading state is true during request
      expect(result.current.isLoading).toBe(true)

      // Resolve the promise
      await act(async () => {
        if (resolveLogin) {
          resolveLogin({
            data: { user: null, session: null },
            error: null,
          })
        }
        await loginPromise
      })

      expect(result.current.isLoading).toBe(false)
    })

    it('should handle login with missing user metadata', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        user_metadata: {},
      }

      mockSignInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: {} },
        error: null,
      })

      const { result } = renderHook(() => useUserStore())

      await act(async () => {
        await result.current.login('test@example.com', 'password123')
      })

      expect(result.current.user).toEqual({
        id: '123',
        email: 'test@example.com',
        ad: '',
        soyad: '',
        role: 'user',
      })
    })

    it('should handle network errors', async () => {
      mockSignInWithPassword.mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useUserStore())

      let loginResult
      await act(async () => {
        loginResult = await result.current.login('test@example.com', 'password123')
      })

      expect(loginResult).toBe(false)
      expect(result.current.error).toBe('Network error')
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('logout', () => {
    it('should logout successfully', async () => {
      mockSignOut.mockResolvedValue({ error: null })

      const { result } = renderHook(() => useUserStore())

      // First login
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        user_metadata: { ad: 'Ahmet', soyad: 'Yılmaz', role: 'admin' },
      }

      mockSignInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: {} },
        error: null,
      })

      await act(async () => {
        await result.current.login('test@example.com', 'password123')
      })

      expect(result.current.isAuthenticated).toBe(true)

      // Then logout
      await act(async () => {
        await result.current.logout()
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.error).toBeNull()
      expect(mockSignOut).toHaveBeenCalled()
    })

    it('should clear error state on logout', async () => {
      mockSignOut.mockResolvedValue({ error: null })

      const { result } = renderHook(() => useUserStore())

      // Set error state
      mockSignInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Login failed' },
      })

      await act(async () => {
        await result.current.login('test@example.com', 'wrong')
      })

      expect(result.current.error).toBe('Login failed')

      // Logout should clear error
      await act(async () => {
        await result.current.logout()
      })

      expect(result.current.error).toBeNull()
    })
  })

  describe('updateUser', () => {
    it('should update user data', async () => {
      const { result } = renderHook(() => useUserStore())

      // First login to have a user
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        user_metadata: { ad: 'Ahmet', soyad: 'Yılmaz', role: 'admin' },
      }

      mockSignInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: {} },
        error: null,
      })

      await act(async () => {
        await result.current.login('test@example.com', 'password123')
      })

      // Update user
      act(() => {
        result.current.updateUser({ name: 'Mehmet' })
      })

      expect(result.current.user?.name).toBe('Mehmet')
      expect(result.current.user?.email).toBe('test@example.com') // Should preserve other fields
    })

    it('should not update if user is null', () => {
      const { result } = renderHook(() => useUserStore())

      expect(result.current.user).toBeNull()

      act(() => {
        result.current.updateUser({ name: 'Test' })
      })

      expect(result.current.user).toBeNull()
    })

    it('should update multiple fields at once', async () => {
      const { result } = renderHook(() => useUserStore())

      // First login
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        user_metadata: { ad: 'Ahmet', soyad: 'Yılmaz', role: 'admin' },
      }

      mockSignInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: {} },
        error: null,
      })

      await act(async () => {
        await result.current.login('test@example.com', 'password123')
      })

      // Update multiple fields
      act(() => {
        result.current.updateUser({ 
          name: 'Mehmet', 
          email: 'mehmet@example.com'
        })
      })

      expect(result.current.user?.name).toBe('Mehmet')
      expect(result.current.user?.email).toBe('mehmet@example.com')
    })
  })

  describe('initializeAuth', () => {
    it('should initialize auth with existing session', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        user_metadata: { ad: 'Ahmet', soyad: 'Yılmaz', role: 'admin' },
      }

      mockGetSession.mockResolvedValue({
        data: {
          session: {
            user: mockUser,
          },
        },
        error: null,
      })

      const { result } = renderHook(() => useUserStore())

      act(() => {
        result.current.initializeAuth()
      })

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
      })

      expect(result.current.user).toEqual({
        id: '123',
        email: 'test@example.com',
        name: 'Ahmet',
        soyad: 'Yılmaz',
        role: 'admin',
      })
    })

    it('should not set user when no session exists', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })

      const { result } = renderHook(() => useUserStore())

      act(() => {
        result.current.initializeAuth()
      })

      await waitFor(() => {
        expect(mockGetSession).toHaveBeenCalled()
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('should setup auth state change listener', () => {
      const { result } = renderHook(() => useUserStore())

      act(() => {
        result.current.initializeAuth()
      })

      expect(mockOnAuthStateChange).toHaveBeenCalled()
    })

    it('should handle auth state changes', async () => {
      let authCallback: ((event: string, session: { user?: unknown }) => void) | undefined

      mockOnAuthStateChange.mockImplementation((callback) => {
        authCallback = callback
        return { data: { subscription: { unsubscribe: jest.fn() } } }
      })

      const { result } = renderHook(() => useUserStore())

      act(() => {
        result.current.initializeAuth()
      })

      // Simulate auth state change with new session
      const mockUser = {
        id: '456',
        email: 'new@example.com',
        user_metadata: { ad: 'New', soyad: 'User', role: 'user' },
      }

      act(() => {
        if (authCallback) {
          authCallback('SIGNED_IN', { user: mockUser })
        }
      })

      expect(result.current.user).toEqual({
        id: '456',
        email: 'new@example.com',
        name: 'New',
        soyad: 'User',
        role: 'user',
      })
      expect(result.current.isAuthenticated).toBe(true)
    })

    it('should handle auth state change to signed out', async () => {
      let authCallback: ((event: string, session: { user?: unknown }) => void) | undefined

      mockOnAuthStateChange.mockImplementation((callback) => {
        authCallback = callback
        return { data: { subscription: { unsubscribe: jest.fn() } } }
      })

      const { result } = renderHook(() => useUserStore())

      // First login
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        user_metadata: { ad: 'Ahmet', soyad: 'Yılmaz', role: 'admin' },
      }

      mockSignInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: {} },
        error: null,
      })

      await act(async () => {
        await result.current.login('test@example.com', 'password123')
      })

      act(() => {
        result.current.initializeAuth()
      })

      // Simulate sign out
      act(() => {
        if (authCallback) {
          authCallback('SIGNED_OUT', { user: null })
        }
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })
  })
})
