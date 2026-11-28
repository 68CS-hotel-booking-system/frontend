import { afterEach, beforeEach, expect, it, vi } from 'vitest'

const fetcher = vi.fn<typeof fetch>()
beforeEach(() => {
  vi.resetModules()
  fetcher.mockReset()
  vi.stubGlobal('fetch', fetcher)
})
afterEach(() => vi.unstubAllGlobals())

const hotel = '11111111-1111-4111-8111-111111111111'
const memberId = '33333333-3333-4333-8333-333333333333'
const user = '22222222-2222-4222-8222-222222222222'
const sampleMember = {
  id: memberId,
  userId: user,
  fullName: 'Nguyễn Lễ Tân',
  email: 'letan@stayhub.vn',
  memberRole: 'RECEPTIONIST',
  status: 'ACTIVE',
  assignedAt: '2026-11-28T03:00:00Z',
  updatedAt: '2026-11-28T03:00:00Z',
  version: 0,
}

it('posts new member assignment by email to the selected hotel', async () => {
  fetcher.mockResolvedValue(new Response(JSON.stringify({ message: 'ok', data: sampleMember }), { status: 201 }))
  const { addMember } = await import('./staff-api')
  const result = await addMember(hotel, { email: ' letan@stayhub.vn ', memberRole: 'RECEPTIONIST' })
  expect(fetcher.mock.calls[0][0]).toBe('/api/v1/management/hotels/' + hotel + '/members')
  expect(fetcher.mock.calls[0][1]?.method).toBe('POST')
  expect(JSON.parse(fetcher.mock.calls[0][1]?.body as string)).toEqual({
    email: 'letan@stayhub.vn',
    memberRole: 'RECEPTIONIST',
  })
  expect(result.id).toBe(memberId)
})

it('patches member status preserving expectedVersion zero', async () => {
  fetcher.mockResolvedValue(
    new Response(
      JSON.stringify({ message: 'ok', data: { ...sampleMember, status: 'REVOKED', version: 1 } }),
    ),
  )
  const { updateMemberStatus } = await import('./staff-api')
  await updateMemberStatus(hotel, memberId, { status: 'REVOKED', expectedVersion: 0 })
  expect(fetcher.mock.calls[0][0]).toBe('/api/v1/management/hotels/' + hotel + '/members/' + memberId)
  expect(fetcher.mock.calls[0][1]?.method).toBe('PATCH')
  expect(JSON.parse(fetcher.mock.calls[0][1]?.body as string)).toEqual({
    status: 'REVOKED',
    expectedVersion: 0,
  })
})

it('rejects invalid email or global admin role before sending a request', async () => {
  const { addMemberSchema } = await import('./staff-api')
  expect(addMemberSchema.safeParse({ email: 'not-an-email', memberRole: 'RECEPTIONIST' }).success).toBe(false)
  expect(addMemberSchema.safeParse({ email: 'admin@stayhub.vn', memberRole: 'ADMIN' }).success).toBe(false)
})

it('keeps permission errors instead of substituting an empty staff list', async () => {
  fetcher.mockResolvedValue(new Response(JSON.stringify({ status: 403, detail: 'Forbidden' }), { status: 403 }))
  const { listMembers } = await import('./staff-api')
  await expect(listMembers(hotel, 0)).rejects.toMatchObject({ status: 403 })
})
