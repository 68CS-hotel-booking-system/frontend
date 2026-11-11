import { z } from 'zod'
import { http } from '@/shared/api/http'
import { hotelResponseSchema } from './hotel-contract'
import { amenitySchema } from '../model/hotel'

export const hotelReviewStatusSchema = z.enum(['PENDING', 'APPROVED', 'REJECTED'])
export type HotelReviewStatus = z.infer<typeof hotelReviewStatusSchema>

const customAmenity = z.object({
  id: z.string().uuid(), name: z.string(), description: z.string().nullable(), attached: z.boolean(),
})
const roomType = z.object({
  id: z.string().uuid(), hotelId: z.string().uuid(), name: z.string(), description: z.string().nullable(),
  maxAdults: z.number(), maxChildren: z.number(), maxOccupancy: z.number(), basePrice: z.number(), active: z.boolean(),
})
export const hotelReviewSnapshotSchema = z.object({
  hotel: hotelResponseSchema,
  amenities: z.array(amenitySchema), customAmenities: z.array(customAmenity),
  roomTypes: z.array(z.object({ roomType, amenities: z.array(amenitySchema) })),
  rooms: z.array(z.object({
    id: z.guid(), roomTypeId: z.string().uuid(), roomNumber: z.string(), floor: z.string().nullable(),
    operationalFrom: z.string(), operationalUntil: z.string().nullable(),
    amenities: z.array(amenitySchema), customAmenities: z.array(customAmenity),
  })),
  images: z.array(z.object({
    mediaId: z.string().uuid(), albumId: z.string().uuid().nullable(), sortOrder: z.number(), cover: z.boolean(), altText: z.string().nullable(),
  })),
  albums: z.array(z.object({ id: z.string().uuid(), name: z.string(), description: z.string().nullable(), sortOrder: z.number() })),
})
export type HotelReviewSnapshot = z.infer<typeof hotelReviewSnapshotSchema>

export const hotelReviewSummarySchema = z.object({
  id: z.string().uuid(), hotelId: z.string().uuid(), hotelName: z.string().nullable().optional(), status: hotelReviewStatusSchema,
  submittedBy: z.string().uuid(), submittedAt: z.string(), reviewedBy: z.string().uuid().nullable(),
  reviewedAt: z.string().nullable(), reason: z.string().nullable(), version: z.number().int().nonnegative(),
})
export const hotelReviewSchema = hotelReviewSummarySchema.extend({ snapshot: hotelReviewSnapshotSchema })
export type HotelReviewSummary = z.infer<typeof hotelReviewSummarySchema>
export type HotelReview = z.infer<typeof hotelReviewSchema>
export const hotelReviewPageSchema = z.object({
  content: z.array(hotelReviewSummarySchema), page: z.number().int().nonnegative(), size: z.number().int().positive(),
  totalElements: z.number().int().nonnegative(), totalPages: z.number().int().nonnegative(), first: z.boolean(), last: z.boolean(),
})
export interface HotelReviewsQuery { page?: number; size?: number; status?: HotelReviewStatus; hotelId?: string }
export const rejectHotelReviewSchema = z.object({ reason: z.string().trim().min(1, 'Nhập lý do từ chối hồ sơ.') })

function pagination(query: HotelReviewsQuery) {
  return new URLSearchParams({ page: String(query.page ?? 0), size: String(query.size ?? 20) })
}

export function submitHotelReview(hotelId: string, expectedVersion: number, signal?: AbortSignal) {
  return http.request(`/management/hotels/${encodeURIComponent(hotelId)}/review-requests`, {
    method: 'POST', body: { expectedVersion }, signal, schema: hotelReviewSchema,
  })
}
export function getManagementHotelReviews(hotelId: string, query: HotelReviewsQuery = {}, signal?: AbortSignal) {
  return http.request(`/management/hotels/${encodeURIComponent(hotelId)}/review-requests?${pagination(query)}`, {
    signal, schema: hotelReviewPageSchema,
  })
}
export function getAdminHotelReviews(query: HotelReviewsQuery = {}, signal?: AbortSignal) {
  const params = pagination(query)
  if (query.status) params.set('status', query.status)
  if (query.hotelId) params.set('hotelId', query.hotelId)
  return http.request(`/admin/hotel-review-requests?${params}`, { signal, schema: hotelReviewPageSchema })
}
export function getHotelReview(requestId: string, signal?: AbortSignal) {
  return http.request(`/hotel-review-requests/${encodeURIComponent(requestId)}`, { signal, schema: hotelReviewSchema })
}
export function approveHotelReview(requestId: string, expectedVersion: number, signal?: AbortSignal) {
  return http.request(`/admin/hotel-review-requests/${encodeURIComponent(requestId)}/approve`, {
    method: 'POST', body: { expectedVersion }, signal, schema: hotelReviewSchema,
  })
}
export function rejectHotelReview(requestId: string, expectedVersion: number, reason: string, signal?: AbortSignal) {
  return http.request(`/admin/hotel-review-requests/${encodeURIComponent(requestId)}/reject`, {
    method: 'POST', body: { expectedVersion, ...rejectHotelReviewSchema.parse({ reason }) }, signal, schema: hotelReviewSchema,
  })
}
