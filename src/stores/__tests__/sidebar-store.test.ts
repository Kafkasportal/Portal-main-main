import { renderHook, act } from '@testing-library/react'
import { useSidebarStore } from '../sidebar-store'

// Mock zustand persist
jest.mock('zustand/middleware', () => ({
  persist: (config: unknown) => config,
}))

describe('Sidebar Store', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    const { result } = renderHook(() => useSidebarStore())
    act(() => {
      result.current.setOpen(true)
      result.current.setCollapsed(false)
      result.current.setMobile(false)
      result.current.closeAllMenus()
    })
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useSidebarStore())

      expect(result.current.isOpen).toBe(true)
      expect(result.current.isCollapsed).toBe(false)
      expect(result.current.isMobile).toBe(false)
      expect(result.current.openMenus).toEqual([])
    })
  })

  describe('toggle', () => {
    it('should toggle sidebar open state', () => {
      const { result } = renderHook(() => useSidebarStore())

      expect(result.current.isOpen).toBe(true)

      act(() => {
        result.current.toggle()
      })

      expect(result.current.isOpen).toBe(false)

      act(() => {
        result.current.toggle()
      })

      expect(result.current.isOpen).toBe(true)
    })
  })

  describe('setOpen', () => {
    it('should set sidebar open state', () => {
      const { result } = renderHook(() => useSidebarStore())

      act(() => {
        result.current.setOpen(false)
      })

      expect(result.current.isOpen).toBe(false)

      act(() => {
        result.current.setOpen(true)
      })

      expect(result.current.isOpen).toBe(true)
    })
  })

  describe('setCollapsed', () => {
    it('should set sidebar collapsed state', () => {
      const { result } = renderHook(() => useSidebarStore())

      act(() => {
        result.current.setCollapsed(true)
      })

      expect(result.current.isCollapsed).toBe(true)

      act(() => {
        result.current.setCollapsed(false)
      })

      expect(result.current.isCollapsed).toBe(false)
    })
  })

  describe('setMobile', () => {
    it('should set mobile state and close sidebar', () => {
      const { result } = renderHook(() => useSidebarStore())

      act(() => {
        result.current.setMobile(true)
      })

      expect(result.current.isMobile).toBe(true)
      expect(result.current.isOpen).toBe(false) // Should close on mobile
    })

    it('should set desktop state and open sidebar', () => {
      const { result } = renderHook(() => useSidebarStore())

      // First set to mobile
      act(() => {
        result.current.setMobile(true)
      })

      expect(result.current.isOpen).toBe(false)

      // Then set back to desktop
      act(() => {
        result.current.setMobile(false)
      })

      expect(result.current.isMobile).toBe(false)
      expect(result.current.isOpen).toBe(true) // Should open on desktop
    })
  })

  describe('toggleMenu', () => {
    it('should open a menu when not in openMenus', () => {
      const { result } = renderHook(() => useSidebarStore())

      act(() => {
        result.current.toggleMenu('Üyeler')
      })

      expect(result.current.openMenus).toContain('Üyeler')
    })

    it('should close a menu when already in openMenus', () => {
      const { result } = renderHook(() => useSidebarStore())

      act(() => {
        result.current.toggleMenu('Üyeler')
      })

      expect(result.current.openMenus).toContain('Üyeler')

      act(() => {
        result.current.toggleMenu('Üyeler')
      })

      expect(result.current.openMenus).not.toContain('Üyeler')
    })

    it('should handle multiple open menus', () => {
      const { result } = renderHook(() => useSidebarStore())

      act(() => {
        result.current.toggleMenu('Üyeler')
        result.current.toggleMenu('Bağışlar')
        result.current.toggleMenu('Kumbara')
      })

      expect(result.current.openMenus).toEqual(['Üyeler', 'Bağışlar', 'Kumbara'])
    })

    it('should close specific menu without affecting others', () => {
      const { result } = renderHook(() => useSidebarStore())

      act(() => {
        result.current.toggleMenu('Üyeler')
        result.current.toggleMenu('Bağışlar')
        result.current.toggleMenu('Kumbara')
      })

      act(() => {
        result.current.toggleMenu('Bağışlar')
      })

      expect(result.current.openMenus).toEqual(['Üyeler', 'Kumbara'])
    })
  })

  describe('closeAllMenus', () => {
    it('should close all open menus', () => {
      const { result } = renderHook(() => useSidebarStore())

      act(() => {
        result.current.toggleMenu('Üyeler')
        result.current.toggleMenu('Bağışlar')
        result.current.toggleMenu('Kumbara')
      })

      expect(result.current.openMenus.length).toBe(3)

      act(() => {
        result.current.closeAllMenus()
      })

      expect(result.current.openMenus).toEqual([])
    })

    it('should work even when no menus are open', () => {
      const { result } = renderHook(() => useSidebarStore())

      expect(result.current.openMenus).toEqual([])

      act(() => {
        result.current.closeAllMenus()
      })

      expect(result.current.openMenus).toEqual([])
    })
  })

  describe('State persistence', () => {
    it('should have persist configuration', () => {
      // The store is created with persist middleware
      // This test verifies the store can be instantiated
      const { result } = renderHook(() => useSidebarStore())

      expect(result.current).toBeDefined()
      expect(typeof result.current.setCollapsed).toBe('function')
      expect(typeof result.current.toggleMenu).toBe('function')
    })
  })

  describe('Complex state interactions', () => {
    it('should maintain menu state when toggling sidebar', () => {
      const { result } = renderHook(() => useSidebarStore())

      act(() => {
        result.current.toggleMenu('Üyeler')
        result.current.toggleMenu('Bağışlar')
      })

      const menusBefore = result.current.openMenus

      act(() => {
        result.current.toggle()
      })

      expect(result.current.openMenus).toEqual(menusBefore)
    })

    it('should maintain collapsed state when changing mobile state', () => {
      const { result } = renderHook(() => useSidebarStore())

      act(() => {
        result.current.setCollapsed(true)
      })

      expect(result.current.isCollapsed).toBe(true)

      act(() => {
        result.current.setMobile(true)
      })

      expect(result.current.isCollapsed).toBe(true)
    })
  })
})
