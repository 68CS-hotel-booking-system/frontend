export interface Session {
  accessToken: string
  refreshToken?: string | null
  expiresAt: string
  userId?: string | null
}

export type AuthStatus = 'restoring' | 'authenticated' | 'unauthenticated' | 'restore-error'

let session: Session | null = null
let authStatus: AuthStatus = 'restoring'
let restoreError: unknown = null

const listeners = new Set<() => void>()

function decodeJwtSubject(token: string): string | null {
  const parts = token.split('.')
  if (parts.length !== 3 || !parts[1]) return null
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
    const payload: unknown = JSON.parse(atob(padded))
    if (typeof payload === 'object' && payload !== null) {
      const sub = (payload as Record<string, unknown>).sub
      if (typeof sub === 'string' && sub.trim()) return sub
      const userId = (payload as Record<string, unknown>).userId
      if (typeof userId === 'string' && userId.trim()) return userId
    }
  } catch {
    return null
  }
  return null
}

export const getSession = () => session
export const getSessionIdentity = (value: Session | null = session): string | null => {
  if (!value) return null
  if (typeof value.userId === 'string' && value.userId.trim()) return value.userId
  return decodeJwtSubject(value.accessToken) ?? value.accessToken
}
export const getAuthStatus = () => authStatus
export const getRestoreError = () => restoreError

export function setSession(value: Session | null) {
  session = value
  if (value) {
    authStatus = 'authenticated'
    restoreError = null
  } else if (authStatus !== 'restoring' && authStatus !== 'restore-error') {
    authStatus = 'unauthenticated'
  }
  listeners.forEach((listener) => listener())
}

export function setAuthStatus(status: AuthStatus, error?: unknown) {
  authStatus = status
  restoreError = error ?? null
  if (status === 'unauthenticated') {
    session = null
  }
  listeners.forEach((listener) => listener())
}

export function subscribeSession(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
