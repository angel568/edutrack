import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Rol = 'admin' | 'profesor' | 'estudiante'

export interface AuthUser {
  id: string
  nombre: string
  apellido: string
  email: string
  rol: Rol
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: AuthUser, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    { name: 'edutrack-auth' }
  )
)
