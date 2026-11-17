import { expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HotelDetailPage } from './HotelDetailPage'

it('shows an invalid hotel ID without falling back to a sample hotel', () => {
  const markup = renderToStaticMarkup(<QueryClientProvider client={new QueryClient()}><MemoryRouter initialEntries={['/stays/not-an-id']}><Routes><Route path="/stays/:hotelId" element={<HotelDetailPage />} /></Routes></MemoryRouter></QueryClientProvider>)
  expect(markup).toContain('Không tìm thấy khách sạn')
  expect(markup).not.toContain('The Lagom')
})

it('shows the selected hotel cover and does not use another hotel’s cover', () => {
  const id = '11111111-1111-4111-8111-111111111111'
  const mediaId = '22222222-2222-4222-8222-222222222222'
  const client = new QueryClient()
  client.setQueryData(['hotels', 'public-detail', id], { id, name: 'Khách sạn A', address: 'Hà Nội', starRating: 4, checkInTime: '14:00', checkOutTime: '12:00', description: null })
  client.setQueryData(['hotels', 'public-room-types', id], [])
  client.setQueryData(['discovery', 'media', mediaId], { mediaId, url: 'https://example.test/cover.jpg' })
  const render = (hotelId: string) => renderToStaticMarkup(<QueryClientProvider client={client}><MemoryRouter initialEntries={[{ pathname: `/stays/${id}`, state: { hotelId, coverMediaId: mediaId } }]}><Routes><Route path="/stays/:hotelId" element={<HotelDetailPage />} /></Routes></MemoryRouter></QueryClientProvider>)
  expect(render(id)).toContain('https://example.test/cover.jpg')
  expect(render('33333333-3333-4333-8333-333333333333')).not.toContain('https://example.test/cover.jpg')
})

const hotelId = '11111111-1111-4111-8111-111111111111'
const stay = { checkIn: '2030-01-10', checkOut: '2030-01-12', adults: 1, children: 0, quantity: 1 }

it('connects the real checkout and requires a selected room and quote', () => {
  const client = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity, retry: false } } })
  client.setQueryData(['hotels', 'public-detail', hotelId], { id: hotelId, name: 'Khách sạn test', address: 'Hà Nội', starRating: 4, checkInTime: '14:00', checkOutTime: '12:00', description: null })
  client.setQueryData(['hotels', 'public-room-types', hotelId], [])
  const params = new URLSearchParams({ ...stay, adults: String(stay.adults), children: '0', quantity: '1' })
  const markup = renderToStaticMarkup(<QueryClientProvider client={client}><MemoryRouter initialEntries={[`/stays/${hotelId}?${params}`]}>
    <Routes><Route path="/stays/:hotelId" element={<HotelDetailPage />} /></Routes>
  </MemoryRouter></QueryClientProvider>)
  expect(markup).toContain('aria-label="Đặt phòng và thanh toán"')
  expect(markup.match(/<button[^>]*>Tiếp tục đặt phòng<\/button>/)?.[0]).toContain('disabled')
  expect(markup).not.toContain('Chức năng đặt phòng trực tuyến chưa sẵn sàng')
})
