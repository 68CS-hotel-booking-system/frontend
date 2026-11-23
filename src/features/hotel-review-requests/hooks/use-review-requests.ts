import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSessionIdentity } from '@/shared/hooks/use-session-identity'
import { ApiError } from '@/shared/api/api-error'
import { getHotelPublishReadiness, decideHotelReview, getAdminReviewRequests, getHotelReviewRequests, getReviewRequest, submitHotelReview } from '../api/review-requests-api'
import type { ReviewListQuery, ReviewRequest } from '../model/review-request'

export const reviewKeys = {
  all: ['hotel-review-requests'] as const,
  hotel: (hotelId: string, page: number, size: number, identity?: string | null) =>
    identity ? (['hotel-review-requests', 'hotel', hotelId, page, size, identity] as const) : (['hotel-review-requests', 'hotel', hotelId, page, size] as const),
  admin: (query: ReviewListQuery, identity?: string | null) =>
    identity ? (['hotel-review-requests', 'admin', query, identity] as const) : (['hotel-review-requests', 'admin', query] as const),
  detail: (id: string, identity?: string | null) =>
    identity ? (['hotel-review-requests', 'detail', id, identity] as const) : (['hotel-review-requests', 'detail', id] as const),
}
export function useHotelReviewRequests(hotelId: string, page = 0, size = 10, enabled = true) {
  const identity = useSessionIdentity()
  return useQuery({ queryKey: reviewKeys.hotel(hotelId, page, size, identity), queryFn: ({ signal }) => getHotelReviewRequests(hotelId, page, size, signal), enabled: Boolean(hotelId) && enabled, retry: false, refetchOnWindowFocus: true, refetchInterval: size === 1 ? 15000 : false })
}
export function useAdminReviewRequests(query: ReviewListQuery, enabled: boolean) {
  const identity = useSessionIdentity()
  return useQuery({ queryKey: reviewKeys.admin(query, identity), queryFn: ({ signal }) => getAdminReviewRequests(query, signal), enabled, retry: false, refetchInterval: 15000 })
}
export function useReviewRequest(id: string | null) {
  const identity = useSessionIdentity()
  return useQuery({ queryKey: reviewKeys.detail(id ?? '', identity), queryFn: ({ signal }) => getReviewRequest(id!, signal), enabled: Boolean(id), retry: false, staleTime: 0 })
}
export function useReviewMutations() {
  const client = useQueryClient()
  const refresh = async () => {
    await Promise.all([
      client.invalidateQueries({ queryKey: reviewKeys.all }),
      client.invalidateQueries({ queryKey: ['hotels'] }),
      client.invalidateQueries({ queryKey: ['hotel-publish-readiness'] }),
    ])
  }
  const success = async (review: ReviewRequest) => {
    client.setQueryData(reviewKeys.detail(review.id), review)
    await refresh()
  }
  const conflict = async (error: unknown) => { if (error instanceof ApiError && error.status === 409) await refresh() }
  const submit = useMutation({ mutationFn: ({ hotelId, expectedVersion }: { hotelId: string; expectedVersion: number }) => submitHotelReview(hotelId, expectedVersion), retry: false, onSuccess: success, onError: conflict })
  const decide = useMutation({ mutationFn: ({ requestId, decision, expectedVersion, reason }: { requestId: string; decision: 'approve' | 'reject'; expectedVersion: number; reason?: string }) => decideHotelReview(requestId, decision, expectedVersion, reason), retry: false, onSuccess: success, onError: conflict })
  return { submit, decide }
}

export function useHotelPublishReadiness(hotelId: string) {
  return useQuery({ queryKey: ['hotel-publish-readiness', hotelId], queryFn: ({ signal }) => getHotelPublishReadiness(hotelId, signal), enabled: Boolean(hotelId), retry: false, staleTime: 0, refetchInterval: 15000 })
}
