import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getHotelPublishReadiness, getAdminReviewRequests, getHotelReviewRequests, getReviewRequest, submitHotelReview, decideHotelReview } from './review-requests-api'
import { hotelId, requestId, reviewFixture, reviewSummaryFixture } from '../model/review-request.test-fixture'
import { reviewRequestSchema, rejectionSchema } from '../model/review-request'

const fetcher = vi.hoisted(() => { const fn = vi.fn<typeof fetch>(); vi.stubGlobal('fetch', fn); return fn })
function respond(data: unknown) { fetcher.mockResolvedValue(new Response(JSON.stringify({ message: 'ok', data }))) }
beforeEach(() => { fetcher.mockReset(); vi.stubGlobal('fetch', fetcher) })
afterEach(() => vi.unstubAllGlobals())
describe('hotel review request API contracts', () => {
  it('reads real owner history with zero-based pagination', async () => {
    respond({ content: [reviewSummaryFixture], page: 2, size: 10, totalElements: 21, totalPages: 3 })
    const result = await getHotelReviewRequests(hotelId, 2, 10)
    expect(fetcher.mock.calls[0][0]).toBe(`/api/v1/management/hotels/${hotelId}/review-requests?page=2&size=10`)
    expect(result.content[0].status).toBe('PENDING')
  })
  it('passes backend status and hotel filters to the admin queue', async () => {
    respond({ content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 })
    await getAdminReviewRequests({ page: 0, size: 10, status: 'REJECTED', hotelId })
    expect(fetcher.mock.calls[0][0]).toBe(`/api/v1/admin/hotel-review-requests?page=0&size=10&status=REJECTED&hotelId=${hotelId}`)
  })
  it('sends hotel version on submission and preserves a separate review version', async () => {
    respond(reviewFixture)
    const result = await submitHotelReview(hotelId, 7)
    expect(fetcher.mock.calls[0][1]?.method).toBe('POST')
    expect(JSON.parse(fetcher.mock.calls[0][1]?.body as string)).toEqual({ expectedVersion: 7 })
    expect(result.version).toBe(2)
    expect(result.snapshot.hotel.version).toBe(7)
  })
  it('reads the submitted snapshot rather than substituting current hotel content', async () => {
    respond(reviewFixture)
    expect((await getReviewRequest(requestId)).snapshot.hotel.name).toBe('Hồ sơ khách sạn đã gửi')
    expect(fetcher.mock.calls[0][0]).toBe(`/api/v1/hotel-review-requests/${requestId}`)
  })
  it.each(['approve', 'reject'] as const)('posts a versioned %s decision to the review request, never a hotel PATCH', async (decision) => {
    respond({ ...reviewFixture, status: decision === 'approve' ? 'APPROVED' : 'REJECTED' })
    await decideHotelReview(requestId, decision, 2, '  Cần bổ sung ảnh  ')
    expect(fetcher.mock.calls[0][0]).toBe(`/api/v1/admin/hotel-review-requests/${requestId}/${decision}`)
    expect(fetcher.mock.calls[0][1]?.method).toBe('POST')
    expect(JSON.parse(fetcher.mock.calls[0][1]?.body as string)).toEqual(decision === 'approve' ? { expectedVersion: 2 } : { expectedVersion: 2, reason: 'Cần bổ sung ảnh' })
  })
  it('does not send an empty rejection reason', async () => {
    expect(() => decideHotelReview(requestId, 'reject', 2, '   ')).toThrow()
    expect(fetcher).not.toHaveBeenCalled()
  })
  it('keeps a concurrency conflict available to the UI without retrying a decision', async () => {
    fetcher.mockResolvedValue(new Response(JSON.stringify({ status: 409, code: 'REVIEW_CONCURRENT_UPDATE', detail: 'Phiên bản đã thay đổi.' }), { status: 409 }))
    await expect(decideHotelReview(requestId, 'approve', 2)).rejects.toMatchObject({ status: 409, code: 'REVIEW_CONCURRENT_UPDATE' })
    expect(fetcher).toHaveBeenCalledTimes(1)
  })
  it('keeps review state distinct from hotel state and trims the rejection reason', () => {
    expect(reviewRequestSchema.safeParse({ ...reviewFixture, status: 'DRAFT' }).success).toBe(false)
    expect(reviewRequestSchema.safeParse(reviewFixture).success).toBe(true)
    expect(rejectionSchema.parse({ reason: '  Bổ sung mô tả  ' }).reason).toBe('Bổ sung mô tả')
  })
})

it('uses backend eligibility and requirement messages without inferring from room readiness', async () => {
  respond({ hotelId, ready: false, operationalRoomCount: 0, checkedAt: '2026-11-13T00:00:00Z', unmetRequirements: [{ field: 'rooms', message: 'Cần phòng vật lý đang phục vụ' }] })
  const result = await getHotelPublishReadiness(hotelId)
  expect(fetcher.mock.calls[0][0]).toBe(`/api/v1/management/hotels/${hotelId}/publish-readiness`)
  expect(result.ready).toBe(false)
  expect(result.unmetRequirements[0].message).toBe('Cần phòng vật lý đang phục vụ')
})
