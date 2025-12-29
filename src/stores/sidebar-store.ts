import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SidebarState {
  isOpen: boolean
  isCollapsed: boolean
  isMobile: boolean
  openMenus: string[]
  toggle: () => void
  setOpen: (open: boolean) => void
  setCollapsed: (collapsed: boolean) => void
  setMobile: (mobile: boolean) => void
  toggleMenu: (label: string) => void
  closeAllMenus: () => void
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isOpen: true,
      isCollapsed: false,
      isMobile: false,
      openMenus: [],

      toggle: () => set((state) => ({ isOpen: !state.isOpen })),

      setOpen: (open) => set({ isOpen: open }),

      setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),

      setMobile: (mobile) => set({ isMobile: mobile, isOpen: !mobile }),

      toggleMenu: (label) =>
        set((state) => ({
          openMenus: state.openMenus.includes(label)
            ? state.openMenus.filter((m) => m !== label)
            : [...state.openMenus, label],
        })),

      closeAllMenus: () => set({ openMenus: [] }),
    }),
    {
      name: 'sidebar-storage',
      partialize: (state) => ({
        isCollapsed: state.isCollapsed,
        openMenus: state.openMenus,
      }),
    }
  )
)
