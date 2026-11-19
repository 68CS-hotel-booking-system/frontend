import { describe, expect, it } from 'vitest'
import { checkoutContacts, checkoutDetailHref, checkoutHref, parseCheckoutSelection, quoteFingerprint, type CheckoutQuote } from './client-checkout'

const hotelId = '11111111-1111-4111-8111-111111111111'
const roomTypeId = '22222222-2222-4222-8222-222222222222'
const stay = { checkIn: '2099-01-10', checkOut: '2099-01-12', adults: 2, children: 1, quantity: 8 }
const profile = { fullName: 'Người đặt', email: 'booker@example.invalid', phone: '0900000000' }
const other = { fullName: 'Người nhận phòng', email: 'guest@example.invalid', phone: '0911111111' }

describe('client checkout selection', () => {
  it('restores one room and preserves children and selected room across checkout/back links', () => {
    const href = checkoutHref(hotelId, roomTypeId, stay)
    const parsed = parseCheckoutSelection(hotelId, new URLSearchParams(href.split('?')[1] + '&quantity=8'))!
    expect(parsed.input.items).toEqual([{ roomTypeId, quantity: 1, adults: 2, children: 1 }])
    expect(parsed.stay.quantity).toBe(1)
    expect(checkoutDetailHref(parsed)).toBe(href.replace('/checkout?', '?'))
    expect(href).not.toContain('quantity')
  })
  it.each([{ roomTypeId: 'unknown' }, { hotelId: 'unknown' }, { checkOut: stay.checkIn }, { checkIn: '2020-01-01' }, { adults: 'NaN' }, { children: '-1' }, { checkOut: '2099-02-20' }])('rejects invalid deep links: %o', overrides => {
    const params = new URLSearchParams({ roomTypeId, ...Object.fromEntries(Object.entries(stay).map(([key, value]) => [key, String(value)])) })
    Object.entries(overrides).forEach(([key, value]) => params.set(key, value))
    expect(parseCheckoutSelection(overrides.hotelId ?? hotelId, params)).toBeNull()
  })
})
describe('checkout contacts', () => {
  it('uses the account when editing is off, even if field values were changed', () => {
    expect(checkoutContacts(profile, false, other)).toEqual({ booker: profile, guest: undefined })
  })
  it('keeps the original booker and sends a separate guest when editing is on', () => {
    expect(checkoutContacts(profile, true, other)).toEqual({ booker: profile, guest: other })
    expect(profile.fullName).toBe('Người đặt')
  })
  it('requires a valid booker profile even when a different guest is supplied', () => {
    expect(() => checkoutContacts({ ...profile, phone: null }, true, other)).toThrow()
    expect(() => checkoutContacts(profile, true, { ...other, email: 'invalid' })).toThrow()
  })
})
it('detects changes in breakdown and nightly prices even when the grand total stays equal', () => {
  const quote: CheckoutQuote = { hotelId, checkIn: stay.checkIn, checkOut: stay.checkOut, nights: 2, currency: 'VND', roomSubtotalAmount: 2000000, surchargeAmount: 0, discountAmount: 0, totalAmount: 2000000, items: [{ roomTypeId, roomTypeName: 'Deluxe', quantity: 1, adults: 2, children: 1, subtotalAmount: 2000000, nightlyPrices: [{ stayDate: stay.checkIn, unitPrice: 1000000 }] }] }
  expect(quoteFingerprint(quote)).toBe(quoteFingerprint(structuredClone(quote)))
  expect(quoteFingerprint(quote)).not.toBe(quoteFingerprint({ ...quote, roomSubtotalAmount: 1900000, surchargeAmount: 100000 }))
  expect(quoteFingerprint(quote)).not.toBe(quoteFingerprint({ ...quote, items: [{ ...quote.items[0], nightlyPrices: [{ stayDate: stay.checkIn, unitPrice: 900000 }] }] }))
})
