import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AuthUser = {
  id: string
  email: string
  role: 'super_admin' | 'admin' | 'user'
  permissions?: {
    canAddTeam?: boolean | null
  } | null
}

type AuthState = {
  user: AuthUser | null
  setUser: (user: AuthUser | null) => void
  logout: () => void
  /** Super admin or explicit canAddTeam permission */
  canAddTeam: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
      canAddTeam: () => {
        const { user } = get()
        if (!user) return false
        if (user.role === 'super_admin') return true
        return user.permissions?.canAddTeam === true
      },
    }),
    { name: 'super-league-auth' }
  )
)
