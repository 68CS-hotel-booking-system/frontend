import { afterEach, beforeEach, expect, it, vi } from 'vitest'
const fetcher=vi.fn<typeof fetch>()
beforeEach(() => { vi.resetModules(); fetcher.mockReset(); vi.stubGlobal('fetch',fetcher) })
afterEach(() => vi.unstubAllGlobals())
it('updates only profile fields with the observed version and propagates conflicts', async () => {
  fetcher.mockResolvedValue(new Response(JSON.stringify({ status:409,code:'STALE_USER_VERSION',detail:'Reload profile' }),{status:409}))
  const { updateProfile } = await import('./auth-api')
  const { setSession } = await import('@/shared/api/session')
  setSession({accessToken:'test-token',expiresAt:'2030-01-01T00:00:00Z'})
  const payload={fullName:'Guest',phone:'0912345678',expectedVersion:4}
  await expect(updateProfile(payload)).rejects.toMatchObject({status:409,code:'STALE_USER_VERSION'})
  expect(fetcher.mock.calls[0][0]).toBe('/api/v1/users/me')
  expect(JSON.parse(fetcher.mock.calls[0][1]?.body as string)).toEqual(payload)
  expect(new Headers(fetcher.mock.calls[0][1]?.headers).get('Authorization')).toBe('Bearer test-token')
})
