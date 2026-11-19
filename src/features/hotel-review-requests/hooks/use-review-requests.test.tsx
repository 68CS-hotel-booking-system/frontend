import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { reviewKeys, useReviewMutations } from './use-review-requests'
import { hotelId, requestId, reviewFixture } from '../model/review-request.test-fixture'

const fetcher = vi.hoisted(() => { const fn = vi.fn<typeof fetch>(); vi.stubGlobal('fetch', fn); return fn })
beforeEach(() => { fetcher.mockReset(); vi.stubGlobal('fetch', fetcher) })
afterEach(() => vi.unstubAllGlobals())
function setup() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: 3 } } })
  const hotelKey = ['hotels', 'management-detail', 'api', hotelId]
  client.setQueryData(hotelKey, { status: 'DRAFT', version: 7 })
  client.setQueryData(reviewKeys.detail(requestId), reviewFixture)
  let mutations!: ReturnType<typeof useReviewMutations>
  function Probe() { mutations = useReviewMutations(); return null }
  renderToStaticMarkup(<QueryClientProvider client={client}><Probe /></QueryClientProvider>)
  return { client, mutations, hotelKey }
}
describe('review mutation cache and conflict handling', () => {
  it('updates from the decision response and invalidates hotel state after approval', async () => {
    const approved = { ...reviewFixture, status: 'APPROVED', version: 3 }
    fetcher.mockResolvedValue(new Response(JSON.stringify({ message: 'ok', data: approved })))
    const { client, mutations, hotelKey } = setup()
    expect(client.getQueryData(reviewKeys.detail(requestId))).toMatchObject({ status: 'PENDING' })
    await mutations.decide.mutateAsync({ requestId, decision: 'approve', expectedVersion: 2 })
    expect(client.getQueryData(reviewKeys.detail(requestId))).toMatchObject({ status: 'APPROVED', version: 3 })
    expect(client.getQueryState(hotelKey)?.isInvalidated).toBe(true)
    client.clear()
  })
  it('refreshes after a conflict without automatically retrying a decision with a new version', async () => {
    fetcher.mockResolvedValue(new Response(JSON.stringify({ status: 409, code: 'REVIEW_ALREADY_DECIDED', detail: 'Hồ sơ đã được xét duyệt.' }), { status: 409 }))
    const { client, mutations, hotelKey } = setup()
    await expect(mutations.decide.mutateAsync({ requestId, decision: 'approve', expectedVersion: 2 })).rejects.toMatchObject({ status: 409 })
    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(client.getQueryState(reviewKeys.detail(requestId))?.isInvalidated).toBe(true)
    expect(client.getQueryState(hotelKey)?.isInvalidated).toBe(true)
    expect(client.getQueryData(reviewKeys.detail(requestId))).toMatchObject({ status: 'PENDING' })
    client.clear()
  })
})
