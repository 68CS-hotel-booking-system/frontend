import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderToStaticMarkup } from 'react-dom/server'
import { hotelManagementKeys } from './hotel-query-keys'
import { hotelReviewKeys, useSubmitHotelReview, useHotelReviewDecision } from './use-hotel-reviews'
import { reviewHotel, submittedReview } from '../api/hotel-review.test-fixtures'

const fetcher = vi.hoisted(() => {
  const fn = vi.fn<typeof fetch>()
  vi.stubGlobal('fetch', fn)
  return fn
})
beforeEach(() => { vi.stubGlobal('fetch', fetcher); fetcher.mockReset() })
afterEach(() => vi.unstubAllGlobals())

function setup() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: 3 } } })
  client.setQueryData(hotelReviewKeys.management(reviewHotel.id), { content: [] })
  client.setQueryData(hotelReviewKeys.detail(submittedReview.id), submittedReview)
  client.setQueryData(hotelManagementKeys.detail('api', reviewHotel.id), reviewHotel)
  let submit!: ReturnType<typeof useSubmitHotelReview>
  let decide!: ReturnType<typeof useHotelReviewDecision>
  function Probe() { submit = useSubmitHotelReview(); decide = useHotelReviewDecision(); return null }
  renderToStaticMarkup(<QueryClientProvider client={client}><Probe /></QueryClientProvider>)
  return { client, submit, decide }
}
describe('review mutation reconciliation', () => {
  it('invalidates latest review and hotel data after submission', async () => {
    fetcher.mockResolvedValue(new Response(JSON.stringify({ message: 'ok', data: submittedReview })))
    const { client, submit } = setup()
    await submit.mutateAsync({ hotelId: reviewHotel.id, expectedVersion: 3 })
    expect(client.getQueryState(hotelReviewKeys.management(reviewHotel.id))?.isInvalidated).toBe(true)
    expect(client.getQueryState(hotelManagementKeys.detail('api', reviewHotel.id))?.isInvalidated).toBe(true)
    client.clear()
  })
  it('does not retry a stale decision and invalidates the snapshot before another decision', async () => {
    fetcher.mockResolvedValue(new Response(JSON.stringify({ detail: 'Hồ sơ đã thay đổi', code: 'REVIEW_CONCURRENT_UPDATE' }), { status: 409 }))
    const { client, decide } = setup()
    await expect(decide.mutateAsync({ action: 'approve', requestId: submittedReview.id, expectedVersion: 0 })).rejects.toMatchObject({ status: 409 })
    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(client.getQueryState(hotelReviewKeys.detail(submittedReview.id))?.isInvalidated).toBe(true)
    client.clear()
  })
})
