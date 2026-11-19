import { afterEach, beforeEach, expect, it, vi } from 'vitest'
const fetcher=vi.fn<typeof fetch>()
beforeEach(() => { vi.resetModules(); fetcher.mockReset(); vi.stubGlobal('fetch',fetcher) })
afterEach(() => vi.unstubAllGlobals())
it('creates accounts with the agreed roles array and no shared password', async () => {
  fetcher.mockResolvedValue(new Response(JSON.stringify({message:'ok',data:{
    id:'11111111-1111-4111-8111-111111111111',fullName:'New owner',email:'owner@example.test',phone:'+84912345678',
    roles:['CUSTOMER','HOTEL_OWNER'],status:'pending',emailVerified:false,createdAt:'2026-11-09T00:00:00Z',
    updatedAt:'2026-11-09T00:00:00Z',version:0,
  }}),{status:201}))
  const { createAdminUser }=await import('./users-api')
  await createAdminUser({fullName:'New owner',email:'owner@example.test',phone:'0912345678',role:'HOTEL_OWNER'})
  expect(fetcher.mock.calls[0][0]).toBe('/api/v1/admin/users')
  expect(JSON.parse(fetcher.mock.calls[0][1]?.body as string)).toEqual({
    fullName:'New owner',email:'owner@example.test',phone:'0912345678',roles:['HOTEL_OWNER'],
  })
})
