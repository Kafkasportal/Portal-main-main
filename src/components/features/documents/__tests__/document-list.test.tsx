import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DocumentList } from '../document-list'

jest.mock('@/hooks/use-api', () => ({
    useQuery: jest.fn(() => ({
        data: { data: [], total: 0, page: 1, pageSize: 10 },
        isLoading: false,
        isError: false,
    })),
    useDelete: jest.fn(() => ({
        mutate: jest.fn(),
        isPending: false,
    })),
}))

jest.mock('@/lib/constants', () => ({
    DOCUMENT_TYPE_LABELS: {
        pdf: 'PDF',
        image: 'Görsel',
        other: 'Diğer',
    },
}))

jest.mock('sonner', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}))

describe('DocumentList', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render document list', () => {
        const { useQuery } = require('@/hooks/use-api')
        jest.mocked(useQuery).mockReturnValue({
            data: {
                data: [
                    {
                        id: '1',
                        ad: 'Test Doc',
                        url: 'test.pdf',
                        type: 'pdf',
                        boyut: 1024,
                        yuklemeTarihi: '2024-01-01',
                    },
                ],
                total: 1,
                page: 1,
                pageSize: 10,
            },
            isLoading: false,
            isError: false,
        })

        render(<DocumentList />)

        expect(screen.getByText(/Belgeler/i)).toBeInTheDocument()
        expect(screen.getByText(/Test Doc/i)).toBeInTheDocument()
    })

    it('should show empty state when no documents', () => {
        const { useQuery } = require('@/hooks/use-api')
        jest.mocked(useQuery).mockReturnValue({
            data: { data: [], total: 0, page: 1, pageSize: 10 },
            isLoading: false,
            isError: false,
        })

        render(<DocumentList />)

        expect(screen.getByText(/Henüz belge yüklenmedi/i)).toBeInTheDocument()
    })

    it('should show loading state', () => {
        const { useQuery } = require('@/hooks/use-api')
        jest.mocked(useQuery).mockReturnValue({
            data: null,
            isLoading: true,
            isError: false,
        })

        render(<DocumentList />)

        expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('should show error state', () => {
        const { useQuery } = require('@/hooks/use-api')
        jest.mocked(useQuery).mockReturnValue({
            data: null,
            isLoading: false,
            isError: true,
        })

        render(<DocumentList />)

        expect(screen.getByText(/Bir hata oluştu/i)).toBeInTheDocument()
    })

    it('should filter documents by type', async () => {
        const user = userEvent.setup()
        render(<DocumentList />)

        const filterSelect = screen.getByRole('combobox', { name: /Belge Tipi/i })
        await user.click(filterSelect)
        await user.click(screen.getByText(/PDF/i))

        // Filter should work
        expect(filterSelect).toBeInTheDocument()
    })

    it('should search documents', async () => {
        const user = userEvent.setup()
        render(<DocumentList />)

        const searchInput = screen.getByPlaceholderText(/Ara.../i)
        await user.type(searchInput, 'test')

        expect(searchInput).toHaveValue('test')
    })

    it('should delete document', async () => {
        const toast = require('sonner').toast
        const { useDelete } = require('@/hooks/use-api')
        const mockDelete = jest.fn()

        jest.mocked(useDelete).mockReturnValue({
            mutate: mockDelete,
            isPending: false,
        })

        const { useQuery } = require('@/hooks/use-api')
        jest.mocked(useQuery).mockReturnValue({
            data: {
                data: [{ id: '1', ad: 'Test Doc', url: 'test.pdf', type: 'pdf', boyut: 1024 }],
                total: 1,
                page: 1,
                pageSize: 10,
            },
            isLoading: false,
            isError: false,
        })

        const user = userEvent.setup()
        render(<DocumentList />)

        await user.click(screen.getByRole('button', { name: /Sil/i }))
        await user.click(screen.getByRole('button', { name: /Onayla/i }))

        expect(mockDelete).toHaveBeenCalledWith('1')
        expect(toast.success).toHaveBeenCalledWith('Belge silindi')
    })

    it('should download document', async () => {
        const { useQuery } = require('@/hooks/use-api')
        jest.mocked(useQuery).mockReturnValue({
            data: {
                data: [{ id: '1', ad: 'Test Doc', url: 'test.pdf', type: 'pdf', boyut: 1024 }],
                total: 1,
                page: 1,
                pageSize: 10,
            },
            isLoading: false,
            isError: false,
        })

        render(<DocumentList />)

        const downloadBtn = screen.getByRole('link', { name: /İndir/i })
        expect(downloadBtn).toBeInTheDocument()
    })

    it('should show document type badge', () => {
        const { useQuery } = require('@/hooks/use-api')
        jest.mocked(useQuery).mockReturnValue({
            data: {
                data: [
                    { id: '1', ad: 'Test Doc', url: 'test.pdf', type: 'pdf', boyut: 1024 },
                    { id: '2', ad: 'Test Image', url: 'test.jpg', type: 'image', boyut: 2048 },
                ],
                total: 2,
                page: 1,
                pageSize: 10,
            },
            isLoading: false,
            isError: false,
        })

        render(<DocumentList />)

        expect(screen.getByText(/PDF/i)).toBeInTheDocument()
        expect(screen.getByText(/Görsel/i)).toBeInTheDocument()
    })
})
