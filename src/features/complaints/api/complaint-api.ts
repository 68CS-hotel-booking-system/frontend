import { z } from 'zod'
import { http } from '@/shared/api/http'

export const complaintCategories = ['ROOM_CONDITION', 'SERVICE_QUALITY', 'STAFF_BEHAVIOR', 'BILLING', 'CANCELLATION_REFUND', 'OFF_PLATFORM_PAYMENT', 'OTHER'] as const
export const complaintSchema = z.object({ id: z.uuid(), bookingId: z.uuid(), hotelId: z.uuid(),
  category: z.enum(complaintCategories), content: z.string(), status: z.enum(['OPEN', 'IN_REVIEW', 'RESOLVED', 'REJECTED']), createdAt: z.string(), updatedAt: z.string() })
export const complaintFormSchema = z.object({ category: z.enum(complaintCategories), content: z.string().trim().min(1, 'Nhập nội dung khiếu nại.').max(2000) })
  .refine((value) => value.category !== 'OTHER' || value.content.length >= 20, { path: ['content'], message: 'Với loại Khác, mô tả cần ít nhất 20 ký tự.' })
export type ComplaintFormValues = z.infer<typeof complaintFormSchema>
export function submitComplaint(bookingId: string, payload: ComplaintFormValues, signal?: AbortSignal) {
  return http.request(`/bookings/${encodeURIComponent(bookingId)}/complaints`, { method: 'POST', body: complaintFormSchema.parse(payload), signal, schema: complaintSchema })
}
export function listMyComplaints(params: { page: number; size: number; status?: string }, signal?: AbortSignal) {
  const query = new URLSearchParams({ page: String(params.page), size: String(params.size) })
  if (params.status) query.set('status', params.status)
  return http.request(`/me/complaints?${query}`, { signal, schema: z.object({ content: z.array(complaintSchema), page: z.number().int(), size: z.number().int(),
    totalElements: z.number().int().nonnegative(), totalPages: z.number().int(), first: z.boolean(), last: z.boolean() }) })
}
export function getMyComplaint(id: string, signal?: AbortSignal) {
  return http.request(`/me/complaints/${encodeURIComponent(id)}`, { signal, schema: complaintSchema })
}
