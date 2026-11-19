import { z } from 'zod'
import { http } from '@/shared/api/http'
export const memberSchema = z.object({
  userId: z.uuid(), memberRole: z.enum(['HOTEL_MANAGER', 'RECEPTIONIST']),
  status: z.enum(['ACTIVE', 'REVOKED']), version: z.number().int().nonnegative(),
})
export type Member = z.infer<typeof memberSchema>
const hotelSchema = z.object({ id: z.uuid(), name: z.string(), canAssignManager: z.boolean() })
export type StaffHotel = z.infer<typeof hotelSchema>
const pageSchema = <T extends z.ZodType>(item: T) => z.object({
  content: z.array(item), page: z.number(), size: z.number(), totalElements: z.number(),
  totalPages: z.number(), first: z.boolean(), last: z.boolean(),
})
export const assignmentSchema = z.object({
  userId: z.uuid('Nhập mã tài khoản hợp lệ.'),
  memberRole: z.enum(['HOTEL_MANAGER', 'RECEPTIONIST']),
  status: z.enum(['ACTIVE', 'REVOKED']),
  expectedVersion: z.number().int().nonnegative().nullable(),
})
export type Assignment = z.infer<typeof assignmentSchema>
export function listStaffHotels(page: number, signal?: AbortSignal) {
  return http.request('/management/staff-hotels?page=' + page + '&size=20', { signal, schema: pageSchema(hotelSchema) })
}
export function listMembers(hotelId: string, page: number, signal?: AbortSignal) {
  return http.request('/management/hotels/' + encodeURIComponent(hotelId) + '/members?page=' + page + '&size=20', {
    signal, schema: pageSchema(memberSchema),
  })
}
export function saveMember(hotelId: string, assignment: Assignment, signal?: AbortSignal) {
  const { userId, ...body } = assignmentSchema.parse(assignment)
  return http.request('/management/hotels/' + encodeURIComponent(hotelId) + '/members/' + encodeURIComponent(userId), {
    method: 'PUT', body, signal, schema: memberSchema,
  })
}
