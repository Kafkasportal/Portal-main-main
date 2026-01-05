import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createFullBackup, restoreFromBackup, getBackupHistory, clearBackupHistory } from '../backup.service'
import { getSupabaseClient } from '@/lib/supabase/client'

vi.mock('@/lib/supabase/client', () => ({
    getSupabaseClient: vi.fn(),
}))

// Mock DOM elements
if (typeof window !== 'undefined') {
    global.URL.createObjectURL = vi.fn()
    global.URL.revokeObjectURL = vi.fn()
}

describe('backup.service', () => {
    const mockSupabase = {
        from: vi.fn().mockReturnValue({
            select: vi.fn().mockResolvedValue({ data: [], error: null }),
            upsert: vi.fn().mockResolvedValue({ error: null })
        })
    }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(getSupabaseClient).mockReturnValue(mockSupabase as any)
        localStorage.clear()

        // Mock document.createElement for download link
        const originalCreateElement = document.createElement.bind(document)
        vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
            if (tagName === 'a') {
                return {
                    href: '',
                    download: '',
                    click: vi.fn(),
                    style: {}
                } as any
            }
            return originalCreateElement(tagName)
        })

        document.body.appendChild = vi.fn()
        document.body.removeChild = vi.fn()
    })

    describe('createFullBackup', () => {
        it('should fetch all data and create a backup file', async () => {
            const result = await createFullBackup()

            expect(result.status).toBe('completed')
            expect(result.type).toBe('full')
            expect(mockSupabase.from).toHaveBeenCalledWith('members')
            expect(mockSupabase.from).toHaveBeenCalledWith('donations')
            expect(localStorage.getItem('backup_history')).toBeDefined()
        })
    })

    describe('restoreFromBackup', () => {
        it('should parse backup file and restore data', async () => {
            const backupData = {
                version: '1.0',
                tables: {
                    members: [{ id: 1, name: 'Test' }]
                }
            }
            const file = new File([JSON.stringify(backupData)], 'backup.json', { type: 'application/json' })
            // Mock file.text() as it might not be available in test env
            file.text = vi.fn().mockResolvedValue(JSON.stringify(backupData))

            await restoreFromBackup(file)

            expect(mockSupabase.from).toHaveBeenCalledWith('members')
            const fromMembers = mockSupabase.from('members')
            expect(fromMembers.upsert).toHaveBeenCalledWith([{ id: 1, name: 'Test' }], { onConflict: 'id' })
        })

        it('should throw error for invalid backup file', async () => {
            const file = new File(['invalid'], 'backup.json', { type: 'application/json' })
            file.text = vi.fn().mockResolvedValue('invalid')
            await expect(restoreFromBackup(file)).rejects.toThrow()
        })
    })

    describe('history management', () => {
        it('should return empty history when none exists', () => {
            expect(getBackupHistory()).toEqual([])
        })

        it('should clear history', () => {
            localStorage.setItem('backup_history', JSON.stringify([{ id: '1' }]))
            clearBackupHistory()
            expect(getBackupHistory()).toEqual([])
        })
    })
})
