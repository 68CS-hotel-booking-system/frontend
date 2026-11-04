import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { http } from '@/shared/api/http'
import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from '../lib/token-storage'
import {
  loginApi,
  logoutApi,
  registerApi,
  getCurrentUserApi,
  refreshTokenApi,
  verifyEmailApi,
  forgotPasswordApi,
  resetPasswordApi,
  changePasswordApi,
} from './auth-api'

class MemoryStorage implements Storage {
  private store = new Map<string, string>()
  get length() {
    return this.store.size
  }
  clear() {
    this.store.clear()
  }
  getItem(key: string) {
    return this.store.get(key) ?? null
  }
  key(index: number) {
    return Array.from(this.store.keys())[index] ?? null
  }
  removeItem(key: string) {
    this.store.delete(key)
  }
  setItem(key: string, value: string) {
    this.store.set(key, String(value))
  }
}

describe('Auth API and Token Storage', () => {
  beforeEach(() => {
    globalThis.localStorage = new MemoryStorage()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    globalThis.localStorage?.clear?.()
  })

  it('stores and retrieves access and refresh tokens', () => {
    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBeNull()

    setTokens('sample-access-token', 'sample-refresh-token')
    expect(getAccessToken()).toBe('sample-access-token')
    expect(getRefreshToken()).toBe('sample-refresh-token')

    clearAuthSession()
    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBeNull()
  })

  it('calls POST /auth/login with credentials and schema', async () => {
    const spy = vi.spyOn(http, 'request').mockResolvedValueOnce({
      accessToken: 'jwt.token.here',
      refreshToken: 'refresh.token.here',
      tokenType: 'Bearer',
      expiresAt: '2026-11-04T22:00:00Z',
      user: {
        id: '99999999-9999-4999-8999-999999999901',
        email: 'admin@hotelbooking.com',
        fullName: 'Admin User',
        phone: '0901234567',
        status: 'active',
        emailVerified: true,
        version: 1,
      },
    })

    const res = await loginApi({
      email: 'ADMIN@HOTELBOOKING.COM',
      password: 'SecretPassword123!',
    })

    expect(spy).toHaveBeenCalledWith(
      '/auth/login',
      expect.objectContaining({
        method: 'POST',
        body: {
          email: 'admin@hotelbooking.com',
          password: 'SecretPassword123!',
        },
      }),
    )
    expect(res.accessToken).toBe('jwt.token.here')
    expect(res.user?.fullName).toBe('Admin User')
  })

  it('calls GET /users/me and parses current user with roles', async () => {
    const spy = vi.spyOn(http, 'request').mockResolvedValueOnce({
      id: '99999999-9999-4999-8999-999999999901',
      email: 'admin@hotelbooking.com',
      fullName: 'Admin User',
      phone: '0901234567',
      status: 'active',
      emailVerified: true,
      roles: ['ADMIN', 'HOTEL_OWNER'],
      version: 1,
    })

    const user = await getCurrentUserApi()
    expect(spy).toHaveBeenCalledWith(
      '/users/me',
      expect.objectContaining({ method: 'GET' }),
    )
    expect(user.roles).toContain('ADMIN')
    expect(user.roles).toContain('HOTEL_OWNER')
  })

  it('calls POST /auth/register and validates response envelope', async () => {
    const spy = vi.spyOn(http, 'request').mockResolvedValueOnce({
      id: '99999999-9999-4999-8999-999999999902',
      email: 'newuser@hotelbooking.com',
      fullName: 'Nguyen Van B',
      phone: '0912345678',
      status: 'pending',
      emailVerified: false,
      version: 0,
    })

    const res = await registerApi({
      email: 'newuser@hotelbooking.com',
      password: 'VeryStrongPassword123!',
      fullName: 'Nguyen Van B',
      phone: '0912345678',
    })

    expect(spy).toHaveBeenCalledWith(
      '/auth/register',
      expect.objectContaining({ method: 'POST' }),
    )
    expect(res.id).toBe('99999999-9999-4999-8999-999999999902')
  })

  it('calls POST /auth/refresh with refresh token', async () => {
    const spy = vi.spyOn(http, 'request').mockResolvedValueOnce({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
      tokenType: 'Bearer',
      expiresAt: '2026-11-04T23:00:00Z',
    })

    const res = await refreshTokenApi('old-refresh-token')
    expect(spy).toHaveBeenCalledWith(
      '/auth/refresh',
      expect.objectContaining({
        method: 'POST',
        body: { refreshToken: 'old-refresh-token' },
      }),
    )
    expect(res.accessToken).toBe('new-access-token')
  })

  it('calls POST /auth/logout', async () => {
    const spy = vi.spyOn(http, 'request').mockResolvedValueOnce(undefined)

    await logoutApi('valid-refresh-token')
    expect(spy).toHaveBeenCalledWith(
      '/auth/logout',
      expect.objectContaining({
        method: 'POST',
        body: { refreshToken: 'valid-refresh-token' },
      }),
    )
  })

  it('calls remaining auth endpoints: email verification, forgot & reset password, change password', async () => {
    const spy = vi.spyOn(http, 'request').mockResolvedValue({})

    await verifyEmailApi({ token: 'verify-token-123' })
    expect(spy).toHaveBeenCalledWith(
      '/auth/email-verifications',
      expect.objectContaining({
        method: 'POST',
        body: { token: 'verify-token-123' },
      }),
    )

    await forgotPasswordApi({ email: 'user@example.com' })
    expect(spy).toHaveBeenCalledWith(
      '/auth/forgot-password',
      expect.objectContaining({
        method: 'POST',
        body: { email: 'user@example.com' },
      }),
    )

    await resetPasswordApi({ token: 'reset-123', newPassword: 'NewPassword123456!' })
    expect(spy).toHaveBeenCalledWith(
      '/auth/reset-password',
      expect.objectContaining({
        method: 'POST',
        body: { token: 'reset-123', newPassword: 'NewPassword123456!' },
      }),
    )

    await changePasswordApi({
      currentPassword: 'OldPassword123!',
      newPassword: 'NewPassword123456!',
    })
    expect(spy).toHaveBeenCalledWith(
      '/users/me/password',
      expect.objectContaining({
        method: 'POST',
        body: {
          currentPassword: 'OldPassword123!',
          newPassword: 'NewPassword123456!',
        },
      }),
    )
  })
})
