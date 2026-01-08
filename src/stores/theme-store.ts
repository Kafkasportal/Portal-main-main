'use client'

import { create } from 'zustand'

type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeState>()((set) => ({
  theme: 'light',
  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === 'light' ? 'dark' : 'light',
    })),
}))

// Apply theme to document
if (typeof window !== 'undefined') {
  const updateTheme = (theme: Theme) => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // Initialize from localStorage
  const savedTheme = localStorage.getItem('theme-storage') as Theme | null
  const initialTheme = savedTheme || 'light'
  useThemeStore.setState({ theme: initialTheme })
  updateTheme(initialTheme)

  // Subscribe to changes
  useThemeStore.subscribe((state) => {
    updateTheme(state.theme)
    localStorage.setItem('theme-storage', JSON.stringify({ theme: state.theme }))
  })
}
