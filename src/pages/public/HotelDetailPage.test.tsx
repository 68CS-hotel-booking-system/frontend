import { expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HotelDetailPage } from './HotelDetailPage'

it('shows room cards and server prices while ignoring multiple-room links', () => {
  const id = '11111111-1111-4111-8111-111111111111'
  const roomId = '22222222-2222-4222-8222-222222222222'
  const client = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity } } })
  client.setQueryData(['hotels', 'public-detail', id], { id, name: 'Khách sạn A', address: 'Hà Nội', checkInTime: '14:00', checkOutTime: '12:00', amenities: [{ id: 'parking', code: 'FREE_PARKING', name: 'Bãi đỗ xe miễn phí', category: 'HOTEL' }] })
  client.setQueryData(['hotels', 'public-room-types', id], [{ id: roomId, name: 'Deluxe', description: 'Phòng có ban công', maxAdults: 2, maxChildren: 1, amenities: [{ id: 'wifi', name: 'Wi-Fi' }] }])
  client.setQueryData(['discovery', 'availability', id, { checkIn: '2099-01-10', checkOut: '2099-01-12', adults: 2, children: 0, quantity: 1 }], { roomTypes: [{ roomTypeId: roomId, maxOccupancy: 2, isAvailable: true, availableQuantity: 3, pricePerNight: 1200000, totalEstimatedPrice: 2400000, currency: 'VND' }] })
  const markup = renderToStaticMarkup(<QueryClientProvider client={client}><MemoryRouter initialEntries={[`/stays/${id}?checkIn=2099-01-10&checkOut=2099-01-12&adults=2&quantity=8`]}><Routes><Route path="/stays/:hotelId" element={<HotelDetailPage />} /></Routes></MemoryRouter></QueryClientProvider>)
  expect(markup).toContain('Phòng có ban công')
  expect(markup).toContain('Wi-Fi')
  expect(markup).toContain('Bãi đỗ xe miễn phí')
  expect(markup).toContain('anticon-car')
  expect(markup).not.toContain('AirCover')
  expect(markup).not.toContain('Phí vệ sinh')
  expect(markup).not.toContain('Miễn phí hủy phòng')
  expect(markup).not.toContain('186 đánh giá')
  expect(markup.replace(/<!--.*?-->/g, '')).toContain('Tối đa 2 khách')
  expect(markup).toContain('1.200.000')
  expect(markup).toContain('Còn 3 phòng phù hợp')
  expect(markup).toContain('Chọn phòng')
  expect(markup).toContain('1 phòng')
  expect(markup).not.toContain('Số phòng')
  expect(markup.indexOf('id="stay-rooms"')).toBeLessThan(markup.indexOf('id="stay-about"'))
  const roomSection = markup.slice(markup.indexOf('id="stay-rooms"'), markup.indexOf('id="stay-amenities"'))
  const priceCard = markup.slice(markup.indexOf('<aside id="stay-booking"'), markup.indexOf('</aside>'))
  expect(roomSection).not.toContain('type="date"')
  expect(priceCard.match(/class="hotel-stay-date-trigger"/g)).toHaveLength(2)
  expect(priceCard).toContain('10/01/2099')
  expect(priceCard).toContain('12/01/2099')
  expect(priceCard).toContain('Ngày lưu trú và số khách')
  expect(priceCard).toContain('client-guest-trigger')
  expect(markup).toContain('aria-controls="stay-booking"')
  expect(markup).toContain('Chưa có thông tin đánh giá.')
})

it('shows an invalid hotel ID without falling back to a sample hotel', () => {
  const markup = renderToStaticMarkup(<QueryClientProvider client={new QueryClient()}><MemoryRouter initialEntries={['/stays/not-an-id']}><Routes><Route path="/stays/:hotelId" element={<HotelDetailPage />} /></Routes></MemoryRouter></QueryClientProvider>)
  expect(markup).toContain('Không tìm thấy khách sạn')
  expect(markup).not.toContain('The Lagom')
})

it('loads photos from the current hotel gallery without navigation state', () => {
  const id = '11111111-1111-4111-8111-111111111111'
  const mediaId = '22222222-2222-4222-8222-222222222222'
  const client = new QueryClient()
  client.setQueryData(['hotels', 'public-detail', id], { id, name: 'Khách sạn A', address: 'Hà Nội', starRating: 4, checkInTime: '14:00', checkOutTime: '12:00', description: null })
  client.setQueryData(['hotels', 'public-room-types', id], [])
  client.setQueryData(['discovery', 'media', mediaId], { mediaId, url: 'https://example.test/cover.jpg' })
  client.setQueryData(['discovery', 'gallery', id], { hotelId: id, images: [{ mediaId, albumId: null, sortOrder: 0, cover: true }], albums: [] })
  const render = (hotelId: string) => renderToStaticMarkup(<QueryClientProvider client={client}><MemoryRouter initialEntries={[{ pathname: `/stays/${id}`, state: { hotelId, coverMediaId: mediaId } }]}><Routes><Route path="/stays/:hotelId" element={<HotelDetailPage />} /></Routes></MemoryRouter></QueryClientProvider>)
  expect(render(id)).toContain('https://example.test/cover.jpg')
  expect(render('33333333-3333-4333-8333-333333333333')).toContain('https://example.test/cover.jpg')
})

const hotelId = '11111111-1111-4111-8111-111111111111'
const stay = { checkIn: '2030-01-10', checkOut: '2030-01-12', adults: 1, children: 0, quantity: 1 }

it('requires a selected room and server quote before continuing to checkout', () => {
  const client = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity, retry: false } } })
  client.setQueryData(['hotels', 'public-detail', hotelId], { id: hotelId, name: 'Khách sạn test', address: 'Hà Nội', starRating: 4, checkInTime: '14:00', checkOutTime: '12:00', description: null })
  client.setQueryData(['hotels', 'public-room-types', hotelId], [])
  const params = new URLSearchParams({ ...stay, adults: String(stay.adults), children: '0', quantity: '1' })
  const markup = renderToStaticMarkup(<QueryClientProvider client={client}><MemoryRouter initialEntries={[`/stays/${hotelId}?${params}`]}>
    <Routes><Route path="/stays/:hotelId" element={<HotelDetailPage />} /></Routes>
  </MemoryRouter></QueryClientProvider>)
  expect(markup).toContain('aria-label="Đặt phòng của bạn"')
  expect(markup.match(/<button[^>]*class="hotel-stay-continue book-cta"[^>]*>/)?.[0]).toContain('disabled')
  expect(markup).not.toContain('Chức năng đặt phòng trực tuyến chưa sẵn sàng')
})
