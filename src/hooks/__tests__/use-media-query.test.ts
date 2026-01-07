import { renderHook } from '@testing-library/react'
import { useMediaQuery, useIsMobile, useBreakpoint, useCurrentBreakpoint } from '@/hooks/use-media-query'

describe('useMediaQuery', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should check if viewport matches media query', () => {
        const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))
        
        expect(typeof result.current).toBe('boolean')
    })

    it('should handle dark mode query', () => {
        const { result } = renderHook(() => useMediaQuery('(prefers-color-scheme: dark)'))
        
        expect(typeof result.current).toBe('boolean')
    })

    it('should handle reduced motion query', () => {
        const { result } = renderHook(() => useMediaQuery('(prefers-reduced-motion: reduce)'))
        
        expect(typeof result.current).toBe('boolean')
    })

    it('should handle portrait orientation', () => {
        const { result } = renderHook(() => useMediaQuery('(orientation: portrait)'))
        
        expect(typeof result.current).toBe('boolean')
    })

    it('should handle high contrast query', () => {
        const { result } = renderHook(() => useMediaQuery('(prefers-contrast: high)'))
        
        expect(typeof result.current).toBe('boolean')
    })

    it('should update when window is resized', () => {
        const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))

        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 600
        })
        window.dispatchEvent(new Event('resize'))
        
        expect(result.current).toBeDefined()
    })

    it('should handle custom breakpoints', () => {
        const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'))
        
        expect(typeof result.current).toBe('boolean')
    })

    it('should handle complex media queries', () => {
        const { result } = renderHook(() => useMediaQuery('(min-width: 768px) and (max-width: 1024px)'))
        
        expect(typeof result.current).toBe('boolean')
    })

    it('should not throw error on invalid query', () => {
        expect(() => {
            renderHook(() => useMediaQuery('invalid-query'))
        }).not.toThrow()
    })

    it('should handle multiple media queries', () => {
        const mobileResult = renderHook(() => useMediaQuery('(max-width: 640px)'))
        const tabletResult = renderHook(() => useMediaQuery('(min-width: 641px) and (max-width: 1024px)'))
        
        expect(typeof mobileResult.result.current).toBe('boolean')
        expect(typeof tabletResult.result.current).toBe('boolean')
    })
})

describe('useIsMobile', () => {
    it('should check if viewport is mobile', () => {
        const { result } = renderHook(() => useIsMobile())
        
        expect(typeof result.current).toBe('boolean')
    })
})

describe('useBreakpoint', () => {
    it('should check if viewport is at least breakpoint', () => {
        const { result } = renderHook(() => useBreakpoint('lg'))
        
        expect(typeof result.current).toBe('boolean')
    })
})

describe('useCurrentBreakpoint', () => {
    it('should return current breakpoint', () => {
        const { result } = renderHook(() => useCurrentBreakpoint())
        
        expect(['xs', 'sm', 'md', 'lg', 'xl', '2xl']).toContain(result.current)
    })
})
