import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSessionIdentity } from '@/shared/hooks/use-session-identity'
import { getBooking, listBookings, type BookingListParams } from '../api/booking-api'

export const bookingKeys = {
  all: ['bookings'] as const,
  list: (hotelId?: string, identity: string | null = null) => ['bookings', 'list', hotelId ?? 'mine', identity] as const,
  detail: (bookingId?: string, hotelId?: string, identity: string | null = null) => ['bookings', 'detail', hotelId ?? 'mine', identity, bookingId] as const,
  trips: (statuses: readonly string[], identity: string | null = null) => ['bookings', 'list', 'mine', identity, 'trips', statuses] as const,
}
export function useBookings(params: BookingListParams, hotelId?: string) {
  const identity = useSessionIdentity()
  return useQuery({ queryKey: [...bookingKeys.list(hotelId, identity), params], queryFn: ({ signal }) => listBookings(params, hotelId, signal), retry: false })
}
export function useBooking(bookingId?: string, hotelId?: string) {
  const identity = useSessionIdentity()
  return useQuery({ queryKey: bookingKeys.detail(bookingId, hotelId, identity),
    queryFn: ({ signal }) => getBooking(bookingId!, hotelId, signal), enabled: Boolean(bookingId), retry: false })
}
export function useBookingAction<T, Result>(action: (payload: T) => Promise<Result>) {
  const client = useQueryClient()
  return useMutation({ mutationFn: (payload: T) => action(payload), retry: false, onSuccess: async () => {
    await client.invalidateQueries({ queryKey: bookingKeys.all })
    await client.invalidateQueries({ queryKey: ['rooms'] })
  } })
}
