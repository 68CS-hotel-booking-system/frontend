import { afterEach, beforeEach, expect, it, vi } from 'vitest'
const fetcher = vi.fn<typeof fetch>()
const id = '11111111-1111-4111-8111-111111111111'
const review = { id, bookingId: id, hotelId: id, bookingCode: 'BK001', authorDisplayName: 'N. Anh', rating: 5, content: 'Phòng sạch.', createdAt: '2030-01-01T00:00:00Z', reply: null, repliedAt: null, version: 0, canReply: false }
const publicReview = { id, authorDisplayName: 'N. Anh', rating: 5, content: 'Phòng sạch.', createdAt: '2030-01-01T00:00:00Z', reply: null, repliedAt: null }
const page = { content: [publicReview], page: 0, size: 5, totalElements: 1, totalPages: 1, first: true, last: true }
const summary = { totalReviews: 1, averageRating: 5, ratingCounts: [{ rating: 5, count: 1 }] }
const response = (data: unknown) => fetcher.mockResolvedValue(new Response(JSON.stringify({ message: 'ok', data })))
beforeEach(() => { vi.resetModules(); fetcher.mockReset(); vi.stubGlobal('fetch', fetcher) })
afterEach(() => vi.unstubAllGlobals())
it('submits only a validated rating and content to the owned booking endpoint', async () => {
  response(review)
  const { submitGuestReview } = await import('./guest-review-api')
  await submitGuestReview(id, { rating: 5, content: ' Phòng sạch. ' })
  expect(fetcher.mock.calls[0][0]).toBe(`/api/v1/bookings/${id}/review`)
  expect(fetcher.mock.calls[0][1]?.method).toBe('POST')
  expect(JSON.parse(fetcher.mock.calls[0][1]?.body as string)).toEqual({ rating: 5, content: 'Phòng sạch.' })
})
it('reads server eligibility and existing reviews instead of guessing ownership or completion', async () => {
  response({ canReview: false, message: 'Bạn đã đánh giá đơn này.', review })
  const { getBookingReview } = await import('./guest-review-api')
  const controller = new AbortController()
  expect((await getBookingReview(id, controller.signal)).review?.rating).toBe(5)
  expect(fetcher.mock.calls[0][1]?.signal).toBeInstanceOf(AbortSignal)
})
it('uses public and private paginated lists with server filters and no client owner ID', async () => {
  response({ reviews: page, summary })
  const { listPublicGuestReviews, listManagedGuestReviews } = await import('./guest-review-api')
  expect((await listPublicGuestReviews(id, { page: 0, size: 5, rating: 5 })).summary.averageRating).toBe(5)
  expect(fetcher.mock.calls[0][0]).toBe(`/api/v1/hotels/${id}/guest-reviews?page=0&size=5&rating=5`)
  response({ reviews: { ...page, content: [review] }, summary })
  await listManagedGuestReviews(id, { page: 0, size: 5, replied: false })
  expect(fetcher.mock.calls[1][0]).toBe(`/api/v1/management/hotels/${id}/guest-reviews?page=0&size=5&replied=false`)
})
it('replies with an expected version and keeps the customer rating immutable', async () => {
  response({ ...review, reply: 'Cảm ơn bạn.', canReply: true, version: 1 })
  const { replyGuestReview } = await import('./guest-review-api')
  await replyGuestReview(id, id, { content: ' Cảm ơn bạn. ' }, 0)
  expect(fetcher.mock.calls[0][0]).toBe(`/api/v1/management/hotels/${id}/guest-reviews/${id}/reply`)
  expect(JSON.parse(fetcher.mock.calls[0][1]?.body as string)).toEqual({ content: 'Cảm ơn bạn.', expectedVersion: 0 })
})
it('rejects fractional stars, invalid ranges, blank content and unsafe versions before HTTP', async () => {
  const { submitGuestReview, replyGuestReview } = await import('./guest-review-api')
  for (const rating of [0, 6, 4.5]) expect(() => submitGuestReview(id, { rating, content: 'a' })).toThrow()
  expect(() => submitGuestReview(id, { rating: 5, content: ' ' })).toThrow()
  expect(() => replyGuestReview(id, id, { content: 'a' }, -1)).toThrow()
  expect(fetcher).not.toHaveBeenCalled()
})
it('preserves duplicate and stale-version errors without automatically resubmitting', async () => {
  fetcher.mockResolvedValue(new Response(JSON.stringify({ code: 'GUEST_REVIEW_VERSION_CONFLICT', detail: 'Tải lại đánh giá.' }), { status: 409 }))
  const { replyGuestReview } = await import('./guest-review-api')
  await expect(replyGuestReview(id, id, { content: 'a' }, 0)).rejects.toMatchObject({ status: 409, code: 'GUEST_REVIEW_VERSION_CONFLICT' })
  expect(fetcher).toHaveBeenCalledTimes(1)
})
