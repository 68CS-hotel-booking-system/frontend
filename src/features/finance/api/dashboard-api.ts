import { z } from 'zod'
import { http } from '@/shared/api/http'

const amount = z.number().int().nonnegative().safe()
export const dashboardSchema = z.object({
  bookingCount: amount, bookedAmount: amount, collectedAmount: amount, completedAmount: amount,
  platformAmount: amount, ownerAmount: amount, missingCommissionCount: amount,
  hotels: z.array(z.object({
    hotelId: z.uuid(), hotelName: z.string(), contractStatus: z.string(),
    endsAt: z.string().nullable(), acceptingBookings: z.boolean(),
  })),
})
export function getFinanceDashboard(signal?: AbortSignal) {
  return http.request('/finance/dashboard', { signal, schema: dashboardSchema })
}
