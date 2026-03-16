import { createContext, useContext } from 'react'
import type { ApiUser } from '../services/api'
import type { UserRole } from '../types/auth'

export type AuthContextValue = {
  isAuthenticated: boolean
  role: UserRole | null
  user: ApiUser | null
  login: (token: string, user: ApiUser) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return ctx
}
