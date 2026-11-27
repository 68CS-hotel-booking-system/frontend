import { z } from 'zod'
import { http } from '@/shared/api/http'

const amount = z.number().int().nonnegative().safe()
export const dashboardSchema = z.object({
  bookingCount: amount, bookedAmount: amount, collectedAmount: amount, completedAmount: amount,
  platformAmount: amount, ownerAmount: amount, missingCommissionCount: amount,
  pendingRefundAmount: amount, refundedAmount: amount, netCollectedAmount: amount,
  hotels: z.array(z.object({
    hotelId: z.uuid(), hotelName: z.string(), contractStatus: z.string(),
    endsAt: z.string().nullable(), acceptingBookings: z.boolean(),
  })),
  contracts: z.array(z.object({
    contractId: z.uuid(), contractCode: z.string(), hotelId: z.uuid(), hotelName: z.string(), ownerId: z.uuid(),
    commissionRate: z.number().min(0).max(100), startsAt: z.iso.datetime({ offset: true }), endsAt: z.iso.datetime({ offset: true }),
    completedBookingCount: amount, completedAmount: amount, basisAmount: amount, platformAmount: amount, ownerAmount: amount,
    canManageHotel: z.boolean(),
  })),
})
export function getFinanceDashboard(signal?: AbortSignal) {
  return http.request('/finance/dashboard', { signal, schema: dashboardSchema })
}
