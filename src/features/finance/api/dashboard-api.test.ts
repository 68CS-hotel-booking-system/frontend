import { expect, it } from 'vitest'
import { dashboardSchema } from './dashboard-api'

it('rejects unsafe or negative report amounts instead of rounding financial data silently', () => {
  const valid = { bookingCount: 1, bookedAmount: 2000000, collectedAmount: 2000000,
    completedAmount: 2000000, platformAmount: 200000, ownerAmount: 1800000,
    missingCommissionCount: 0, hotels: [] }
  expect(dashboardSchema.parse(valid)).toEqual(valid)
  expect(dashboardSchema.safeParse({ ...valid, platformAmount: -1 }).success).toBe(false)
  expect(dashboardSchema.safeParse({ ...valid, collectedAmount: Number.MAX_SAFE_INTEGER + 1 }).success).toBe(false)
})
