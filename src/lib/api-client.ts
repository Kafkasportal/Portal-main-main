/**
 * API Client - Gerçek API ile iletişim için hazır yapı
 *
 * Bu dosya gerçek backend API'si hazır olduğunda kullanılacak.
 * Şu an için mock-service.ts kullanılıyor.
 *
 * Geçiş yapmak için:
 * 1. .env dosyasında NEXT_PUBLIC_USE_MOCK_API=false yapın
 * 2. NEXT_PUBLIC_API_URL'i gerçek API URL'inize güncelleyin
 * 3. hooks/use-api.ts'de mock-service yerine bu modülü import edin
 */

// Environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
const API_TIMEOUT = Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 30000
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true'

// Error types
export class APIError extends Error {
    constructor(
        message: string,
        public status?: number,
        public code?: string,
        public details?: unknown
    ) {
        super(message)
        this.name = 'APIError'
    }
}

// Request timeout utility
function timeoutPromise<T>(promise: Promise<T>, ms: number): Promise<T> {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new APIError('Request timeout', 408, 'TIMEOUT'))
        }, ms)

        promise
            .then(resolve)
            .catch(reject)
            .finally(() => clearTimeout(timeoutId))
    })
}

// Get auth token from cookie
function getAuthToken(): string | null {
    if (typeof document === 'undefined') return null

    const cookieName = process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || 'auth-token'
    const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'))
    return match ? match[2] : null
}

// Base fetch wrapper with error handling
async function baseFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_URL}${endpoint}`
    const token = getAuthToken()

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    try {
        const response = await timeoutPromise(
            fetch(url, {
                ...options,
                headers,
                credentials: 'include', // Send cookies
            }),
            API_TIMEOUT
        )

        // Handle non-OK responses
        if (!response.ok) {
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`
            let errorDetails: unknown

            try {
                const errorData = await response.json()
                errorMessage = errorData.message || errorMessage
                errorDetails = errorData
            } catch {
                // JSON parse failed, use default message
            }

            throw new APIError(
                errorMessage,
                response.status,
                response.status.toString(),
                errorDetails
            )
        }

        // Handle 204 No Content
        if (response.status === 204) {
            return null as T
        }

        // Parse JSON response
        const data = await response.json()
        return data
    } catch (error) {
        if (error instanceof APIError) {
            throw error
        }

        // Network error or other fetch error
        throw new APIError(
            'Network error. Please check your connection.',
            0,
            'NETWORK_ERROR',
            error
        )
    }
}

// HTTP Methods
export const api = {
    get: <T>(endpoint: string, params?: Record<string, unknown>): Promise<T> => {
        const queryString = params
            ? '?' + new URLSearchParams(params as Record<string, string>).toString()
            : ''

        return baseFetch<T>(`${endpoint}${queryString}`, {
            method: 'GET',
        })
    },

    post: <T>(endpoint: string, body?: unknown): Promise<T> => {
        return baseFetch<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
        })
    },

    put: <T>(endpoint: string, body?: unknown): Promise<T> => {
        return baseFetch<T>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body),
        })
    },

    patch: <T>(endpoint: string, body?: unknown): Promise<T> => {
        return baseFetch<T>(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(body),
        })
    },

    delete: <T>(endpoint: string): Promise<T> => {
        return baseFetch<T>(endpoint, {
            method: 'DELETE',
        })
    },
}

// API Endpoints - Gerçek API rotaları için hazır
export const endpoints = {
    // Auth
    auth: {
        login: '/auth/login',
        logout: '/auth/logout',
        register: '/auth/register',
        me: '/auth/me',
        refresh: '/auth/refresh',
    },

    // Dashboard
    dashboard: {
        stats: '/dashboard/stats',
    },

    // Donations
    donations: {
        list: '/donations',
        detail: (id: string) => `/donations/${id}`,
        create: '/donations',
        update: (id: string) => `/donations/${id}`,
        delete: (id: string) => `/donations/${id}`,
    },

    // Kumbaras
    kumbaras: {
        list: '/kumbaras',
        detail: (id: string) => `/kumbaras/${id}`,
        byCode: (code: string) => `/kumbaras/code/${code}`,
        create: '/kumbaras',
        collect: (id: string) => `/kumbaras/${id}/collect`,
        update: (id: string) => `/kumbaras/${id}`,
    },

    // Members
    members: {
        list: '/members',
        detail: (id: string) => `/members/${id}`,
        create: '/members',
        update: (id: string) => `/members/${id}`,
        delete: (id: string) => `/members/${id}`,
    },

    // Social Aid - Applications
    applications: {
        list: '/social-aid/applications',
        detail: (id: string) => `/social-aid/applications/${id}`,
        create: '/social-aid/applications',
        update: (id: string) => `/social-aid/applications/${id}`,
        updateStatus: (id: string) => `/social-aid/applications/${id}/status`,
    },

    // Social Aid - Beneficiaries
    beneficiaries: {
        list: '/social-aid/beneficiaries',
        detail: (id: string) => `/social-aid/beneficiaries/${id}`,
        create: '/social-aid/beneficiaries',
        update: (id: string) => `/social-aid/beneficiaries/${id}`,
        delete: (id: string) => `/social-aid/beneficiaries/${id}`,
    },

    // Payments
    payments: {
        list: '/payments',
        detail: (id: string) => `/payments/${id}`,
    },
} as const

// Check if using mock API
export function isUsingMockAPI(): boolean {
    return USE_MOCK_API
}

// Export for backward compatibility
export { API_URL, API_TIMEOUT, USE_MOCK_API }
