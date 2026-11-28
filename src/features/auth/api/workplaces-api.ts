import { z } from 'zod'
import { http } from '@/shared/api/http'

export const workplaceRoleSchema = z.enum(['HOTEL_MANAGER', 'RECEPTIONIST'])
export type WorkplaceRole = z.infer<typeof workplaceRoleSchema>

export const workplaceSchema = z.object({
  hotelId: z.string().uuid(),
  hotelName: z.string(),
  memberRole: workplaceRoleSchema,
})
export type Workplace = z.infer<typeof workplaceSchema>

export function getMyWorkplaces(signal?: AbortSignal) {
  return http.request('/me/workplaces', {
    signal,
    schema: z.array(workplaceSchema),
  })
}
