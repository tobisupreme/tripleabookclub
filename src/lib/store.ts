'use client'

import { create } from 'zustand'
import { Profile, PortalStatus } from '@/types/database.types'

interface AuthState {
  user: Profile | null
  isLoading: boolean
  setUser: (user: Profile | null) => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
}))

interface PortalState {
  status: PortalStatus[]
  setStatus: (status: PortalStatus[]) => void
  getStatusForMonth: (month: number, year: number, category: 'fiction' | 'non-fiction') => PortalStatus | undefined
}

export const usePortalStore = create<PortalState>((set, get) => ({
  status: [],
  setStatus: (status) => set({ status }),
  getStatusForMonth: (month, year, category) => {
    return get().status.find(
      (s) => s.month === month && s.year === year && s.category === category
    )
  },
}))

interface UIState {
  isMobileMenuOpen: boolean
  isScrolled: boolean
  toggleMobileMenu: () => void
  setScrolled: (scrolled: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  isMobileMenuOpen: false,
  isScrolled: false,
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  setScrolled: (isScrolled) => set({ isScrolled }),
}))
