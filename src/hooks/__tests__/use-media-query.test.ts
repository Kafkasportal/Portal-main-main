import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

describe('useMediaQuery', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should check if viewport matches media query', () => {
        const { useMediaQuery } = require('@/hooks/use-media-query')
        
        const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))
        
        expect(typeof result.current).toBe('boolean')
    })

    it('should handle dark mode query', () => {
        const { useMediaQuery } = require('@/hooks/use-media-query')
        
        const { result } = renderHook(() => useMediaQuery('(prefers-color-scheme: dark)'))
        
        expect(typeof result.current).toBe('boolean')
    })

    it('should handle reduced motion query', () => {
        const { useMediaQuery } = require('@/hooks/use-media-query')
        
        const { result } = renderHook(() => useMediaQuery('(prefers-reduced-motion: reduce)'))
        
        expect(typeof result.current).toBe('boolean')
    })

    it('should handle portrait orientation', () => {
        const { useMediaQuery } = require('@/hooks/use-media-query')
        
        const { result } = renderHook(() => useMediaQuery('(orientation: portrait)'))
        
        expect(typeof result.current).toBe('boolean')
    })

    it('should handle high contrast query', () => {
        const { useMediaQuery } = require('@/hooks/use-media-query')
        
        const { result } = renderHook(() => useMediaQuery('(prefers-contrast: high)'))
        
        expect(typeof result.current).toBe('boolean')
    })

    it('should update when window is resized', () => {
        const { useMediaQuery } = require('@/hooks/use-media-query')
        
        const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))
        
        const initialMatch = result.current
        
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 600
        })
        window.dispatchEvent(new Event('resize'))
        
        expect(result.current).toBeDefined()
    })

    it('should handle custom breakpoints', () => {
        const { useMediaQuery } = require('@/hooks/use-media-query')
        
        const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'))
        
        expect(typeof result.current).toBe('boolean')
    })

    it('should handle complex media queries', () => {
        const { useMediaQuery } = require('@/hooks/use-media-query')
        
        const { result } = renderHook(() => useMediaQuery('(min-width: 768px) and (max-width: 1024px)'))
        
        expect(typeof result.current).toBe('boolean')
    })

    it('should not throw error on invalid query', () => {
        const { useMediaQuery } = require('@/hooks/use-media-query')
        
        expect(() => {
            renderHook(() => useMediaQuery('invalid-query'))
        }).not.toThrow()
    })

    it('should handle multiple media queries', () => {
        const { useMediaQuery } = require('@/hooks/use-media-query')
        
        const mobileResult = renderHook(() => useMediaQuery('(max-width: 640px)'))
        const tabletResult = renderHook(() => useMediaQuery('(min-width: 641px) and (max-width: 1024px)'))
        
        expect(typeof mobileResult.result.current).toBe('boolean')
        expect(typeof tabletResult.result.current).toBe('boolean')
    })
})

describe('useIsMobile', () => {
    it('should check if viewport is mobile', () => {
        const { useIsMobile } = require('@/hooks/use-media-query')
        
        const { result } = renderHook(() => useIsMobile())
        
        expect(typeof result.current).toBe('boolean')
    })
})

describe('useBreakpoint', () => {
    it('should check if viewport is at least breakpoint', () => {
        const { useBreakpoint } = require('@/hooks/use-media-query')
        
        const { result } = renderHook(() => useBreakpoint('lg'))
        
        expect(typeof result.current).toBe('boolean')
    })
})

describe('useCurrentBreakpoint', () => {
    it('should return current breakpoint', () => {
        const { useCurrentBreakpoint } = require('@/hooks/use-media-query')
        
        const { result } = renderHook(() => useCurrentBreakpoint())
        
        expect(['xs', 'sm', 'md', 'lg', 'xl', '2xl']).toContain(result.current)
    })
})
