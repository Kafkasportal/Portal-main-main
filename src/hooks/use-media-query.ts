import { useState, useEffect } from 'react'

const breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536
}

type Breakpoint = keyof typeof breakpoints

/**
 * Check if viewport matches a media query
 */
export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(false)

    useEffect(() => {
        const media = window.matchMedia(query)

        if (media.matches !== matches) {
            setMatches(media.matches)
        }

        const listener = () => setMatches(media.matches)
        media.addEventListener('change', listener)

        return () => media.removeEventListener('change', listener)
    }, [query, matches])

    return matches
}

/**
 * Check if viewport is mobile (< 768px)
 */
export function useIsMobile(): boolean {
    return useMediaQuery(`(max-width: ${breakpoints.md - 1}px)`)
}

/**
 * Check if viewport is at least a certain breakpoint
 */
export function useBreakpoint(breakpoint: Breakpoint): boolean {
    return useMediaQuery(`(min-width: ${breakpoints[breakpoint]}px)`)
}

/**
 * Get current breakpoint
 */
export function useCurrentBreakpoint(): Breakpoint | 'xs' {
    const isSm = useBreakpoint('sm')
    const isMd = useBreakpoint('md')
    const isLg = useBreakpoint('lg')
    const isXl = useBreakpoint('xl')
    const is2Xl = useBreakpoint('2xl')

    if (is2Xl) return '2xl'
    if (isXl) return 'xl'
    if (isLg) return 'lg'
    if (isMd) return 'md'
    if (isSm) return 'sm'
    return 'xs'
}
