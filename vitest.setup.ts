import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

// Mock IndexedDB for offline-queue tests
const indexedDB = {
  open: vi.fn(),
  deleteDatabase: vi.fn(),
}

Object.defineProperty(global, 'indexedDB', {
  value: indexedDB,
  writable: true,
})

// Mock window.navigator.onLine
Object.defineProperty(global.navigator, 'onLine', {
  value: true,
  writable: true,
})

// Mock window event listeners
const originalAddEventListener = window.addEventListener
const originalRemoveEventListener = window.removeEventListener

window.addEventListener = vi.fn((event, handler, options) => {
  originalAddEventListener.call(window, event, handler, options)
})

window.removeEventListener = vi.fn((event, handler, options) => {
  originalRemoveEventListener.call(window, event, handler, options)
})
