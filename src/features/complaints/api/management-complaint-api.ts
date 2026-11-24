import { z } from 'zod'
import { http } from '@/shared/api/http'
import { complaintSchema, complaintStatuses } from './complaint-api'
export const managedComplaintSchema = z.object({ complaint: complaintSchema, hotelName: z.string(), bookingCode: z.string(),
  bookerName: z.string(), bookerEmail: z.string(), bookerPhone: z.string() })
const count = z.number().int().nonnegative()
const pageSchema = z.object({ content: z.array(managedComplaintSchema), page: count, size: count, totalElements: count, totalPages: count, first: z.boolean(), last: z.boolean() })
export const handlingSchema = z.object({ status: z.enum(['IN_REVIEW', 'RESOLVED', 'REJECTED']),
  response: z.string().trim().min(1, 'Nhập phản hồi gửi khách.').max(2000, 'Phản hồi tối đa 2000 ký tự.') })
export type HandlingValues = z.infer<typeof handlingSchema>
export type ManagedComplaint = z.infer<typeof managedComplaintSchema>
export type ComplaintStatus = typeof complaintStatuses[number]
export interface ComplaintParams { page: number; size: number; status?: ComplaintStatus; keyword: string }
export function listManagedComplaints(params: ComplaintParams, signal?: AbortSignal) {
  const query = new URLSearchParams({ page: String(params.page), size: String(params.size) })
  if (params.status) query.set('status', params.status)
  if (params.keyword.trim()) query.set('keyword', params.keyword.trim())
  return http.request(`/management/complaints?${query}`, { signal, schema: pageSchema })
}
export function getManagedComplaint(id: string, signal?: AbortSignal) {
  return http.request(`/management/complaints/${encodeURIComponent(id)}`, { signal, schema: managedComplaintSchema })
}
export function handleComplaint(id: string, values: HandlingValues, expectedVersion: number, signal?: AbortSignal) {
  const version = z.number().int().nonnegative().parse(expectedVersion)
  return http.request(`/management/complaints/${encodeURIComponent(id)}/actions`, { method: 'POST',
    body: { ...handlingSchema.parse(values), expectedVersion: version }, signal, schema: managedComplaintSchema })
}
