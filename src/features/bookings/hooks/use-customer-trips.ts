import { useInfiniteQuery } from '@tanstack/react-query'
import { useSessionIdentity } from '@/shared/hooks/use-session-identity'
import { listBookings } from '../api/booking-api'
import { bookingKeys } from './use-bookings'

export const tripGroups = {
  upcoming: ['PENDING_PAYMENT', 'CONFIRMED', 'CHECKED_IN'],
  completed: ['CHECKED_OUT', 'NO_SHOW'],
  cancelled: ['CANCELLED', 'EXPIRED'],
} as const

export function useCustomerTrips(statuses: readonly string[], enabled = true) {
  const identity = useSessionIdentity()
  return useInfiniteQuery({
    queryKey: bookingKeys.trips(statuses, identity),
    initialPageParam: statuses.map(status => ({ status, page: 0, size: 10 })),
    queryFn: ({ pageParam, signal }) => Promise.all(pageParam.map(async params => ({
      params,
      result: await listBookings(params, undefined, signal),
    }))),
    getNextPageParam: last => {
      const next = last.flatMap(({ params, result }) => result.last ? [] : [{ ...params, page: result.page + 1 }])
      return next.length ? next : undefined
    },
    enabled,
    retry: false,
  })
}
