import { expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { HOTEL_DETAIL_DATABASE } from '../mocks/hotel-detail-data'
import { HotelDetailView } from './HotelDetailView'

it('keeps the original detail composition and uses live slots without leaking demo reviews, host or fees', () => {
  const hotel = { ...HOTEL_DETAIL_DATABASE['cloud-pine'], id: '11111111-1111-4111-8111-111111111111', title: 'Khách sạn thật', type: 'Khách sạn', photos: [] }
  const markup = renderToStaticMarkup(<MemoryRouter><HotelDetailView hotel={hotel} live={{
    bookingRail: <aside id="live-rail">Báo giá server 2.050.000₫</aside>, calendar: <section>Lịch ngày thật</section>,
    roomTypes: <section>Deluxe từ API</section>, amenities: <section>Tiện nghi từ API</section>, reviews: <section>Đánh giá chưa khả dụng</section>,
    location: <section>Vị trí thật</section>, policies: <section>Giờ nhận phòng thật</section>, ratingLabel: 'Tiêu chuẩn 4 sao', priceLabel: 'Xem giá theo ngày', stayLabel: '20/11 – 22/11', onReserve: () => undefined,
  }} /></MemoryRouter>)
  expect(markup).toContain('hero-photo-grid')
  expect(markup).toContain('lg:grid-cols-12')
  expect(markup).toContain('lg:col-span-7 xl:col-span-8')
  expect(markup).toContain('live-rail')
  expect(markup).toContain('Báo giá server 2.050.000₫')
  expect(markup).toContain('Tiêu chuẩn 4 sao')
  expect(markup).toContain('Khách sạn chưa cung cấp ảnh')
  expect(markup).not.toContain('Được khách yêu thích')
  expect(markup).not.toContain('Bảo Nam')
  expect(markup).not.toContain('328 đánh giá')
  expect(markup).not.toContain('Phí vệ sinh chỗ nghỉ')
  expect(markup).not.toContain('staycover')
})
