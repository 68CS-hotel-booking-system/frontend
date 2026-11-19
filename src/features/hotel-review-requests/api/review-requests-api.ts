import { http } from '@/shared/api/http'
import { z } from 'zod'
import { reviewPageSchema, reviewRequestSchema, rejectionSchema, type ReviewListQuery } from '../model/review-request'

export function getHotelReviewRequests(hotelId: string, page = 0, size = 10, signal?: AbortSignal) {
  return http.request(`/management/hotels/${encodeURIComponent(hotelId)}/review-requests?page=${page}&size=${size}`, { signal, schema: reviewPageSchema })
}
export function getAdminReviewRequests(query: ReviewListQuery, signal?: AbortSignal) {
  const params = new URLSearchParams({ page: String(query.page), size: String(query.size) })
  if (query.status) params.set('status', query.status)
  if (query.hotelId) params.set('hotelId', query.hotelId)
  return http.request(`/admin/hotel-review-requests?${params}`, { signal, schema: reviewPageSchema })
}
export function getReviewRequest(requestId: string, signal?: AbortSignal) {
  return http.request(`/hotel-review-requests/${encodeURIComponent(requestId)}`, { signal, schema: reviewRequestSchema })
}
export function submitHotelReview(hotelId: string, expectedVersion: number, signal?: AbortSignal) {
  return http.request(`/management/hotels/${encodeURIComponent(hotelId)}/review-requests`, { method: 'POST', body: { expectedVersion }, signal, schema: reviewRequestSchema })
}
export function decideHotelReview(requestId: string, decision: 'approve' | 'reject', expectedVersion: number, reason?: string, signal?: AbortSignal) {
  const body = decision === 'reject' ? { expectedVersion, ...rejectionSchema.parse({ reason }) } : { expectedVersion }
  return http.request(`/admin/hotel-review-requests/${encodeURIComponent(requestId)}/${decision}`, { method: 'POST', body, signal, schema: reviewRequestSchema })
}
const mediaAccessSchema = z.object({ url: z.string() })
export function getReviewImageAccess(mediaId: string, signal?: AbortSignal) {
  return http.request(`/media/${encodeURIComponent(mediaId)}/access`, { signal, schema: mediaAccessSchema })
}

export const publishReadinessSchema = z.object({ hotelId: z.string().uuid(), ready: z.boolean(), operationalRoomCount: z.number().int().nonnegative(), checkedAt: z.string(), unmetRequirements: z.array(z.object({ field: z.string(), message: z.string() })) })
export function getHotelPublishReadiness(hotelId: string, signal?: AbortSignal) {
  return http.request(`/management/hotels/${encodeURIComponent(hotelId)}/publish-readiness`, { signal, schema: publishReadinessSchema })
}
