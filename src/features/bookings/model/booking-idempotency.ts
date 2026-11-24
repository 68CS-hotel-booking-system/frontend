import { bookerFormSchema, type BookerForm, type QuoteInput } from '../api/booking-api'

export interface BookingIntentPayload {
  hotelId: string
  input: QuoteInput
  booker: BookerForm
  guest?: BookerForm
  quotedTotalAmount: number
}

export interface BookingIdempotencyState {
  signature: string
  key: string
}

export function bookingIntentSignature({
  hotelId,
  input,
  booker,
  guest,
  quotedTotalAmount,
}: BookingIntentPayload): string {
  const normalizedBooker = bookerFormSchema.parse(booker)
  const normalizedGuest = guest ? bookerFormSchema.parse(guest) : undefined
  return JSON.stringify([
    hotelId,
    input.checkIn,
    input.checkOut,
    input.items.map(item => [item.roomTypeId, item.quantity, item.adults, item.children]),
    [normalizedBooker.fullName, normalizedBooker.email, normalizedBooker.phone],
    normalizedGuest ? [normalizedGuest.fullName, normalizedGuest.email, normalizedGuest.phone] : null,
    quotedTotalAmount,
  ])
}

export function resolveBookingIdempotencyKey(
  stateRef: { current: BookingIdempotencyState | null },
  payload: BookingIntentPayload,
  generateKey: () => string = () => crypto.randomUUID(),
): string {
  const signature = bookingIntentSignature(payload)
  if (stateRef.current?.signature === signature) {
    return stateRef.current.key
  }
  const key = generateKey()
  stateRef.current = { signature, key }
  return key
}
