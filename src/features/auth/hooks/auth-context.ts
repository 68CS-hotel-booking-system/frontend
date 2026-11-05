import { createContext, useContext } from 'react'
import type {
  CurrentUserResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from '../types/auth'

export interface AuthContextValue {
  user: CurrentUserResponse | null
  isAuthenticated: boolean
  isLoading: boolean
  isAdmin: boolean
  isHotelOwner: boolean
  roles: string[]
  login: (payload: LoginRequest) => Promise<LoginResponse>
  register: (payload: RegisterRequest) => Promise<RegisterResponse>
  logout: () => Promise<void>
  refreshUser: () => Promise<CurrentUserResponse | null>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
