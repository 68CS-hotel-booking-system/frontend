import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { bookingIntentSignature } from '../model/booking-idempotency'
const fetcher=vi.fn<typeof fetch>()
const id='11111111-1111-4111-8111-111111111111'
const response=(data: unknown)=>fetcher.mockResolvedValue(new Response(JSON.stringify({message:'ok',data})))
beforeEach(()=>{vi.resetModules();fetcher.mockReset();vi.stubGlobal('fetch',fetcher)})
afterEach(()=>vi.unstubAllGlobals())
it('includes the voucher in server quote and booking requests without calculating a discount', async () => {
 const { quoteStay, createBooking } = await import('./booking-api')
 const input = { checkIn: '2030-01-01', checkOut: '2030-01-02', voucherCode: 'SAVE10', items: [{ roomTypeId: id, quantity: 1, adults: 1, children: 0 }] }
 const quote = { hotelId: id, ...input, nights: 1, currency: 'VND', roomSubtotalAmount: 1000000, surchargeAmount: 0, discountAmount: 100000, totalAmount: 900000, items: [] }
 response(quote)
 expect((await quoteStay(id, input)).totalAmount).toBe(900000)
 expect(JSON.parse(fetcher.mock.calls[0][1]?.body as string).voucherCode).toBe('SAVE10')
 const contact = { fullName: 'Khách', email: 'guest@example.test', phone: '0901234567' }
 response({ ...quote, id, bookingCode: 'BK001', customerId: id, adults: 1, children: 0, status: 'PENDING_PAYMENT', expiresAt: '2030-01-01T00:15:00Z', createdAt: '2030-01-01T00:00:00Z', booker: contact, guest: contact })
 await createBooking(id, input, contact, 900000, undefined, undefined, 'intent-1')
 expect(JSON.parse(fetcher.mock.calls[1][1]?.body as string)).toMatchObject({ voucherCode: 'SAVE10', quotedTotalAmount: 900000 })
})
it('treats different voucher codes as different booking intents even when totals are identical', () => {
 const intent = { hotelId: id, input: { checkIn: '2030-01-01', checkOut: '2030-01-02', voucherCode: 'SAVE10', items: [] }, booker: { fullName: 'Khách', email: 'guest@example.test', phone: '0901234567' }, quotedTotalAmount: 900000 }
 expect(bookingIntentSignature(intent)).not.toBe(bookingIntentSignature({ ...intent, input: { ...intent.input, voucherCode: 'OTHER' } }))
 expect(bookingIntentSignature(intent)).toBe(bookingIntentSignature({ ...intent, input: { ...intent.input, voucherCode: ' save10 ' } }))
})
