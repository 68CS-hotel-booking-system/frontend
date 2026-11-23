import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError } from '@/shared/api/api-error'
import { getSession } from '@/shared/api/session'
import { createBooking, getAvailability, quoteStay, type BookerForm } from '../api/booking-api'
import { bookingIntentSignature, resolveBookingIdempotencyKey, type BookingIdempotencyState } from '../model/booking-idempotency'
import { quoteFingerprint, type CheckoutQuote, type CheckoutSelection } from '../model/client-checkout'

export function useClientCheckout(selection: CheckoutSelection, customerId: string, initialPrice?: { totalAmount: number; currency: string }) {
  const client = useQueryClient()
  const inFlight = useRef(false)
  const idempotencyRef = useRef<BookingIdempotencyState | null>(null)
  const [replacement, setReplacement] = useState<CheckoutQuote>()
  const [accepted, setAccepted] = useState<string>()
  const [conflict, setConflict] = useState(false)
  const [unavailable, setUnavailable] = useState(false)
  const [uncertain, setUncertain] = useState(false)
  const availability = useQuery({ queryKey: ['bookings', 'checkout-availability', selection.hotelId, selection.stay], queryFn: ({ signal }) => getAvailability(selection.hotelId, selection.stay, signal), retry: false })
  const available = !unavailable && !availability.isError && !availability.isFetching && Boolean(availability.data?.roomTypes.some(room => room.roomTypeId === selection.roomTypeId && room.isAvailable))
  const quote = useQuery({ queryKey: ['bookings', 'checkout-quote', selection.hotelId, selection.input], queryFn: ({ signal }) => quoteStay(selection.hotelId, selection.input, signal), enabled: available, retry: false, staleTime: Infinity, refetchOnMount: 'always', refetchOnWindowFocus: false, refetchOnReconnect: false })
  const current = replacement ?? quote.data
  const fingerprint = current ? quoteFingerprint(current) : undefined
  const priceChanged = conflict || Boolean(current && initialPrice && (initialPrice.totalAmount !== current.totalAmount || initialPrice.currency !== current.currency))
  const needsAcceptance = priceChanged && accepted !== fingerprint
  const submit = useMutation({ retry: false, mutationFn: async ({ booker, guest }: { booker: BookerForm; guest?: BookerForm }) => {
    const actorToken = getSession()?.accessToken
    if (!current || !available || quote.isFetching || quote.isError || needsAcceptance) throw new Error('Cần kiểm tra và xác nhận báo giá hiện tại.')
    const pendingRetrySignature = uncertain
      ? bookingIntentSignature({ hotelId: selection.hotelId, input: selection.input, booker, guest, quotedTotalAmount: current.totalAmount })
      : null
    const isRetryingUncertainIntent = Boolean(pendingRetrySignature && idempotencyRef.current?.signature === pendingRetrySignature)

    let quotedTotalAmount = current.totalAmount
    if (!isRetryingUncertainIntent) {
      const stock = await getAvailability(selection.hotelId, selection.stay)
      if (!stock.roomTypes.some(room => room.roomTypeId === selection.roomTypeId && room.isAvailable)) {
        setUnavailable(true)
        throw new ApiError('Phòng đã chọn không còn phù hợp. Vui lòng quay lại chọn phòng khác.', { kind: 'http', status: 409, code: 'ROOM_UNAVAILABLE' })
      }
      const latest = await quoteStay(selection.hotelId, selection.input)
      if (quoteFingerprint(latest) !== quoteFingerprint(current)) {
        setReplacement(latest); setAccepted(undefined); setConflict(true)
        return undefined
      }
      quotedTotalAmount = latest.totalAmount
    }
    // A logout/account switch during verification must not create an order as a different user.
    if (!actorToken || getSession()?.accessToken !== actorToken) throw new ApiError('Phiên đăng nhập đã thay đổi. Vui lòng tải lại trang để kiểm tra tài khoản trước khi đặt phòng.', { kind: 'http', status: 401, code: 'CHECKOUT_SESSION_CHANGED' })
    const idempotencyKey = resolveBookingIdempotencyKey(idempotencyRef, {
      hotelId: selection.hotelId,
      input: selection.input,
      booker,
      guest,
      quotedTotalAmount,
    })
    try {
      const booking = await createBooking(selection.hotelId, selection.input, booker, quotedTotalAmount, undefined, guest, idempotencyKey)
      idempotencyRef.current = null
      setUncertain(false)
      client.setQueryData(['bookings', 'client-confirmation', customerId, booking.id], booking)
      void client.invalidateQueries({ queryKey: ['bookings', 'list'] })
      void client.invalidateQueries({ queryKey: ['discovery', 'availability', selection.hotelId] })
      void client.invalidateQueries({ queryKey: ['bookings', 'checkout-availability', selection.hotelId] })
      return booking
    } catch (error) {
      if (error instanceof ApiError && (error.code === 'PRICE_CHANGED' || error.code === 'QUOTE_CHANGED')) {
        idempotencyRef.current = null
        setUncertain(false)
        setConflict(true); setAccepted(undefined)
        const updated = await quoteStay(selection.hotelId, selection.input)
        setReplacement(updated)
        return undefined
      }
      if (error instanceof ApiError && error.status === 409) {
        idempotencyRef.current = null
        setUncertain(false)
      }
      if (!(error instanceof ApiError) || ['network', 'timeout', 'invalid-response'].includes(error.kind) || error.status >= 500) setUncertain(true)
      throw error
    }
  } })
  async function reserve(contacts: { booker: BookerForm; guest?: BookerForm }) {
    if (inFlight.current || submit.data) return
    inFlight.current = true
    try { return await submit.mutateAsync(contacts) } finally { inFlight.current = false }
  }
  return { availability, available, quote, current, submit, reserve, uncertain, priceChanged, needsAcceptance, acceptPrice: (value: boolean) => setAccepted(value ? fingerprint : undefined) }
}
