import { z } from 'zod'
import { http } from '@/shared/api/http'

const hotel = z.object({ id: z.string().uuid(), name: z.string(), slug: z.string(), address: z.string(), starRating: z.number().nullable(), city: z.object({ id: z.string(), name: z.string(), slug: z.string() }), coverImage: z.object({ mediaId: z.string() }).nullable(), minNightlyPrice: z.number().nullable(), totalPrice: z.number().nullable(), currency: z.string().nullable(), amenities: z.array(z.object({ id: z.string(), code: z.string(), name: z.string() })) })
const page = z.object({ content: z.array(hotel), page: z.number(), size: z.number(), totalElements: z.number(), totalPages: z.number(), first: z.boolean(), last: z.boolean() })
const availability = z.object({ hotelId: z.string(), checkInDate: z.string(), checkOutDate: z.string(), totalNights: z.number(), roomTypes: z.array(z.object({ roomTypeId: z.string(), roomTypeName: z.string(), maxOccupancy: z.number(), maxAdults: z.number(), maxChildren: z.number(), availableQuantity: z.number(), isAvailable: z.boolean(), pricePerNight: z.number().nullable(), totalEstimatedPrice: z.number().nullable(), currency: z.string() })) })
const quote = z.object({ currency: z.string(), nights: z.number(), roomSubtotalAmount: z.number(), surchargeAmount: z.number(), subtotalAmount: z.number(), discountAmount: z.number(), totalAmount: z.number(), items: z.array(z.object({ roomTypeId: z.string(), nightlyPrices: z.array(z.object({ stayDate: z.string(), unitPrice: z.number() })) })) })
export type SearchParams = { cityId: string; checkIn: string; checkOut: string; guests: number; page: number }
export type StayParams = { checkIn: string; checkOut: string; adults: number; children: number; quantity: number }
export type SearchHotel = z.infer<typeof hotel>
export function searchHotels(p: SearchParams, signal?: AbortSignal) {
  const qs = new URLSearchParams({ page: String(p.page), size: '12', guests: String(p.guests) })
  if (p.cityId) qs.set('cityId', p.cityId)
  if (p.checkIn && p.checkOut) { qs.set('checkIn', p.checkIn); qs.set('checkOut', p.checkOut) }
  return http.request(`/hotels/search?${qs}`, { signal, schema: page })
}
export function getAvailability(id: string, p: StayParams, signal?: AbortSignal) {
  const qs = new URLSearchParams({ checkInDate: p.checkIn, checkOutDate: p.checkOut, adults: String(p.adults), children: String(p.children), quantity: String(p.quantity) })
  return http.request(`/hotels/${encodeURIComponent(id)}/availability?${qs}`, { signal, schema: availability })
}
export function getQuote(id: string, p: StayParams, roomTypeId: string, signal?: AbortSignal) {
  return http.request(`/hotels/${encodeURIComponent(id)}/quote`, { method: 'POST', signal, schema: quote, body: { checkIn: p.checkIn, checkOut: p.checkOut, items: [{ roomTypeId, quantity: p.quantity, adults: p.adults, children: p.children }] } })
}
