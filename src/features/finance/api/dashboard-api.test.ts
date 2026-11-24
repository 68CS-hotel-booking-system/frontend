import { expect, it } from 'vitest'
import { dashboardSchema } from './dashboard-api'

it('rejects unsafe or negative report amounts instead of rounding financial data silently', () => {
  const valid = { bookingCount: 1, bookedAmount: 2000000, collectedAmount: 2000000,
    completedAmount: 2000000, platformAmount: 200000, ownerAmount: 1800000,
    missingCommissionCount: 0, hotels: [], contracts: [] }
  expect(dashboardSchema.parse(valid)).toEqual(valid)
  expect(dashboardSchema.safeParse({ ...valid, platformAmount: -1 }).success).toBe(false)
  expect(dashboardSchema.safeParse({ ...valid, collectedAmount: Number.MAX_SAFE_INTEGER + 1 }).success).toBe(false)
})

it('validates contract snapshot amounts and rates in the private finance report', () => {
  const contract = { contractId: '22222222-2222-4222-8222-222222222222', contractCode: 'HD-2026-000001',
    hotelId: '11111111-1111-4111-8111-111111111111', hotelName: 'Khách sạn', ownerId: '33333333-3333-4333-8333-333333333333',
    commissionRate: 10, startsAt: '2026-01-01T00:00:00Z', endsAt: '2026-11-01T00:00:00Z',
    completedBookingCount: 1, completedAmount: 2000000, basisAmount: 2000000, platformAmount: 200000, ownerAmount: 1800000, canManageHotel: false }
  const report = { bookingCount: 1, bookedAmount: 2000000, collectedAmount: 2000000, completedAmount: 2000000,
    platformAmount: 200000, ownerAmount: 1800000, missingCommissionCount: 0, hotels: [], contracts: [contract] }
  expect(dashboardSchema.parse(report)).toEqual(report)
  expect(dashboardSchema.safeParse({ ...report, contracts: [{ ...contract, commissionRate: 101 }] }).success).toBe(false)
  expect(dashboardSchema.safeParse({ ...report, contracts: [{ ...contract, ownerAmount: Number.MAX_SAFE_INTEGER + 1 }] }).success).toBe(false)
})
