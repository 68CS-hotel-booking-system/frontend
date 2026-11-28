import { z } from 'zod'
import { http } from '@/shared/api/http'

export const memberRoleSchema = z.enum(['HOTEL_MANAGER', 'RECEPTIONIST'])
export type MemberRole = z.infer<typeof memberRoleSchema>

export const memberStatusSchema = z.enum(['ACTIVE', 'REVOKED'])
export type MemberStatus = z.infer<typeof memberStatusSchema>

export const memberSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  fullName: z.string().nullable().optional(),
  email: z.string(),
  memberRole: memberRoleSchema,
  status: memberStatusSchema,
  assignedAt: z.string(),
  updatedAt: z.string(),
  version: z.number().int().nonnegative(),
})
export type Member = z.infer<typeof memberSchema>

const hotelSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  canAssignManager: z.boolean(),
})
export type StaffHotel = z.infer<typeof hotelSchema>

const pageSchema = <T extends z.ZodType>(item: T) =>
  z.object({
    content: z.array(item),
    page: z.number().int().nonnegative(),
    size: z.number().int().positive(),
    totalElements: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
    first: z.boolean(),
    last: z.boolean(),
  })

export const addMemberSchema = z.object({
  email: z.string().trim().min(1, 'Nhập địa chỉ email tài khoản.').email('Email không đúng định dạng.').max(255),
  memberRole: memberRoleSchema,
})
export type AddMemberPayload = z.infer<typeof addMemberSchema>

export const updateMemberStatusSchema = z.object({
  status: memberStatusSchema,
  expectedVersion: z.number().int().nonnegative(),
})
export type UpdateMemberStatusPayload = z.infer<typeof updateMemberStatusSchema>

export function listStaffHotels(page: number, signal?: AbortSignal) {
  return http.request(`/management/staff-hotels?page=${page}&size=20`, {
    signal,
    schema: pageSchema(hotelSchema),
  })
}

export function listMembers(hotelId: string, page: number, signal?: AbortSignal) {
  return http.request(`/management/hotels/${encodeURIComponent(hotelId)}/members?page=${page}&size=20`, {
    signal,
    schema: pageSchema(memberSchema),
  })
}

export function addMember(hotelId: string, payload: AddMemberPayload, signal?: AbortSignal) {
  const body = addMemberSchema.parse(payload)
  return http.request(`/management/hotels/${encodeURIComponent(hotelId)}/members`, {
    method: 'POST',
    body,
    signal,
    schema: memberSchema,
  })
}

export function updateMemberStatus(
  hotelId: string,
  memberId: string,
  payload: UpdateMemberStatusPayload,
  signal?: AbortSignal,
) {
  const body = updateMemberStatusSchema.parse(payload)
  return http.request(
    `/management/hotels/${encodeURIComponent(hotelId)}/members/${encodeURIComponent(memberId)}`,
    {
      method: 'PATCH',
      body,
      signal,
      schema: memberSchema,
    },
  )
}
