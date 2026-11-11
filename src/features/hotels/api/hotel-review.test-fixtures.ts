import type { HotelReview } from './hotel-review-api'

export const reviewOwnerId = '22222222-2222-4222-8222-222222222222'
export const reviewAdminId = '33333333-3333-4333-8333-333333333333'
export const reviewHotel = {
  id: '11111111-1111-4111-8111-111111111111', ownerId: reviewOwnerId,
  cityId: '822cafba-73f6-4ec0-bae7-71804535cae3', name: 'Khách sạn Biển Xanh', slug: 'bien-xanh',
  description: 'Mô tả tại thời điểm gửi', address: '12 Võ Nguyên Giáp', contactPhone: '+84912345678', contactEmail: null,
  latitude: null, longitude: null, starRating: 4, checkInTime: '14:00:00', checkOutTime: '12:00:00',
  status: 'DRAFT' as const, version: 3, createdAt: '2026-11-11T08:00:00Z', updatedAt: '2026-11-11T08:00:00Z',
}
export const submittedReview: HotelReview = {
  id: '44444444-4444-4444-8444-444444444444', hotelId: reviewHotel.id,
  status: 'PENDING', submittedBy: reviewOwnerId, submittedAt: '2026-11-11T09:00:00Z',
  reviewedBy: null, reviewedAt: null, reason: null, version: 0,
  snapshot: { hotel: reviewHotel, amenities: [], customAmenities: [], roomTypes: [], rooms: [], images: [], albums: [] },
}
export function reviewPage(reviews: Array<Partial<HotelReview>> = []) {
  return { content: reviews, page: 0, size: 1, totalElements: reviews.length, totalPages: reviews.length ? 1 : 0, first: true, last: true }
}
