import { render, screen } from '@testing-library/react'
import { Breadcrumbs } from '../breadcrumbs'

jest.mock('next/navigation', () => ({
    usePathname: jest.fn(),
}))

describe('Breadcrumbs', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should not render on home page', () => {
        const { usePathname } = require('next/navigation')
        jest.mocked(usePathname).mockReturnValue('/')
        
        const { container } = render(<Breadcrumbs />)
        expect(container.firstChild).toBeNull()
    })

    it('should not render on dashboard page', () => {
        const { usePathname } = require('next/navigation')
        jest.mocked(usePathname).mockReturnValue('/genel')
        
        const { container } = render(<Breadcrumbs />)
        expect(container.firstChild).toBeNull()
    })

    it('should render breadcrumbs for nested routes', () => {
        const { usePathname } = require('next/navigation')
        jest.mocked(usePathname).mockReturnValue('/bagis/liste')
        
        render(<Breadcrumbs />)

        expect(screen.getByText(/Ana Sayfa/i)).toBeInTheDocument()
        expect(screen.getByText(/Bağışlar/i)).toBeInTheDocument()
        expect(screen.getByText(/Liste/i)).toBeInTheDocument()
    })

    it('should translate route segments to Turkish', () => {
        const { usePathname } = require('next/navigation')
        jest.mocked(usePathname).mockReturnValue('/uyeler')
        
        render(<Breadcrumbs />)

        expect(screen.getByText(/Üyeler/i)).toBeInTheDocument()
    })

    it('should handle UUID segments in route', () => {
        const { usePathname } = require('next/navigation')
        jest.mocked(usePathname).mockReturnValue('/uyeler/123e4567-e89b-12d3-a456-426614174000')
        
        render(<Breadcrumbs />)

        expect(screen.getByText(/Üyeler/i)).toBeInTheDocument()
        expect(screen.getByText(/Detayı/i)).toBeInTheDocument()
    })

    it('should handle numeric ID segments in route', () => {
        const { usePathname } = require('next/navigation')
        jest.mocked(usePathname).mockReturnValue('/bagis/123')
        
        render(<Breadcrumbs />)

        expect(screen.getByText(/Bağışlar/i)).toBeInTheDocument()
        expect(screen.getByText(/Detayı/i)).toBeInTheDocument()
    })

    it('should show correct number of breadcrumbs', () => {
        const { usePathname } = require('next/navigation')
        jest.mocked(usePathname).mockReturnValue('/sosyal-yardim/basvurular')
        
        render(<Breadcrumbs />)

        const separators = screen.getAllByRole('separator')
        expect(separators.length).toBe(2)
    })

    it('should link to parent routes', () => {
        const { usePathname } = require('next/navigation')
        jest.mocked(usePathname).mockReturnValue('/uyeler/yeni')
        
        render(<Breadcrumbs />)

        const uyelerLink = screen.getByText(/Üyeler/i)
        expect(uyersLink.closest('a')).toHaveAttribute('href', '/uyeler')
    })

    it('should not link to current page', () => {
        const { usePathname } = require('next/navigation')
        jest.mocked(usePathname).mockReturnValue('/uyeler/yeni')
        
        render(<Breadcrumbs />)

        const yeniText = screen.getByText(/Yeni Ekle/i)
        expect(yeniText.closest('a')).toBeNull()
    })

    it('should capitalize first letter for unknown routes', () => {
        const { usePathname } = require('next/navigation')
        jest.mocked(usePathname).mockReturnValue('/unknown-route')
        
        render(<Breadcrumbs />)

        expect(screen.getByText(/Unknown-route/i)).toBeInTheDocument()
    })
})
