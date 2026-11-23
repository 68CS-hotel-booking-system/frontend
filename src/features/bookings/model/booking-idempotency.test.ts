import { describe, expect, it } from 'vitest'
import { resolveBookingIdempotencyKey, type BookingIdempotencyState, type BookingIntentPayload } from './booking-idempotency'

const basePayload: BookingIntentPayload = {
  hotelId: '11111111-1111-4111-8111-111111111111',
  input: {
    checkIn: '2030-01-10',
    checkOut: '2030-01-12',
    items: [{ roomTypeId: '22222222-2222-4222-8222-222222222222', quantity: 1, adults: 2, children: 0 }],
  },
  booker: { fullName: 'Nguyễn Văn A', email: 'a@example.test', phone: '0900000000' },
  quotedTotalAmount: 2000000,
}

describe('resolveBookingIdempotencyKey', () => {
  it('reuses the exact same UUID v4 key across retries of the same booking intent', () => {
    const ref: { current: BookingIdempotencyState | null } = { current: null }
    const first = resolveBookingIdempotencyKey(ref, basePayload)
    const retry = resolveBookingIdempotencyKey(ref, {
      ...basePayload,
      booker: { phone: ' 0900000000 ', email: 'a@example.test', fullName: ' Nguyễn Văn A ' },
    })

    expect(first).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    expect(retry).toBe(first)
  })

  it('rotates the key whenever hotel, room, dates, guests, contacts, or quoted total change', () => {
    const ref: { current: BookingIdempotencyState | null } = { current: null }
    let seq = 0
    const gen = () => `00000000-0000-4000-8000-${String(++seq).padStart(12, '0')}`
    const initial = resolveBookingIdempotencyKey(ref, basePayload, gen)

    const mutations: BookingIntentPayload[] = [
      { ...basePayload, hotelId: '99999999-9999-4999-8999-999999999999' },
      { ...basePayload, input: { ...basePayload.input, checkOut: '2030-01-13' } },
      { ...basePayload, input: { ...basePayload.input, items: [{ ...basePayload.input.items[0], roomTypeId: '88888888-8888-4888-8888-888888888888' }] } },
      { ...basePayload, input: { ...basePayload.input, items: [{ ...basePayload.input.items[0], adults: 3 }] } },
      { ...basePayload, guest: { fullName: 'Khách B', email: 'b@example.test', phone: '0911111111' } },
      { ...basePayload, quotedTotalAmount: 2100000 },
    ]

    let previous = initial
    for (const mutated of mutations) {
      const next = resolveBookingIdempotencyKey(ref, mutated, gen)
      expect(next).not.toBe(previous)
      previous = next
    }
  })

  it('generates a fresh key after the previous booking succeeds and resets state', () => {
    const ref: { current: BookingIdempotencyState | null } = { current: null }
    const first = resolveBookingIdempotencyKey(ref, basePayload)
    ref.current = null
    const afterSuccess = resolveBookingIdempotencyKey(ref, basePayload)
    expect(afterSuccess).not.toBe(first)
  })
})
