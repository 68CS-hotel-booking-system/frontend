import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  approveHotelReview, getAdminHotelReviews, getHotelReview, getManagementHotelReviews,
  rejectHotelReview, submitHotelReview, type HotelReviewsQuery,
} from '../api/hotel-review-api'
import { hotelManagementKeys } from './hotel-query-keys'

export const hotelReviewKeys = {
  all: ['hotel-reviews'] as const,
  management: (hotelId: string, page = 0, size = 1) => ['hotel-reviews', 'management', hotelId, page, size] as const,
  admin: (query: HotelReviewsQuery) => ['hotel-reviews', 'admin', query] as const,
  detail: (id: string) => ['hotel-reviews', 'detail', id] as const,
}
export function useLatestHotelReview(hotelId: string, enabled = true) {
  return useQuery({
    queryKey: hotelReviewKeys.management(hotelId),
    queryFn: ({ signal }) => getManagementHotelReviews(hotelId, { page: 0, size: 1 }, signal),
    enabled: Boolean(hotelId) && enabled, retry: false, staleTime: 10_000,
    refetchInterval: (query) => query.state.data?.content[0]?.status === 'PENDING' ? 15_000 : false,
  })
}
export function useAdminHotelReviews(query: HotelReviewsQuery, enabled = true) {
  return useQuery({ queryKey: hotelReviewKeys.admin(query), queryFn: ({ signal }) => getAdminHotelReviews(query, signal), enabled, retry: false })
}
export function useHotelReview(requestId: string) {
  return useQuery({ queryKey: hotelReviewKeys.detail(requestId), queryFn: ({ signal }) => getHotelReview(requestId, signal), enabled: Boolean(requestId), retry: false })
}
function useInvalidateReviews() {
  const client = useQueryClient()
  return async () => {
    await Promise.all([
      client.invalidateQueries({ queryKey: hotelReviewKeys.all }),
      client.invalidateQueries({ queryKey: hotelManagementKeys.all }),
      client.invalidateQueries({ queryKey: ['discovery'] }),
    ])
  }
}
export function useSubmitHotelReview() {
  const refresh = useInvalidateReviews()
  return useMutation({
    mutationFn: ({ hotelId, expectedVersion }: { hotelId: string; expectedVersion: number }) => submitHotelReview(hotelId, expectedVersion),
    retry: false, onSettled: refresh,
  })
}
type ReviewDecision = { requestId: string; expectedVersion: number } & (
  { action: 'approve' } | { action: 'reject'; reason: string }
)
export function useHotelReviewDecision() {
  const refresh = useInvalidateReviews()
  return useMutation({
    mutationFn: (decision: ReviewDecision) => decision.action === 'approve'
      ? approveHotelReview(decision.requestId, decision.expectedVersion)
      : rejectHotelReview(decision.requestId, decision.expectedVersion, decision.reason),
    retry: false, onSettled: refresh,
  })
}
