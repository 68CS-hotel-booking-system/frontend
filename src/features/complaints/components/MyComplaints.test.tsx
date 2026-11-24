import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, expect, it } from 'vitest'
import { setSession } from '@/shared/api/session'
import { MyComplaints } from './MyComplaints'
const userA = '11111111-1111-4111-8111-111111111111'
const userB = '22222222-2222-4222-8222-222222222222'
const id = '33333333-3333-4333-8333-333333333333'
afterEach(() => setSession(null))
it('uses session identity and never shows the previous account complaint content', () => {
  const client = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity } } })
  client.setQueryData(['complaints', 'mine', userA, { page: 0, status: undefined }], {
    content: [{ id, bookingId: id, hotelId: id, category: 'ROOM_CONDITION', content: 'Nội dung riêng của khách A', status: 'OPEN',
      createdAt: '2030-01-01T00:00:00Z', updatedAt: '2030-01-01T00:00:00Z', version: 0, history: [] }],
    page: 0, size: 10, totalElements: 1, totalPages: 1, first: true, last: true,
  })
  const render = () => renderToStaticMarkup(<QueryClientProvider client={client}><MyComplaints /></QueryClientProvider>)
  setSession({ accessToken: 'token-a', userId: userA, expiresAt: '2099-01-01T00:00:00Z' })
  expect(render()).toContain('Nội dung riêng của khách A')
  setSession({ accessToken: 'refreshed-token-a', userId: userA, expiresAt: '2099-01-01T00:00:00Z' })
  expect(render()).toContain('Nội dung riêng của khách A')
  setSession({ accessToken: 'token-b', userId: userB, expiresAt: '2099-01-01T00:00:00Z' })
  expect(render()).not.toContain('Nội dung riêng của khách A')
  client.clear()
})
