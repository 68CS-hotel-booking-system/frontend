import { afterEach, beforeEach, expect, it, vi } from 'vitest'
const fetcher = vi.fn<typeof fetch>()
const hotelId = '11111111-1111-4111-8111-111111111111'
const roomId = '22222222-2222-4222-8222-222222222222'
const booker = { fullName: 'Khách kiểm thử', email: 'qa@example.invalid', phone: '0900000000' }
const input = { checkIn: '2030-01-10', checkOut: '2030-01-12', items: [{ roomTypeId: roomId, quantity: 1, adults: 2, children: 0 }] }
const quote = { hotelId, checkIn: input.checkIn, checkOut: input.checkOut, nights: 2, currency: 'VND', roomSubtotalAmount: 2000000, surchargeAmount: 50000, discountAmount: 0, totalAmount: 2050000,
  items: [{ ...input.items[0], roomTypeName: 'Deluxe', subtotalAmount: 2050000, nightlyPrices: [{ stayDate: '2030-01-10', unitPrice: 1000000 }, { stayDate: '2030-01-11', unitPrice: 1000000 }] }] }
beforeEach(() => { vi.resetModules(); fetcher.mockReset(); vi.stubGlobal('fetch', fetcher) })
afterEach(() => vi.unstubAllGlobals())
function response(data: unknown) { fetcher.mockResolvedValue(new Response(JSON.stringify({ message: 'ok', data }))) }

it('keeps the server quote including surcharges and sends only the quote input', async () => {
  response(quote)
  const { quoteStay } = await import('./booking-api')
  const result = await quoteStay(hotelId, input, new AbortController().signal)
  expect(result.totalAmount).toBe(2050000)
  expect(fetcher.mock.calls[0][0]).toBe(`/api/v1/hotels/${hotelId}/quote`)
  expect(JSON.parse(fetcher.mock.calls[0][1]?.body as string)).toEqual(input)
  expect(fetcher.mock.calls[0][1]?.signal).toBeInstanceOf(AbortSignal)
})
it('creates a real booking with the confirmed server total, not a payment success', async () => {
  response({ ...quote, id: roomId, bookingCode: 'BK-QA', customerId: hotelId, adults: 2, children: 0, status: 'PENDING_PAYMENT', expiresAt: '2030-01-01T00:00:00Z', createdAt: '2030-01-01T00:00:00Z',
    booker, guest: booker, items: [{ ...quote.items[0], id: roomId }] })
  const { createBooking } = await import('./booking-api')
  const result = await createBooking(hotelId, input, booker, quote.totalAmount)
  expect(result.status).toBe('PENDING_PAYMENT')
  expect(fetcher.mock.calls[0][0]).toBe('/api/v1/bookings')
  expect(JSON.parse(fetcher.mock.calls[0][1]?.body as string)).toEqual({ hotelId, ...input, booker, quotedTotalAmount: 2050000 })
})
it('uses availability date names from the controller and checks total occupancy inputs', async () => {
  response({ hotelId, checkInDate: input.checkIn, checkOutDate: input.checkOut, totalNights: 2, roomTypes: [] })
  const { getAvailability } = await import('./booking-api')
  await getAvailability(hotelId, { checkIn: input.checkIn, checkOut: input.checkOut, adults: 4, children: 1, quantity: 2 })
  expect(fetcher.mock.calls[0][0]).toBe(`/api/v1/hotels/${hotelId}/availability?checkInDate=2030-01-10&checkOutDate=2030-01-12&adults=4&children=1&quantity=2`)
})
it('rejects reversed, past, too-long stays and missing adult per room before requesting', async () => {
  const { stayFormSchema, getAvailability } = await import('./booking-api')
  const stay = { checkIn: '2030-01-10', checkOut: '2030-01-12', adults: 2, children: 0, quantity: 1 }
  for (const change of [{ checkOut: '2030-01-09' }, { checkIn: '2020-01-01', checkOut: '2020-01-02' }, { checkOut: '2030-02-11' }, { adults: 1, quantity: 2 }]) {
    expect(stayFormSchema.safeParse({ ...stay, ...change }).success).toBe(false)
  }
  expect(() => getAvailability(hotelId, { ...stay, checkOut: stay.checkIn })).toThrow()
  expect(fetcher).not.toHaveBeenCalled()
})
it('reads paginated management bookings and filters from the server', async () => {
  response({ content: [], page: 0, size: 10, totalElements: 0, totalPages: 0, first: true, last: true })
  const { listBookings } = await import('./booking-api')
  await listBookings({ page: 0, size: 10, status: 'CONFIRMED' }, hotelId)
  expect(fetcher.mock.calls[0][0]).toBe(`/api/v1/management/hotels/${hotelId}/bookings?page=0&size=10&status=CONFIRMED`)
})
it('propagates price conflicts rather than reporting a successful order', async () => {
  fetcher.mockResolvedValue(new Response(JSON.stringify({ code: 'QUOTE_CHANGED', detail: 'Giá đã thay đổi.' }), { status: 409 }))
  const { createBooking } = await import('./booking-api')
  await expect(createBooking(hotelId, input, booker, 2050000)).rejects.toMatchObject({ status: 409, code: 'QUOTE_CHANGED' })
  expect(fetcher).toHaveBeenCalledTimes(1)
})
it('sends physical assignment IDs and respects the activeAssignments response contract', async () => {
  const demoRoomId = '47a5fc05-f674-bba7-66ff-c6965488b21b'
  response({ hotelId, bookingId: roomId, activeAssignments: [{ roomId: demoRoomId }], history: [{ roomId: demoRoomId }] })
  const { assignBookingRooms } = await import('./booking-api')
  const assignments = [{ bookingItemId: hotelId, roomIds: [demoRoomId] }]
  const result = await assignBookingRooms(hotelId, roomId, assignments, 'Đổi phòng')
  expect(result.activeAssignments).toEqual([{ roomId: demoRoomId }])
  expect(result.history).toEqual([{ roomId: demoRoomId }])
  expect(fetcher.mock.calls[0][1]?.method).toBe('PUT')
  expect(JSON.parse(fetcher.mock.calls[0][1]?.body as string)).toEqual({ assignments, reason: 'Đổi phòng' })
})
