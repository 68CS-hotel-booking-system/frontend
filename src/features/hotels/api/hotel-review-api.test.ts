import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/shared/api/api-error'
import { reviewHotel, reviewPage, submittedReview } from './hotel-review.test-fixtures'
import {
  approveHotelReview, getAdminHotelReviews, getHotelReview, getManagementHotelReviews,
  rejectHotelReview, submitHotelReview,
} from './hotel-review-api'

const fetcher = vi.hoisted(() => {
  const fn = vi.fn<typeof fetch>()
  vi.stubGlobal('fetch', fn)
  return fn
})
beforeEach(() => { vi.stubGlobal('fetch', fetcher); fetcher.mockReset() })
afterEach(() => vi.unstubAllGlobals())
function respond(data: unknown) { fetcher.mockResolvedValue(new Response(JSON.stringify({ message: 'ok', data }))) }

describe('hotel review API contracts', () => {
  it('reads a review snapshot containing seeded physical room IDs', async () => {
    const room = {
      id: '47a5fc05-f674-bba7-66ff-c6965488b21b', roomTypeId: 'de0000c0-0000-4000-8000-000000000901',
      roomNumber: '101', floor: '1', operationalFrom: '2026-01-01T00:00:00Z', operationalUntil: null,
      amenities: [], customAmenities: [],
    }
    respond({ ...submittedReview, snapshot: { ...submittedReview.snapshot, rooms: [room] } })
    const result = await getHotelReview(submittedReview.id)
    expect(result.snapshot.rooms).toEqual([room])
  })
  it('submits only the hotel version and reads the snapshot returned by the server', async () => {
    respond(submittedReview)
    const signal = new AbortController().signal
    const result = await submitHotelReview(reviewHotel.id, 3, signal)
    expect(fetcher.mock.calls[0][0]).toBe(`/api/v1/management/hotels/${reviewHotel.id}/review-requests`)
    expect(fetcher.mock.calls[0][1]?.method).toBe('POST')
    expect(JSON.parse(fetcher.mock.calls[0][1]?.body as string)).toEqual({ expectedVersion: 3 })
    expect(fetcher.mock.calls[0][1]?.signal).toBeInstanceOf(AbortSignal)
    expect(result.snapshot.hotel.name).toBe('Khách sạn Biển Xanh')
    expect(result.status).toBe('PENDING')
  })
  it('reads the latest owner review from the backend with zero-based pagination', async () => {
    respond(reviewPage([submittedReview]))
    const result = await getManagementHotelReviews(reviewHotel.id, { page: 0, size: 1 })
    expect(fetcher.mock.calls[0][0]).toBe(`/api/v1/management/hotels/${reviewHotel.id}/review-requests?page=0&size=1`)
    expect(result.content[0].id).toBe(submittedReview.id)
  })
  it('keeps admin filtering, server pagination and the submitted hotel name', async () => {
    respond({ ...reviewPage([{ ...submittedReview, hotelName: 'Tên đã gửi' }]), page: 2, size: 20 })
    const result = await getAdminHotelReviews({ page: 2, size: 20, status: 'PENDING', hotelId: reviewHotel.id })
    expect(fetcher.mock.calls[0][0]).toBe(`/api/v1/admin/hotel-review-requests?page=2&size=20&status=PENDING&hotelId=${reviewHotel.id}`)
    expect(result.content[0].hotelName).toBe('Tên đã gửi')
    expect(result.page).toBe(2)
  })
  it('approves the request ID with the review version, never the legacy hotel approve URL', async () => {
    respond({ ...submittedReview, status: 'APPROVED', version: 1 })
    await approveHotelReview(submittedReview.id, 0)
    expect(fetcher.mock.calls[0][0]).toBe(`/api/v1/admin/hotel-review-requests/${submittedReview.id}/approve`)
    expect(fetcher.mock.calls[0][1]?.method).toBe('POST')
    expect(JSON.parse(fetcher.mock.calls[0][1]?.body as string)).toEqual({ expectedVersion: 0 })
  })
  it('rejects with the required trimmed reason and review version', async () => {
    respond({ ...submittedReview, status: 'REJECTED', reason: 'Bổ sung thông tin', version: 1 })
    await rejectHotelReview(submittedReview.id, 0, '  Bổ sung thông tin  ')
    expect(JSON.parse(fetcher.mock.calls[0][1]?.body as string)).toEqual({ expectedVersion: 0, reason: 'Bổ sung thông tin' })
    expect(fetcher.mock.calls[0][0]).toBe(`/api/v1/admin/hotel-review-requests/${submittedReview.id}/reject`)
  })
  it('does not send an empty rejection reason', () => {
    expect(() => rejectHotelReview(submittedReview.id, 0, '   ')).toThrow()
    expect(fetcher).not.toHaveBeenCalled()
  })
  it.each([403, 404, 409, 422])('preserves backend %s errors without retrying or pretending success', async (status) => {
    fetcher.mockResolvedValue(new Response(JSON.stringify({ status, detail: 'Không thể xử lý', code: 'REVIEW_CONCURRENT_UPDATE', errors: [{ field: 'contact', message: 'Thiếu liên hệ' }] }), { status }))
    await expect(submitHotelReview(reviewHotel.id, 3)).rejects.toMatchObject({ status, code: 'REVIEW_CONCURRENT_UPDATE' })
    expect(fetcher).toHaveBeenCalledTimes(1)
  })
  it('refuses incomplete snapshot responses', async () => {
    respond({ ...submittedReview, snapshot: {} })
    await expect(getHotelReview(submittedReview.id)).rejects.toBeInstanceOf(ApiError)
  })
})
