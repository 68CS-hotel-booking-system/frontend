import { useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { ApiError } from '@/shared/api/api-error'
import { createBooking, getAvailability, quoteStay, stayFormSchema, type BookerForm, type StayForm } from '../api/booking-api'

export function stayKey(stay: StayForm) {
  return JSON.stringify([stay.checkIn, stay.checkOut, stay.adults, stay.children, stay.quantity])
}
export function useBookingCheckout(hotelId: string, stay: StayForm) {
  const [roomTypeId, setRoomTypeId] = useState('')
  const [uncertain, setUncertain] = useState(false)
  const inFlight = useRef(false)
  const validation = stayFormSchema.safeParse(stay)
  const signature = stayKey(stay)
  const availability = useMutation({ mutationFn: (value: StayForm) => getAvailability(hotelId, value), retry: false })
  const checked = availability.data && availability.variables && stayKey(availability.variables) === signature ? availability.data : undefined
  const selected = checked?.roomTypes.find((room) => room.roomTypeId === roomTypeId && room.isAvailable)
  const quote = useMutation({ mutationFn: async (value: StayForm) => {
    const input = { checkIn: value.checkIn, checkOut: value.checkOut,
      items: [{ roomTypeId, quantity: value.quantity, adults: value.adults, children: value.children }] }
    return { input, signature: stayKey(value), roomTypeId, quote: await quoteStay(hotelId, input) }
  }, retry: false })
  const currentQuote = selected && quote.data?.signature === signature && quote.data.roomTypeId === roomTypeId ? quote.data : undefined
  const create = useMutation({ mutationFn: (booker: BookerForm) => {
    if (!currentQuote || !selected) throw new Error('Cần lấy lại báo giá cho lựa chọn hiện tại.')
    return createBooking(hotelId, currentQuote.input, booker, currentQuote.quote.totalAmount)
  }, retry: false })
  async function submit(booker: BookerForm) {
    if (inFlight.current || !currentQuote || create.data || uncertain) return
    inFlight.current = true
    try { return await create.mutateAsync(booker) } catch (error) {
      if (error instanceof ApiError && (error.kind === 'network' || error.kind === 'timeout' || error.status >= 500)) setUncertain(true)
      quote.reset()
      throw error
    } finally { inFlight.current = false }
  }
  return { validation, availability, checked, selected, roomTypeId,
    selectRoom: (id: string) => { setRoomTypeId(id); quote.reset() },
    quote, currentQuote, create, submit, uncertain,
    busy: create.isPending || Boolean(create.data) || uncertain,
  }
}
