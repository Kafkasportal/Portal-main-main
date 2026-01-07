import { render } from '@testing-library/react'
import { ProgressBar } from '../progress-bar'

jest.mock('next/navigation', () => ({
    usePathname: jest.fn(),
}))

jest.mock('@/hooks/use-media-query', () => ({
    useIsMobile: jest.fn(() => false),
    useShouldReduceMotion: jest.fn(() => false),
}))

describe('ProgressBar', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render progress bar container', () => {
        const { usePathname } = require('next/navigation')
        jest.mocked(usePathname).mockReturnValue('/genel')
        
        const { container } = render(<ProgressBar />)
        expect(container.firstChild).toBeInTheDocument()
    })

    it('should render progress bar element', () => {
        const { usePathname } = require('next/navigation')
        jest.mocked(usePathname).mockReturnValue('/genel')
        
        const { container } = render(<ProgressBar />)
        expect(container.querySelector('.bg-primary')).toBeInTheDocument()
    })

  it('should have correct initial styles', () => {
    const { usePathname } = require('next/navigation')
    jest.mocked(usePathname).mockReturnValue('/genel')
    
    const { container } = render(<ProgressBar />)
    const bar = container.querySelector('.bg-primary') as HTMLElement
    
    expect(bar).toBeInTheDocument()
    expect(bar.className).toContain('bg-primary')
  })

    it('should be positioned at top', () => {
        const { usePathname } = require('next/navigation')
        jest.mocked(usePathname).mockReturnValue('/genel')
        
        const { container } = render(<ProgressBar />)
        const progressBarContainer = container.firstChild as HTMLElement
        expect(progressBarContainer.classList.contains('top-0')).toBe(true)
    })

    it('should have high z-index', () => {
        const { usePathname } = require('next/navigation')
        jest.mocked(usePathname).mockReturnValue('/genel')
        
        const { container } = render(<ProgressBar />)
        const progressBarContainer = container.firstChild as HTMLElement
        expect(progressBarContainer.className).toContain('z-9999')
    })

    it('should be pointer events none', () => {
        const { usePathname } = require('next/navigation')
        jest.mocked(usePathname).mockReturnValue('/genel')
        
        const { container } = render(<ProgressBar />)
        const progressBarContainer = container.firstChild as HTMLElement
        expect(progressBarContainer.className).toContain('pointer-events-none')
    })
})
