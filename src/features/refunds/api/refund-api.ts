import { z } from 'zod'
import { http } from '@/shared/api/http'

export const refundStatuses = ['PENDING', 'PROCESSING', 'COMPLETED'] as const
export type RefundStatus = typeof refundStatuses[number]
const count = z.number().int().nonnegative().safe()
const timestamp = z.iso.datetime({ offset: true })
export const refundSchema = z.object({ id: z.uuid(), paymentId: z.uuid(), bookingId: z.uuid(), bookingCode: z.string(), hotelId: z.uuid(), hotelName: z.string(),
  bookerName: z.string().nullable(), bookerEmail: z.string().nullable(), bookerPhone: z.string(), amount: count.positive(), currency: z.literal('VND'),
  reason: z.enum(['CUSTOMER_CANCELLATION', 'UNCONFIRMED_PAYMENT']), customerNote: z.string().nullable(), status: z.enum(refundStatuses),
  settlementReference: z.string().nullable(), note: z.string().nullable(), createdAt: timestamp, updatedAt: timestamp, completedAt: timestamp.nullable(), version: count, canProcess: z.boolean(),
  history: z.array(z.object({ id: z.uuid(), fromStatus: z.enum(refundStatuses), toStatus: z.enum(refundStatuses), note: z.string(), settlementReference: z.string().nullable(), createdAt: timestamp, version: count })) })
const pageSchema = z.object({ content: z.array(refundSchema), page: count, size: count, totalElements: count, totalPages: count, first: z.boolean(), last: z.boolean() })
export type Refund = z.infer<typeof refundSchema>
export interface RefundParams { page: number; size: number; status?: RefundStatus; keyword?: string; bookingId?: string }
export const refundActionSchema = z.object({ status: z.enum(['PROCESSING', 'COMPLETED']), reference: z.string().trim().max(100),
  note: z.string().trim().min(1, 'Nhập ghi chú gửi khách.').max(1000, 'Ghi chú tối đa 1000 ký tự.') })
  .refine(v => v.status !== 'COMPLETED' || v.reference.length > 0, { path: ['reference'], message: 'Nhập mã giao dịch đã hoàn tiền.' })
export type RefundActionValues = z.infer<typeof refundActionSchema>
const base = (management: boolean) => management ? '/management/refunds' : '/me/refunds'
export function listRefunds(management: boolean, params: RefundParams, signal?: AbortSignal) {
  const query = new URLSearchParams({ page: String(params.page), size: String(params.size) })
  if (params.status) query.set('status', params.status)
  if (params.keyword?.trim()) query.set('keyword', params.keyword.trim())
  if (params.bookingId) query.set('bookingId', z.uuid().parse(params.bookingId))
  return http.request(`${base(management)}?${query}`, { signal, schema: pageSchema })
}
export function getRefund(management: boolean, id: string, signal?: AbortSignal) {
  return http.request(`${base(management)}/${encodeURIComponent(id)}`, { signal, schema: refundSchema })
}
export function processRefund(id: string, values: RefundActionValues, expectedVersion: number) {
  return http.request(`/admin/refunds/${encodeURIComponent(id)}/actions`, { method: 'POST', body: { ...refundActionSchema.parse(values), expectedVersion: count.parse(expectedVersion) }, schema: refundSchema })
}
