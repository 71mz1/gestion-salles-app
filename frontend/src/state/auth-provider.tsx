import { useEffect, useMemo, useState } from 'react'
import { AuthContext, type AuthContextValue } from './auth-context'
import type { ApiUser } from '../services/api'
import type { UserRole } from '../types/auth'

function loadUser(): ApiUser | null {
  try {
    const raw = localStorage.getItem('auth_user')
    return raw ? (JSON.parse(raw) as ApiUser) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(loadUser)

  useEffect(() => {
    if (user) {
      localStorage.setItem('auth_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('auth_user')
      localStorage.removeItem('token')
    }
  }, [user])

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: Boolean(user),
      role: user?.role as UserRole | null ?? null,
      user,
      login: (token: string, apiUser: ApiUser) => {
        localStorage.setItem('token', token)
        setUser(apiUser)
      },
      logout: () => {
        setUser(null)
      },
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
