import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { usePublicHotelDetailQuery } from '@/features/hotels'
import { BookingCheckout, StayCalendar, localDate, type StayForm } from '@/features/bookings'
import { HotelDetailView, useHotelCardSnapshot, type HotelDetailItem } from '@/features/discovery'
import { ErrorState } from '@/shared/ui/ErrorState'
import { PageLoading } from '@/shared/ui/PageLoading'

export function PublicHotelPage({ hotelId }: { hotelId: string }) {
  const query = usePublicHotelDetailQuery(hotelId)
  const card = useHotelCardSnapshot(hotelId)
  const [params] = useSearchParams()
  const [stay, setStay] = useState<StayForm>(() => ({ checkIn: params.get('checkIn') || localDate(), checkOut: params.get('checkOut') || localDate(1),
    adults: Number(params.get('adults') ?? 1), children: Number(params.get('children') ?? 0), quantity: Number(params.get('quantity') ?? 1) }))
  const hotel = query.hotel
  const presentation = useMemo<HotelDetailItem | undefined>(() => hotel ? ({
    id: hotel.id, title: hotel.name, city: card.city ?? hotel.address, location: hotel.address, type: 'Khách sạn',
    hostName: '', hostAvatar: '', hostBio: '', price: card.price ?? 0, rating: 0, reviews: 0,
    specs: [`Nhận phòng từ ${hotel.checkInTime.slice(0, 5)}`, `Trả phòng trước ${hotel.checkOutTime.slice(0, 5)}`],
    sleepDesc: '', photos: card.image ? [card.image] : [], desc: [hotel.description || 'Chỗ nghỉ chưa cung cấp mô tả.'], cleaningFee: 0, serviceFee: 0, discount: 0,
  }) : undefined, [hotel, card.city, card.image, card.price])
  if (query.isLoading) return <PageLoading />
  if (query.isError || !hotel || !presentation) return <ErrorState error={query.error} onRetry={query.refetch} />
  const onReserve = () => {
    document.getElementById('booking-rail')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    document.querySelector<HTMLButtonElement>('#booking-rail .stay-reserve-button')?.focus({ preventScroll: true })
  }
  return <HotelDetailView hotel={presentation} live={{
    onReserve,
    ratingLabel: hotel.starRating ? `Tiêu chuẩn ${hotel.starRating} sao` : 'Chưa công bố tiêu chuẩn sao',
    priceLabel: card.price ? `Từ ${new Intl.NumberFormat('vi-VN').format(card.price)}₫` : 'Xem giá theo ngày',
    stayLabel: `${stay.checkIn.split('-').reverse().join('/')} – ${stay.checkOut.split('-').reverse().join('/')}`,
    bookingRail: <BookingCheckout hotelId={hotel.id} hotelName={hotel.name} stay={stay} onStayChange={setStay} />,
    calendar: <StayCalendar stay={stay} onChange={setStay} city={card.city} />,
    roomTypes: <section className="stay-detail-section"><h3>Nơi bạn sẽ nghỉ ngơi</h3>{query.roomTypes.length ? query.roomTypes.map((room) => <article key={room.id} className="stay-room-description">
      <h4>{room.name}</h4><p>Tối đa {room.maxAdults} người lớn, {room.maxChildren} trẻ em / phòng</p>{room.description && <p>{room.description}</p>}
      {room.amenities?.length ? <ul>{room.amenities.map((item) => <li key={item.id}>{item.name}</li>)}</ul> : null}
    </article>) : <p>Chưa có hạng phòng được công bố.</p>}</section>,
    amenities: <section id="amenities" className="stay-detail-section"><h3>Nơi này có những gì cho bạn?</h3>
      {hotel.amenities?.length ? <ul className="stay-live-amenities">{hotel.amenities.map((item) => <li key={item.id}><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m5 12 4 4L19 6" /></svg>{item.name}</li>)}</ul> : <p>Tiện nghi chưa được cung cấp.</p>}
    </section>,
    reviews: <section id="reviews" className="stay-detail-wide-section"><h3>Đánh giá của khách</h3><p>Đánh giá chưa khả dụng cho chỗ nghỉ này.</p></section>,
    location: <section id="location" className="stay-detail-wide-section"><h3>Nơi bạn sẽ đến</h3><p>{hotel.address}</p>
      {hotel.latitude !== null && hotel.longitude !== null && <a className="stay-map-link" href={`https://www.google.com/maps/search/?api=1&query=${hotel.latitude},${hotel.longitude}`} target="_blank" rel="noreferrer">Mở vị trí trên bản đồ ↗</a>}
    </section>,
    policies: <section id="help-articles" className="stay-detail-wide-section"><h3>Những điều cần biết</h3><div className="stay-rules-grid">
      <div><h4>Nhận &amp; trả phòng</h4><p>Nhận phòng từ {hotel.checkInTime.slice(0, 5)}</p><p>Trả phòng trước {hotel.checkOutTime.slice(0, 5)}</p></div>
      <div><h4>Giá &amp; thanh toán</h4><p>Kiểm tra báo giá của khách sạn trước khi xác nhận. Đơn mới sẽ ở trạng thái chờ thanh toán.</p></div>
      <div><h4>Điều kiện hoàn hủy</h4><p>Điều kiện hoàn hủy chưa được cung cấp. Vui lòng xác nhận với khách sạn trước khi đặt.</p></div>
    </div></section>,
  }} />
}
