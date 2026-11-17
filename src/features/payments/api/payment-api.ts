import { z } from 'zod'
import { http } from '@/shared/api/http'
import { ApiError } from '@/shared/api/api-error'

export const paymentSchema = z.object({
  id: z.uuid(),
  bookingId: z.uuid(),
  amountVnd: z.number().int().positive().safe(),
  currency: z.literal('VND'),
  status: z.enum(['PENDING', 'SUCCEEDED', 'FAILED']),
  paymentUrl: z.string().nullable(),
  expiresAt: z.iso.datetime({ offset: true }),
})

export async function getPayment(paymentId: string, signal?: AbortSignal) {
  const id = z.uuid().parse(paymentId)
  const payment = await http.request('/payments/' + id, { schema: paymentSchema, signal })
  if (payment.id !== id) {
    throw new ApiError('Dữ liệu giao dịch không khớp.', { kind: 'invalid-response' })
  }
  return payment
}

export function createVnpayPayment(bookingId: string, signal?: AbortSignal) {
  const id = z.uuid().parse(bookingId)
  return http.request(`/payments/bookings/${id}/vnpay`, { method: 'POST', signal, schema: paymentSchema })
}

export function paymentRedirectUrl(value: string) {
  const url = new URL(value)
  if (url.protocol !== 'https:' || (url.hostname !== 'vnpayment.vn' && !url.hostname.endsWith('.vnpayment.vn')) || url.username || url.password) {
    throw new ApiError('Địa chỉ thanh toán không hợp lệ.', { kind: 'invalid-response' })
  }
  return url.href
}
