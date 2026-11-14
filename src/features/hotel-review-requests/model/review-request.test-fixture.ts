import type { ReviewRequest, ReviewSummary } from './review-request'
export const hotelId = '11111111-1111-4111-8111-111111111111'
export const ownerId = '22222222-2222-4222-8222-222222222222'
export const requestId = '33333333-3333-4333-8333-333333333333'
export const reviewFixture: ReviewRequest = {
  id: requestId, hotelId, status: 'PENDING', submittedBy: ownerId, submittedAt: '2026-11-13T01:00:00Z',
  reviewedBy: null, reviewedAt: null, reason: null, version: 2,
  snapshot: {
    hotel: { id: hotelId, ownerId, cityId: '44444444-4444-4444-8444-444444444444', name: 'Hồ sơ khách sạn đã gửi', address: '12 Đường Biển',
      description: 'Nội dung do Owner gửi', contactPhone: '0901234567', contactEmail: null, latitude: null, longitude: null,
      starRating: 4, checkInTime: '14:00:00', checkOutTime: '12:00:00', version: 7 },
    amenities: [], customAmenities: [], roomTypes: [], rooms: [], images: [], albums: [],
  },
}
export const reviewSummaryFixture: ReviewSummary = {
  id: requestId, hotelId, hotelName: reviewFixture.snapshot.hotel.name, status: 'PENDING', submittedBy: ownerId,
  submittedAt: reviewFixture.submittedAt, reviewedBy: null, reviewedAt: null, reason: null, version: 2,
}
