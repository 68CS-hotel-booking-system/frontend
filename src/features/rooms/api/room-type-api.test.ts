import { QueryClient } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import { buildRoomTypeEditPayload } from './room-type-api'
import { invalidateManagementRooms } from '../hooks/use-management-room-mutations'

describe('room type edits', () => {
  const original = { name: 'Deluxe', description: '', maxAdults: 2, maxChildren: 0, active: true }
  it('requires explicit total capacity when changing adult/child limits', () => {
    expect(() => buildRoomTypeEditPayload(original, { ...original, maxAdults: 4 })).toThrow(/sức chứa/i)
    expect(buildRoomTypeEditPayload(original, { ...original, maxAdults: 4, maxChildren: 1, maxOccupancy: 5 })).toMatchObject({ maxAdults: 4, maxChildren: 1, maxOccupancy: 5 })
  })
  it('does not send capacity or invent base price on an unrelated edit', () => {
    expect(buildRoomTypeEditPayload(original, { ...original, name: 'Suite' })).toEqual({ name: 'Suite' })
  })
  it('retains explicit zero price and optional unknown fields', () => {
    expect(buildRoomTypeEditPayload(original, { ...original, basePrice: 0 })).toEqual({ basePrice: 0 })
  })
})

it('invalidates all room pages and room types after mutations, only for the target hotel', async () => {
  const client = new QueryClient()
  const keys = [
    ['rooms', 'management-list', 'a', { page: 0 }],
    ['rooms', 'management-list', 'a', { page: 3 }],
    ['hotels', 'a', 'room-types'],
    ['rooms', 'management-list', 'b', { page: 0 }],
  ]
  keys.forEach((key) => client.setQueryData(key, []))
  await invalidateManagementRooms(client, 'a')
  expect(keys.map((key) => client.getQueryState(key)?.isInvalidated)).toEqual([true, true, true, false])
})

it('rejects missing backend capacity/status instead of fabricating defaults', async () => {
  const { managementRoomTypeSchema } = await import('./room-type-api')
  expect(managementRoomTypeSchema.safeParse({ id: 'type', name: 'Suite' }).success).toBe(false)
})

it('preserves unknown list-only occupancy/price and concrete PATCH values', async () => {
  const { managementRoomTypeSchema } = await import('./room-type-api')
  const listed = managementRoomTypeSchema.parse({ id: 'type', name: 'Suite', maxAdults: 4, maxChildren: 1, active: false })
  expect(listed.maxOccupancy).toBeUndefined()
  expect(listed.basePrice).toBeUndefined()
  expect(managementRoomTypeSchema.parse({ ...listed, maxOccupancy: 5, basePrice: 0 })).toMatchObject({ maxOccupancy: 5, basePrice: 0, active: false })
})
