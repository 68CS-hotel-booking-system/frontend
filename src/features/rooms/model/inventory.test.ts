import { expect, it } from 'vitest'
import { inventoryRangeSchema, blockFormSchema } from './inventory'
it('accepts a single-night inclusive block and rejects reversed ranges', () => {
  const block = { roomId: '11111111-1111-4111-8111-111111111111', startDate: '2026-11-12', endDate: '2026-11-12', reason: 'Bảo trì' }
  expect(blockFormSchema.safeParse(block).success).toBe(true)
  expect(blockFormSchema.safeParse({ ...block, endDate: '2026-11-11' }).success).toBe(false)
})
it('limits inventory calendar reads to backend-supported ranges', () => {
  expect(inventoryRangeSchema.safeParse({ startDate: '2026-11-12', endDate: '2027-05-01' }).success).toBe(false)
})
it('accepts a seeded room ID for maintenance while rejecting malformed IDs', () => {
  const block = { roomId: '47a5fc05-f674-bba7-66ff-c6965488b21b', startDate: '2026-11-12', endDate: '2026-11-12', reason: 'Bảo trì' }
  expect(blockFormSchema.safeParse(block).success).toBe(true)
  expect(blockFormSchema.safeParse({ ...block, roomId: 'not-an-id' }).success).toBe(false)
})
