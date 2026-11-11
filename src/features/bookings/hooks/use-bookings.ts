import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getBooking, listBookings, type BookingListParams } from '../api/booking-api'

export const bookingKeys = { all: ['bookings'] as const, list: (hotelId?: string) => ['bookings', 'list', hotelId ?? 'mine'] as const }
export function useBookings(params: BookingListParams, hotelId?: string) {
  return useQuery({ queryKey: [...bookingKeys.list(hotelId), params], queryFn: ({ signal }) => listBookings(params, hotelId, signal), retry: false })
}
export function useBooking(bookingId?: string, hotelId?: string) {
  return useQuery({ queryKey: ['bookings', 'detail', hotelId ?? 'mine', bookingId],
    queryFn: ({ signal }) => getBooking(bookingId!, hotelId, signal), enabled: Boolean(bookingId), retry: false })
}
export function useBookingAction<T>(action: (payload: T) => Promise<unknown>) {
  const client = useQueryClient()
  return useMutation({ mutationFn: action, retry: false, onSuccess: async () => {
    await client.invalidateQueries({ queryKey: bookingKeys.all })
    await client.invalidateQueries({ queryKey: ['rooms'] })
  } })
}
