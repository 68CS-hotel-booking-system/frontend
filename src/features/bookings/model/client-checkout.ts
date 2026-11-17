import { z } from 'zod'
import { bookerFormSchema, quoteSchema, stayFormSchema, type BookerForm, type QuoteInput, type StayForm } from '../api/booking-api'

export type CheckoutQuote = z.infer<typeof quoteSchema>
export const checkoutMoney = (amount: number, currency: string) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(amount)
export const checkoutDate = (date: string) => date.split('-').reverse().join('/')
export interface CheckoutSelection { hotelId: string; roomTypeId: string; stay: StayForm; input: QuoteInput }
export function parseCheckoutSelection(hotelId: string, params: URLSearchParams): CheckoutSelection | null {
  const roomTypeId = params.get('roomTypeId') ?? ''
  const stay = stayFormSchema.safeParse({ checkIn: params.get('checkIn'), checkOut: params.get('checkOut'), adults: Number(params.get('adults') ?? 1), children: Number(params.get('children') ?? 0), quantity: 1 })
  if (!z.uuid().safeParse(hotelId).success || !z.uuid().safeParse(roomTypeId).success || !stay.success) return null
  return { hotelId, roomTypeId, stay: stay.data, input: { checkIn: stay.data.checkIn, checkOut: stay.data.checkOut, items: [{ roomTypeId, quantity: 1, adults: stay.data.adults, children: stay.data.children }] } }
}
export function checkoutHref(hotelId: string, roomTypeId: string, stay: Pick<StayForm, 'checkIn' | 'checkOut' | 'adults' | 'children'>) {
  return `/stays/${encodeURIComponent(hotelId)}/checkout?${new URLSearchParams({ roomTypeId, checkIn: stay.checkIn, checkOut: stay.checkOut, adults: String(stay.adults), children: String(stay.children) })}`
}
export function checkoutDetailHref(selection: CheckoutSelection) {
  return checkoutHref(selection.hotelId, selection.roomTypeId, selection.stay).replace('/checkout?', '?')
}
export function quoteFingerprint(quote: CheckoutQuote) {
  return JSON.stringify([quote.hotelId, quote.checkIn, quote.checkOut, quote.currency, quote.roomSubtotalAmount, quote.surchargeAmount, quote.discountAmount, quote.totalAmount, quote.items.map(item => [item.roomTypeId, item.quantity, item.adults, item.children, item.subtotalAmount, item.nightlyPrices])])
}
export function checkoutContacts(user: { fullName: string; email: string; phone: string | null }, changeGuest: boolean, values: BookerForm) {
  const booker = bookerFormSchema.parse({ fullName: user.fullName, email: user.email, phone: user.phone ?? '' })
  return { booker, guest: changeGuest ? bookerFormSchema.parse(values) : undefined }
}
