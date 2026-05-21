import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types'

interface AuthState {
  token: string | null
  user: User | null
  setAuth: (token: string, user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,

      // Dipanggil setelah login berhasil
      setAuth: (token, user) => set({ token, user }),

      // Dipanggil saat logout → hapus semua data
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: 'elysiaapp-auth', // key di localStorage
    }
  )
)