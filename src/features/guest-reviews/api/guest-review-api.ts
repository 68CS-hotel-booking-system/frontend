import { z } from 'zod'
import { http } from '@/shared/api/http'

const count = z.number().int().nonnegative().safe()
const rating = z.number().int().min(1).max(5)
const timestamp = z.iso.datetime({ offset: true })
export const publicGuestReviewSchema = z.object({ id: z.uuid(), authorDisplayName: z.string(), rating, content: z.string(), createdAt: timestamp, reply: z.string().nullable(), repliedAt: timestamp.nullable() })
export const guestReviewSchema = publicGuestReviewSchema.extend({ bookingId: z.uuid(), hotelId: z.uuid(), bookingCode: z.string(), version: count, canReply: z.boolean() })
export const bookingReviewSchema = z.object({ canReview: z.boolean(), message: z.string(), review: guestReviewSchema.nullable() })
const summary = z.object({ totalReviews: count, averageRating: z.number().min(1).max(5).nullable(), ratingCounts: z.array(z.object({ rating, count })) })
const page = <T extends z.ZodType>(schema: T) => z.object({ content: z.array(schema), page: count, size: count, totalElements: count, totalPages: count, first: z.boolean(), last: z.boolean() })
export const publicReviewPageSchema = z.object({ reviews: page(publicGuestReviewSchema), summary })
export const managedReviewPageSchema = z.object({ reviews: page(guestReviewSchema), summary })
const content = z.string().trim().min(1, 'Nhập nội dung nhận xét.').max(2000, 'Nội dung tối đa 2000 ký tự.')
export const reviewFormSchema = z.object({ rating: rating.min(1, 'Chọn điểm từ 1 đến 5 sao.'), content })
export const replyFormSchema = z.object({ content })
export type ReviewValues = z.infer<typeof reviewFormSchema>
export type ReplyValues = z.infer<typeof replyFormSchema>
export type PublicGuestReview = z.infer<typeof publicGuestReviewSchema>
export type GuestReview = z.infer<typeof guestReviewSchema>
export interface ReviewParams { page: number; size: number; rating?: number; replied?: boolean }
function queryString(params: ReviewParams) {
  const query = new URLSearchParams({ page: String(params.page), size: String(params.size) })
  if (params.rating !== undefined) query.set('rating', String(rating.parse(params.rating)))
  if (params.replied !== undefined) query.set('replied', String(params.replied))
  return query
}
export function getBookingReview(bookingId: string, signal?: AbortSignal) {
  return http.request(`/bookings/${encodeURIComponent(bookingId)}/review`, { signal, schema: bookingReviewSchema })
}
export function submitGuestReview(bookingId: string, values: ReviewValues) {
  return http.request(`/bookings/${encodeURIComponent(bookingId)}/review`, { method: 'POST', body: reviewFormSchema.parse(values), schema: guestReviewSchema })
}
export function listPublicGuestReviews(hotelId: string, params: ReviewParams, signal?: AbortSignal) {
  return http.request(`/hotels/${encodeURIComponent(hotelId)}/guest-reviews?${queryString({ ...params, replied: undefined })}`, { signal, schema: publicReviewPageSchema })
}
export function listManagedGuestReviews(hotelId: string, params: ReviewParams, signal?: AbortSignal) {
  return http.request(`/management/hotels/${encodeURIComponent(hotelId)}/guest-reviews?${queryString(params)}`, { signal, schema: managedReviewPageSchema })
}
export function replyGuestReview(hotelId: string, reviewId: string, values: ReplyValues, expectedVersion: number) {
  return http.request(`/management/hotels/${encodeURIComponent(hotelId)}/guest-reviews/${encodeURIComponent(reviewId)}/reply`, {
    method: 'PUT', body: { ...replyFormSchema.parse(values), expectedVersion: count.parse(expectedVersion) }, schema: guestReviewSchema })
}
