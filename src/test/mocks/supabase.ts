import { vi } from 'vitest'

export const mockSupabaseData = {
    data: null as any,
    error: null as any,
    count: null as any,
}

export const mockSupabaseClient = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn().mockImplementation(() => {
        return Promise.resolve({
            data: mockSupabaseData.data?.[0] || mockSupabaseData.data,
            error: mockSupabaseData.error,
        })
    }),
    then: vi.fn().mockImplementation((onfulfilled) => {
        return Promise.resolve(
            onfulfilled({
                data: mockSupabaseData.data,
                error: mockSupabaseData.error,
                count: mockSupabaseData.count,
            })
        )
    }),
}

vi.mock('@/lib/supabase/client', () => ({
    getSupabaseClient: vi.fn(() => mockSupabaseClient),
}))
