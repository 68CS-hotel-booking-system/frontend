import { z } from 'zod'
import { ApiError } from '@/shared/api/api-error'

export const reviewStatusSchema = z.enum(['PENDING', 'APPROVED', 'REJECTED'])
export type ReviewStatus = z.infer<typeof reviewStatusSchema>
const nullableText = z.string().nullable()
const amenity = z.object({ id: z.string().uuid(), name: z.string() })
const customAmenity = amenity.extend({ description: nullableText, attached: z.boolean() })
export const reviewSnapshotSchema = z.object({
  hotel: z.object({
    id: z.string().uuid(), ownerId: z.string().uuid(), cityId: z.string().uuid(),
    name: z.string(), address: z.string(), description: nullableText,
    contactPhone: nullableText, contactEmail: nullableText,
    latitude: z.number().nullable(), longitude: z.number().nullable(), starRating: z.number().nullable(),
    checkInTime: z.string(), checkOutTime: z.string(), version: z.number().int().nonnegative(),
  }),
  amenities: z.array(amenity), customAmenities: z.array(customAmenity),
  roomTypes: z.array(z.object({
    roomType: z.object({ id: z.string().uuid(), name: z.string(), description: nullableText,
      maxAdults: z.number(), maxChildren: z.number(), maxOccupancy: z.number(), basePrice: z.number(), active: z.boolean() }),
    amenities: z.array(amenity),
  })),
  rooms: z.array(z.object({ id: z.string().uuid(), roomTypeId: z.string().uuid(), roomNumber: z.string(), floor: nullableText,
    operationalFrom: z.string(), operationalUntil: nullableText, amenities: z.array(amenity), customAmenities: z.array(customAmenity) })),
  images: z.array(z.object({ mediaId: z.string().uuid(), albumId: z.string().uuid().nullable(), sortOrder: z.number(), cover: z.boolean(), altText: nullableText })),
  albums: z.array(z.object({ id: z.string().uuid(), name: z.string(), description: nullableText, sortOrder: z.number() })),
})
const reviewMetadataSchema = z.object({
  id: z.string().uuid(), hotelId: z.string().uuid(), status: reviewStatusSchema,
  submittedBy: z.string().uuid(), submittedAt: z.string(), reviewedBy: z.string().uuid().nullable(),
  reviewedAt: nullableText, reason: nullableText, version: z.number().int().nonnegative(),
})
export const reviewRequestSchema = reviewMetadataSchema.extend({ snapshot: reviewSnapshotSchema })
export const reviewSummarySchema = reviewMetadataSchema.extend({ hotelName: z.string() })
export const reviewPageSchema = z.object({ content: z.array(reviewSummarySchema), page: z.number().int(), size: z.number().int(), totalElements: z.number().int().nonnegative(), totalPages: z.number().int() })
export type ReviewRequest = z.infer<typeof reviewRequestSchema>
export type ReviewSummary = z.infer<typeof reviewSummarySchema>
export type ReviewSnapshot = z.infer<typeof reviewSnapshotSchema>
export interface ReviewListQuery { status?: ReviewStatus; hotelId?: string; page: number; size: number }
export const rejectionSchema = z.object({ reason: z.string().trim().min(1, 'Nhập lý do từ chối để Owner biết cần bổ sung gì.') })
export const reviewStatusLabels: Record<ReviewStatus, string> = { PENDING: 'Chờ duyệt', APPROVED: 'Đã duyệt', REJECTED: 'Bị từ chối' }
export function reviewDate(value: string | null) {
  return value ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)) : '—'
}
export function reviewErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 409) return `${error.message} Hãy kiểm tra lại nội dung hồ sơ trước khi thao tác tiếp.`
    return [error.message, ...error.errors.map((item) => item.message)].join(' ')
  }
  return 'Không thể hoàn tất yêu cầu. Vui lòng thử lại.'
}
