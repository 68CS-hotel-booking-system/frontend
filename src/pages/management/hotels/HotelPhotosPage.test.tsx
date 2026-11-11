import { afterEach, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { App } from 'antd'
import { MemoryRouter } from 'react-router'
import { HotelWorkspaceProvider } from '@/features/hotels'
import { setAuthStatus, setSession } from '@/shared/api/session'
import { HotelPhotosPage } from './HotelPhotosPage'

afterEach(() => { setAuthStatus('unauthenticated'); setSession(null) })

it('disables every photo upload and album creation entry point for Admin while keeping the gallery readable', () => {
  const id = '11111111-1111-4111-8111-111111111111'
  const client = new QueryClient()
  setSession({ accessToken: 'photos-admin-test', expiresAt: '2099-01-01T00:00:00Z' })
  client.setQueryData(['auth', 'current-user', 'photos-admin-test'], { id: 'admin', roles: ['ADMIN'] })
  client.setQueryData(['hotels', 'images', 'api', id], [])
  client.setQueryData(['hotels', 'albums', id], [])
  client.setQueryData(['hotel-reviews', 'management', id, 0, 1], { content: [] })
  const hotel = {
    id, ownerUserId: 'owner', cityId: 'city', name: 'Khách sạn bản nháp', slug: 'draft', address: '12 Beach',
    description: null, latitude: null, longitude: null, starRating: null,
    checkInTime: '14:00:00', checkOutTime: '12:00:00', status: 'DRAFT' as const, version: 0,
    createdAt: '2026-11-11T00:00:00Z', updatedAt: '2026-11-11T00:00:00Z',
  }
  const html = renderToStaticMarkup(<MemoryRouter><QueryClientProvider client={client}><App>
    <HotelWorkspaceProvider hotel={hotel} hotelId={id} isLoading={false} isError={false} error={null} refetch={() => undefined}>
      <HotelPhotosPage />
    </HotelWorkspaceProvider>
  </App></QueryClientProvider></MemoryRouter>)
  const actions = html.match(/<button\b[^>]*>[\s\S]*?<\/button>/g)?.filter((button) => /Tạo album mới|Tải ảnh|Thêm ảnh vào album/.test(button)) ?? []
  expect(actions.length).toBeGreaterThanOrEqual(4)
  for (const button of actions) expect(button).toContain('disabled')
  expect(html).toContain('Xem trước giao diện khách')
  client.clear()
})
