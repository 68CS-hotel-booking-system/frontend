import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSessionIdentity } from '@/shared/hooks/use-session-identity'
import { getBookingReview, listPublicGuestReviews, listManagedGuestReviews, submitGuestReview, replyGuestReview, type ReviewParams, type ReviewValues, type ReplyValues } from '../api/guest-review-api'

export const guestReviewKeys = {
  booking: (identity: string | null, bookingId: string) => ['guest-reviews', 'booking', identity, bookingId] as const,
  public: (hotelId: string) => ['guest-reviews', 'public', hotelId] as const,
  management: (identity: string | null, hotelId: string) => ['guest-reviews', 'management', identity, hotelId] as const,
}
export function useBookingReview(bookingId: string) {
  const identity = useSessionIdentity()
  return useQuery({ queryKey: guestReviewKeys.booking(identity, bookingId), queryFn: ({ signal }) => getBookingReview(bookingId, signal), enabled: Boolean(identity && bookingId), retry: false, refetchOnWindowFocus: false, refetchOnReconnect: false })
}
export function usePublicGuestReviews(hotelId: string, params: ReviewParams) {
  return useQuery({ queryKey: [...guestReviewKeys.public(hotelId), params], queryFn: ({ signal }) => listPublicGuestReviews(hotelId, params, signal), enabled: Boolean(hotelId), retry: false })
}
export function useManagedGuestReviews(hotelId: string, params: ReviewParams) {
  const identity = useSessionIdentity()
  return useQuery({ queryKey: [...guestReviewKeys.management(identity, hotelId), params], queryFn: ({ signal }) => listManagedGuestReviews(hotelId, params, signal), enabled: Boolean(identity && hotelId), retry: false, refetchOnWindowFocus: false, refetchOnReconnect: false })
}
export function useSubmitGuestReview(bookingId: string) {
  const identity = useSessionIdentity()
  const client = useQueryClient()
  return useMutation({ mutationFn: (values: ReviewValues) => submitGuestReview(bookingId, values), retry: false, onSuccess: async review => {
    client.setQueryData(guestReviewKeys.booking(identity, bookingId), { canReview: false, message: 'Bạn đã đánh giá đơn này.', review })
    await client.invalidateQueries({ queryKey: guestReviewKeys.public(review.hotelId) })
    await client.invalidateQueries({ queryKey: ['guest-reviews', 'management'] })
  } })
}
export function useReplyGuestReview(hotelId: string, reviewId: string) {
  const identity = useSessionIdentity()
  const client = useQueryClient()
  return useMutation({ mutationFn: ({ values, version }: { values: ReplyValues; version: number }) => replyGuestReview(hotelId, reviewId, values, version), retry: false,
    onSuccess: async () => {
      await Promise.all([client.invalidateQueries({ queryKey: guestReviewKeys.management(identity, hotelId) }), client.invalidateQueries({ queryKey: guestReviewKeys.public(hotelId) }), client.invalidateQueries({ queryKey: ['guest-reviews', 'booking', identity] })])
    } })
}
