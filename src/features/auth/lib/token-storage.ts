import type { CurrentUserResponse } from '../types/auth'

const ACCESS_TOKEN_KEY = 'stayvibe_access_token'
const REFRESH_TOKEN_KEY = 'stayvibe_refresh_token'
const CURRENT_USER_KEY = 'stayvibe_auth_user'

function getStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage
    }
    if (typeof localStorage !== 'undefined') {
      return localStorage
    }
  } catch {
    // Storage access denied
  }
  return null
}

function dispatchAuthEvent(): void {
  try {
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new Event('stayvibe-auth-changed'))
    }
  } catch {
    // Ignore in non-browser environments
  }
}

export function getAccessToken(): string | null {
  const storage = getStorage()
  return storage ? storage.getItem(ACCESS_TOKEN_KEY) : null
}

export function getRefreshToken(): string | null {
  const storage = getStorage()
  return storage ? storage.getItem(REFRESH_TOKEN_KEY) : null
}

export function setTokens(accessToken: string, refreshToken: string): void {
  const storage = getStorage()
  if (storage) {
    try {
      storage.setItem(ACCESS_TOKEN_KEY, accessToken)
      storage.setItem(REFRESH_TOKEN_KEY, refreshToken)
      dispatchAuthEvent()
    } catch {
      // Storage quota exceeded
    }
  }
}

export function getCachedUser(): CurrentUserResponse | null {
  const storage = getStorage()
  if (!storage) return null
  try {
    const raw = storage.getItem(CURRENT_USER_KEY)
    return raw ? (JSON.parse(raw) as CurrentUserResponse) : null
  } catch {
    return null
  }
}

export function setCachedUser(user: CurrentUserResponse): void {
  const storage = getStorage()
  if (storage) {
    try {
      storage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
    } catch {
      // ignore
    }
  }
}

export function clearAuthSession(): void {
  const storage = getStorage()
  if (storage) {
    try {
      storage.removeItem(ACCESS_TOKEN_KEY)
      storage.removeItem(REFRESH_TOKEN_KEY)
      storage.removeItem(CURRENT_USER_KEY)
      dispatchAuthEvent()
    } catch {
      // ignore
    }
  }
}
