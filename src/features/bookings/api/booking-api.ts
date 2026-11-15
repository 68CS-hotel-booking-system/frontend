import { z } from 'zod'
import { http } from '@/shared/api/http'

const money = z.number().int().nonnegative().safe()
const contactSchema = z.object({ fullName: z.string().nullable(), email: z.string().nullable(), phone: z.string() })
const itemSchema = z.object({
  id: z.uuid(), roomTypeId: z.uuid(), roomTypeName: z.string(), quantity: z.number().int(),
  adults: z.number().int(), children: z.number().int(), subtotalAmount: money,
  nightlyPrices: z.array(z.object({ stayDate: z.iso.date(), unitPrice: money })),
})
export const bookingSummarySchema = z.object({
  id: z.uuid(), bookingCode: z.string(), customerId: z.uuid(), hotelId: z.uuid(),
  bookerName: z.string().nullable(), guestName: z.string().nullable(),
  checkIn: z.iso.date(), checkOut: z.iso.date(), nights: z.number().int(),
  adults: z.number().int(), children: z.number().int(), status: z.string(), currency: z.string(),
  totalAmount: money, expiresAt: z.string().nullable(), createdAt: z.string(),
})
export const bookingDetailSchema = bookingSummarySchema.omit({ bookerName: true, guestName: true }).extend({
  booker: contactSchema, guest: contactSchema, items: z.array(itemSchema),
  roomSubtotalAmount: money, surchargeAmount: money, discountAmount: money,
})
export function pageSchema<T extends z.ZodType>(item: T) {
  return z.object({ content: z.array(item), page: z.number().int().nonnegative(), size: z.number().int().positive(),
    totalElements: z.number().int().nonnegative(), totalPages: z.number().int().nonnegative(), first: z.boolean(), last: z.boolean() })
}
export const bookingPageSchema = pageSchema(bookingSummarySchema)
export type BookingSummary = z.infer<typeof bookingSummarySchema>
export type BookingDetail = z.infer<typeof bookingDetailSchema>
export const bookingStatuses = ['PENDING_PAYMENT', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED', 'EXPIRED', 'NO_SHOW'] as const

export const stayFormSchema = z.object({
  checkIn: z.iso.date('Chọn ngày nhận phòng hợp lệ.'), checkOut: z.iso.date('Chọn ngày trả phòng hợp lệ.'),
  adults: z.number().int().min(1).max(50), children: z.number().int().min(0).max(50), quantity: z.number().int().min(1).max(50),
}).superRefine((value, ctx) => {
  const today = localDate()
  if (value.checkIn < today) ctx.addIssue({ code: 'custom', path: ['checkIn'], message: 'Ngày nhận phòng không được ở quá khứ.' })
  const nights = (Date.parse(value.checkOut) - Date.parse(value.checkIn)) / 86400000
  if (nights < 1 || nights > 30) ctx.addIssue({ code: 'custom', path: ['checkOut'], message: 'Kỳ nghỉ phải từ 1 đến 30 đêm.' })
  if (value.adults < value.quantity) ctx.addIssue({ code: 'custom', path: ['adults'], message: 'Mỗi phòng cần ít nhất một người lớn.' })
})
export type StayForm = z.infer<typeof stayFormSchema>
export function localDate(offset = 0) {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
export const bookerFormSchema = z.object({
  fullName: z.string().trim().min(1, 'Nhập họ tên.').max(100),
  email: z.email('Nhập email hợp lệ.').max(255), phone: z.string().trim().min(1, 'Nhập số điện thoại liên hệ.').max(20),
})
export type BookerForm = z.infer<typeof bookerFormSchema>
export interface QuoteInput {
  checkIn: string; checkOut: string
  items: { roomTypeId: string; quantity: number; adults: number; children: number }[]
}
export const quoteSchema = z.object({
  hotelId: z.uuid(), checkIn: z.iso.date(), checkOut: z.iso.date(), nights: z.number().int(), currency: z.string(),
  roomSubtotalAmount: money, surchargeAmount: money, discountAmount: money, totalAmount: money,
  items: z.array(itemSchema.omit({ id: true })),
})
const availabilitySchema = z.object({
  hotelId: z.uuid(), checkInDate: z.iso.date(), checkOutDate: z.iso.date(), totalNights: z.number().int(),
  roomTypes: z.array(z.object({ roomTypeId: z.uuid(), roomTypeName: z.string(), maxOccupancy: z.number().int(),
    maxAdults: z.number().int(), maxChildren: z.number().int(), availableQuantity: z.number().int(), isAvailable: z.boolean(),
    pricePerNight: money.nullable(), totalEstimatedPrice: money.nullable(), currency: z.string() })),
})
export function getAvailability(hotelId: string, stay: StayForm, signal?: AbortSignal) {
  const value = stayFormSchema.parse(stay)
  const params = new URLSearchParams({ checkInDate: value.checkIn, checkOutDate: value.checkOut,
    adults: String(value.adults), children: String(value.children), quantity: String(value.quantity) })
  return http.request(`/hotels/${encodeURIComponent(hotelId)}/availability?${params}`, { signal, schema: availabilitySchema })
}
export function quoteStay(hotelId: string, payload: QuoteInput, signal?: AbortSignal) {
  return http.request(`/hotels/${encodeURIComponent(hotelId)}/quote`, { method: 'POST', body: payload, signal, schema: quoteSchema })
}
export function createBooking(hotelId: string, payload: QuoteInput, booker: BookerForm, quotedTotalAmount: number, signal?: AbortSignal) {
  return http.request('/bookings', { method: 'POST', body: { hotelId, ...payload, booker: bookerFormSchema.parse(booker), quotedTotalAmount }, signal, schema: bookingDetailSchema })
}
export interface BookingListParams { page: number; size: number; status?: string }
export function listBookings(params: BookingListParams, hotelId?: string, signal?: AbortSignal) {
  const search = new URLSearchParams({ page: String(params.page), size: String(params.size) })
  if (params.status) search.set('status', params.status)
  const base = hotelId ? `/management/hotels/${encodeURIComponent(hotelId)}/bookings` : '/bookings'
  return http.request(`${base}?${search}`, { signal, schema: bookingPageSchema })
}
export function getBooking(bookingId: string, hotelId?: string, signal?: AbortSignal) {
  const base = hotelId ? `/management/hotels/${encodeURIComponent(hotelId)}/bookings` : '/bookings'
  return http.request(`${base}/${encodeURIComponent(bookingId)}`, { signal, schema: bookingDetailSchema })
}
export type StayOperation = 'check-in' | 'check-out' | 'late-arrival' | 'no-show'
export function operateBooking(hotelId: string, bookingId: string, operation: StayOperation, payload?: { reason?: string; expectedArrivalAt?: string; note?: string }, signal?: AbortSignal) {
  return http.request(`/management/hotels/${encodeURIComponent(hotelId)}/bookings/${encodeURIComponent(bookingId)}/${operation}`, {
    method: 'POST', body: payload, signal,
    schema: z.object({ hotelId: z.uuid(), bookingId: z.uuid(), stayStatus: z.string(), processedAt: z.string() }),
  })
}
export function assignBookingRooms(hotelId: string, bookingId: string, assignments: { bookingItemId: string; roomIds: string[] }[], reason?: string, signal?: AbortSignal) {
  return http.request(`/management/hotels/${encodeURIComponent(hotelId)}/bookings/${encodeURIComponent(bookingId)}/room-assignments`, {
    method: 'PUT', body: { assignments, reason }, signal,
    schema: z.object({ hotelId: z.uuid(), bookingId: z.uuid(), activeAssignments: z.array(z.object({ roomId: z.guid() })), history: z.array(z.object({ roomId: z.guid() })) }),
  })
}
