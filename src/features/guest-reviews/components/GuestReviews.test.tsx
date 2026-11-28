import { renderToStaticMarkup } from 'react-dom/server'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, expect, it } from 'vitest'
import { setSession } from '@/shared/api/session'
import { guestReviewKeys } from '../hooks/use-guest-reviews'
import { GuestReviewCard } from './GuestReviewCard'
import { BookingGuestReview } from './BookingGuestReview'
import { ManagedGuestReviews } from './ManagedGuestReviews'
import { PublicGuestReviews } from './PublicGuestReviews'
const id = '11111111-1111-4111-8111-111111111111'
const actor = '22222222-2222-4222-8222-222222222222'
const review = { id, bookingId: id, hotelId: id, bookingCode: 'BK001', authorDisplayName: 'N. Anh', rating: 4, content: '<script>alert(1)</script>', createdAt: '2030-01-01T00:00:00Z', reply: 'Cảm ơn bạn.', repliedAt: '2030-01-02T00:00:00Z', version: 1, canReply: false }
const page = { content: [review], page: 0, size: 5, totalElements: 1, totalPages: 1, first: true, last: true }
const summary = { totalReviews: 1, averageRating: 4, ratingCounts: [{ rating: 4, count: 1 }] }
afterEach(() => setSession(null))
function session() { setSession({ accessToken: 'test', userId: actor, expiresAt: '2099-01-01T00:00:00Z' }) }
it('renders user content as text and a hotel reply without exposing private booking data', () => {
  const html = renderToStaticMarkup(<GuestReviewCard review={review} />)
  expect(html).toContain('4/5')
  expect(html).toContain('&lt;script&gt;')
  expect(html).not.toContain('<script>')
  expect(html).toContain('Cảm ơn bạn.')
  expect(html).not.toContain('BK001')
})
it('renders the one-time form only when the server grants review eligibility', () => {
  session()
  const client = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity } } })
  client.setQueryData(guestReviewKeys.booking(actor, id), { canReview: true, message: '', review: null })
  const render = () => renderToStaticMarkup(<QueryClientProvider client={client}><BookingGuestReview bookingId={id} /></QueryClientProvider>)
  expect(render()).toContain('Gửi đánh giá')
  client.setQueryData(guestReviewKeys.booking(actor, id), { canReview: false, message: 'Bạn đã đánh giá đơn này.', review })
  expect(render()).not.toContain('aria-label="Gửi đánh giá sau lưu trú"')
  expect(render()).toContain('Cảm ơn bạn.')
})
it('uses server canReply to keep admin read-only and allow the current owner to respond', () => {
  session()
  const client = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity } } })
  const key = [...guestReviewKeys.management(actor, id), { page: 0, size: 5, rating: undefined, replied: undefined }]
  client.setQueryData(key, { reviews: page, summary })
  const render = () => renderToStaticMarkup(<QueryClientProvider client={client}><ManagedGuestReviews hotelId={id} /></QueryClientProvider>)
  expect(render()).not.toContain('Sửa phản hồi')
  client.setQueryData(key, { reviews: { ...page, content: [{ ...review, canReply: true }] }, summary })
  expect(render()).toContain('Sửa phản hồi')
})
it('renders real summary data and scopes private cache keys when switching users', () => {
  const client = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity } } })
  client.setQueryData([...guestReviewKeys.public(id), { page: 0, size: 5, rating: undefined }], { reviews: page, summary })
  expect(renderToStaticMarkup(<QueryClientProvider client={client}><PublicGuestReviews hotelId={id} /></QueryClientProvider>)).toContain('4/5')
  expect(guestReviewKeys.booking(actor, id)).not.toEqual(guestReviewKeys.booking(id, id))
  expect(guestReviewKeys.management(actor, id)).not.toEqual(guestReviewKeys.management(id, id))
})
