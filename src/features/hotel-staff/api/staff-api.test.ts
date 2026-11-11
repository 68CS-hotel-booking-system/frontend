import { afterEach, beforeEach, expect, it, vi } from 'vitest'
const fetcher=vi.fn<typeof fetch>()
beforeEach(() => { vi.resetModules(); fetcher.mockReset(); vi.stubGlobal('fetch',fetcher) })
afterEach(() => vi.unstubAllGlobals())
const hotel='11111111-1111-4111-8111-111111111111'
const user='22222222-2222-4222-8222-222222222222'
it('binds assignment to the selected hotel and preserves version zero', async () => {
  fetcher.mockResolvedValue(new Response(JSON.stringify({message:'ok',data:{userId:user,memberRole:'RECEPTIONIST',status:'REVOKED',version:1}})))
  const { saveMember }=await import('./staff-api')
  await saveMember(hotel,{userId:user,memberRole:'RECEPTIONIST',status:'REVOKED',expectedVersion:0})
  expect(fetcher.mock.calls[0][0]).toBe('/api/v1/management/hotels/'+hotel+'/members/'+user)
  expect(JSON.parse(fetcher.mock.calls[0][1]?.body as string)).toEqual({memberRole:'RECEPTIONIST',status:'REVOKED',expectedVersion:0})
})
it('rejects global admin as a hotel assignment before sending a request', async () => {
  const { assignmentSchema }=await import('./staff-api')
  expect(assignmentSchema.safeParse({userId:user,memberRole:'ADMIN',status:'ACTIVE',expectedVersion:null}).success).toBe(false)
})
it('keeps permission errors instead of substituting an empty staff list', async () => {
  fetcher.mockResolvedValue(new Response(JSON.stringify({status:403,detail:'Forbidden'}),{status:403}))
  const { listMembers }=await import('./staff-api')
  await expect(listMembers(hotel,0)).rejects.toMatchObject({status:403})
})
