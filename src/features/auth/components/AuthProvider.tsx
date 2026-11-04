import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  getCurrentUserApi,
  loginApi,
  logoutApi,
  registerApi,
} from '../api/auth-api'
import { AuthContext, type AuthContextValue } from '../hooks/auth-context'
import {
  clearAuthSession,
  getAccessToken,
  getCachedUser,
  getRefreshToken,
  setCachedUser,
  setTokens,
} from '../lib/token-storage'
import type {
  CurrentUserResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from '../types/auth'

function hasRole(roles: string[], targetRole: string): boolean {
  const normalized = targetRole.toUpperCase()
  return roles.some((r) => {
    const candidate = r.toUpperCase()
    return candidate === normalized || candidate === `ROLE_${normalized}`
  })
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUserResponse | null>(() => getCachedUser())
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const refreshUser = useCallback(async (): Promise<CurrentUserResponse | null> => {
    const token = getAccessToken()
    if (!token) {
      setUser(null)
      clearAuthSession()
      return null
    }

    try {
      const fetched = await getCurrentUserApi()
      setUser(fetched)
      setCachedUser(fetched)
      return fetched
    } catch {
      setUser(null)
      clearAuthSession()
      return null
    }
  }, [])

  useEffect(() => {
    const token = getAccessToken()
    if (!token) return

    let isMounted = true

    getCurrentUserApi()
      .then((fetched) => {
        if (isMounted) {
          setUser(fetched)
          setCachedUser(fetched)
        }
      })
      .catch(() => {
        if (isMounted) {
          setUser(null)
          clearAuthSession()
        }
      })

    const onAuthChanged = () => {
      const currentToken = getAccessToken()
      if (!currentToken) {
        setUser(null)
      } else {
        void refreshUser()
      }
    }

    window.addEventListener('stayvibe-auth-changed', onAuthChanged)
    return () => {
      isMounted = false
      window.removeEventListener('stayvibe-auth-changed', onAuthChanged)
    }
  }, [refreshUser])

  const login = useCallback(
    async (payload: LoginRequest): Promise<LoginResponse> => {
      setIsLoading(true)
      try {
        const result = await loginApi(payload)
        setTokens(result.accessToken, result.refreshToken)
        try {
          const profile = await getCurrentUserApi()
          setUser(profile)
          setCachedUser(profile)
        } catch {
          if (result.user) {
            const fallbackProfile: CurrentUserResponse = {
              id: result.user.id,
              email: result.user.email,
              fullName: result.user.fullName,
              phone: result.user.phone,
              status: result.user.status,
              emailVerified: result.user.emailVerified,
              roles: ['ADMIN'],
              version: result.user.version,
            }
            setUser(fallbackProfile)
            setCachedUser(fallbackProfile)
          }
        }
        return result
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  const register = useCallback(
    async (payload: RegisterRequest): Promise<RegisterResponse> => {
      return registerApi(payload)
    },
    [],
  )

  const logout = useCallback(async (): Promise<void> => {
    const refreshToken = getRefreshToken()
    if (refreshToken) {
      try {
        await logoutApi(refreshToken)
      } catch {
        // Ignore logout network failures
      }
    }
    clearAuthSession()
    setUser(null)
  }, [])

  const roles = useMemo(() => user?.roles ?? [], [user])
  const isAdmin = useMemo(() => hasRole(roles, 'ADMIN'), [roles])
  const isHotelOwner = useMemo(() => hasRole(roles, 'HOTEL_OWNER'), [roles])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      isAdmin,
      isHotelOwner,
      roles,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, isLoading, isAdmin, isHotelOwner, roles, login, register, logout, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
