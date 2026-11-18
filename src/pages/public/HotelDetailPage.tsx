import { useEffect, useRef, useState } from 'react'
import { Modal } from 'antd'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { usePublicHotelDetailQuery } from '@/features/hotels'
import { checkoutHref } from '@/features/bookings'
import { AuthModal, useSession } from '@/features/auth'
import { ClientGuestPicker, ClientStayDatePicker, ClientHotelGallery, HotelDetailActions, HotelDetailIcon, HotelAmenityIcon, useStayQuote, type StayParams } from '@/features/discovery'
import '@/shared/styles/hotel-stay-detail.css'
import '@/shared/styles/stay-detail-design.css'

const money = (amount: number, currency: string) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(amount)

export function HotelDetailPage() {
  const { hotelId = '' } = useParams()
  const navigate = useNavigate()
  const session = useSession()
  const [loginPrompt, setLoginPrompt] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null)
  const pendingCheckout = useRef<{ href: string; totalAmount: number; currency: string } | null>(null)
  const [url, setUrl] = useSearchParams()
  const validId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(hotelId)
  const detail = usePublicHotelDetailQuery(validId ? hotelId : undefined)
  const roomId = url.get('roomTypeId') ?? ''
  const [amenitiesOpen, setAmenitiesOpen] = useState(false)
  const [descriptionOpen, setDescriptionOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('rooms')
  const filters = useRef<HTMLDivElement>(null)
  const [bookingOpen, setBookingOpen] = useState(false)
  const bookingClose = useRef<HTMLButtonElement>(null)
  const bookingTrigger = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (bookingOpen) bookingClose.current?.focus({ preventScroll: true })
  }, [bookingOpen])

  function openBooking(trigger: HTMLButtonElement) {
    bookingTrigger.current = trigger
    setBookingOpen(true)
  }

  function closeBooking() {
    setBookingOpen(false)
    requestAnimationFrame(() => bookingTrigger.current?.focus({ preventScroll: true }))
  }
  // This customer flow always reserves exactly one room, including old links with quantity > 1.
  const params: StayParams = { checkIn: url.get('checkIn') ?? '', checkOut: url.get('checkOut') ?? '', adults: Number(url.get('adults') ?? 1), children: Number(url.get('children') ?? 0), quantity: 1 }
  const nights = (Date.parse(params.checkOut) - Date.parse(params.checkIn)) / 86400000
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date())
  const valid = Boolean(params.checkIn && params.checkOut && params.checkIn >= today && nights > 0 && nights <= 30 && Number.isInteger(params.adults) && params.adults >= 1 && Number.isInteger(params.children) && params.children >= 0)
  const { inventory, quote, available } = useStayQuote(hotelId, params, roomId, valid && validId)
  const update = (values: Record<string, string>) => {
    const next = new URLSearchParams(url)
    Object.entries(values).forEach(([key, value]) => next.set(key, value))
    next.delete('quantity')
    setUrl(next, { replace: true })
  }
  const selected = detail.roomTypes.find(room => room.id === roomId)
  const currentQuote = valid && available && !inventory.isFetching && !inventory.isError && !quote.isFetching && !quote.isError ? quote.data : undefined
  if (!validId) return <div className="p-10">Không tìm thấy khách sạn. <Link to="/">Về trang chủ</Link></div>
  if (detail.isLoading) return <div className="p-10" role="status">Đang tải khách sạn…</div>
  if (detail.isError || !detail.hotel) return <div className="p-10" role="alert">Không tìm thấy hoặc không tải được khách sạn. <button onClick={detail.refetch}>Thử lại</button> <Link to="/">Về trang chủ</Link></div>
  const hotel = detail.hotel
  const selectedInventory = valid && !inventory.isError && !inventory.isFetching ? inventory.data?.roomTypes.find(r => r.roomTypeId === roomId) : undefined
  return <div className="stay-detail-design">
    <div className="wrap">
      <div className="crumb-row">
        <Link className="crumb" to="/explore"><HotelDetailIcon name="back" />Khám phá khách sạn</Link>
      </div>
      <header className="pdp-head">
        <div>
          <h1 className="pdp-title">{hotel.name}</h1>
          <div className="pdp-meta">
            {hotel.starRating != null && <><span>Khách sạn {hotel.starRating} sao</span><span className="dot-sep" aria-hidden="true">·</span></>}
            <a className="meta-loc" href="#stay-policies">{hotel.address}</a>
          </div>
        </div>
        <div className="pdp-actions"><HotelDetailActions hotelId={hotelId} name={hotel.name} /></div>
      </header>
      <ClientHotelGallery hotelId={hotelId} hotelName={hotel.name} />
    </div>
    <div className="pdp-tabs-wrap">
      <nav className="wrap pdp-tabs" aria-label="Thông tin khách sạn">
        {[['rooms', 'Hạng phòng'], ['amenities', 'Tiện ích'], ['about', 'Giới thiệu'], ['reviews', 'Đánh giá'], ['policies', 'Chính sách & vị trí']].map(([id, label]) => (
          <a key={id} className="pdp-tab" href={`#stay-${id}`} aria-current={activeSection === id ? 'location' : undefined} onClick={() => setActiveSection(id)}>{label}</a>
        ))}
      </nav>
    </div>
    <div className="wrap pdp-grid">
      <div className="pdp-main">
        <section id="stay-rooms" className="pdp-sec">
          <div className="sec-head">
            <h2 className="sec-title">Chọn hạng phòng</h2>
            <p className="sec-sub">Lựa chọn hạng phòng phù hợp với kỳ nghỉ của bạn</p>
          </div>
          {!detail.roomTypes.length && <p className="sec-sub">Chưa có hạng phòng được công bố.</p>}
          <div className="rooms">{detail.roomTypes.map(room => {
          const state = valid && !inventory.isError ? inventory.data?.roomTypes.find(r => r.roomTypeId === room.id) : undefined
          const capacity = state?.maxOccupancy ?? room.maxOccupancy
          const selectedRoom = roomId === room.id
          return <article key={room.id} className="room">
            <div className="room-thumb"><HotelDetailIcon name="bed" /><span>Chưa có ảnh hạng phòng</span></div>
            <div className="room-body">
              <div className="room-name-row"><h3 className="room-name">{room.name}</h3>{selectedRoom && <span className="room-flag">Đang chọn</span>}</div>
              {room.description && <p className="room-desc">{room.description}</p>}
              <ul className="room-facts" aria-label="Sức chứa">
                <li className="room-fact"><HotelDetailIcon name="guests" /><span>{room.maxAdults} người lớn · {room.maxChildren} trẻ em</span></li>
                {capacity != null && <li className="room-fact">Tối đa {capacity} khách</li>}
              </ul>
              {!!room.amenities?.length && <ul className="room-facts" aria-label="Tiện ích hạng phòng">
                {room.amenities.map(a => <li className="room-fact" key={a.id}><HotelAmenityIcon code={a.code} />{a.name}</li>)}
              </ul>}
            </div>
            <div className="room-buy">
              <div className="room-buy-main">
                {valid && inventory.isFetching ? <p>Đang tải giá…</p> : state?.pricePerNight != null ? (
                  <p className="room-price">{money(state.pricePerNight, state.currency)}<span>/ đêm</span></p>
                ) : <p>{!valid ? 'Chọn ngày để xem giá' : 'Chưa có giá phù hợp'}</p>}
                {valid && !inventory.isFetching && !inventory.isError && state?.totalEstimatedPrice != null && (
                  <small>{money(state.totalEstimatedPrice, state.currency)} / {nights} đêm · tạm tính</small>
                )}
                <p className="room-stock">{!valid ? 'Chọn ngày để kiểm tra phòng trống' : inventory.isFetching ? 'Đang kiểm tra phòng trống…' : inventory.isError ? 'Chưa xác định tình trạng phòng' : state?.isAvailable ? `Còn ${state.availableQuantity} phòng phù hợp` : 'Không có phòng phù hợp với lựa chọn này'}</p>
              </div>
              <button type="button" className="room-cta" aria-pressed={selectedRoom} onClick={event => {
                update({ roomTypeId: room.id })
                if (window.matchMedia('(max-width: 1023px)').matches) openBooking(event.currentTarget)
                else if (!valid) filters.current?.querySelector<HTMLButtonElement>('.hotel-stay-date-trigger')?.focus()
              }}>{selectedRoom ? 'Đã chọn phòng' : 'Chọn phòng'}</button>
            </div>
          </article>
        })}</div>
        </section>
        <section id="stay-amenities" className="pdp-sec">
          <div className="sec-head"><h2 className="sec-title">Nơi này có những gì cho bạn</h2><p className="sec-sub">Tiện ích khách sạn</p></div>
          {hotel.amenities?.length ? <>
            <ul className="amenity-grid">{hotel.amenities.slice(0, 10).map(a => <li className="amenity" key={a.id}><HotelAmenityIcon code={a.code} /><span>{a.name}</span></li>)}</ul>
            {hotel.amenities.length > 10 && <button type="button" className="stay-detail-outline" onClick={() => setAmenitiesOpen(true)}>Hiển thị tất cả {hotel.amenities.length} tiện nghi</button>}
          </> : <p>Chưa có thông tin tiện ích.</p>}
        </section>
        <section id="stay-about" className="pdp-sec">
          <div className="sec-head"><h2 className="sec-title">Giới thiệu về khách sạn</h2></div>
          <p id="stay-description" className={`stay-description${!descriptionOpen && (hotel.description?.length ?? 0) > 700 ? ' is-collapsed' : ''}`}>{hotel.description || 'Chưa có thông tin giới thiệu.'}</p>
          {(hotel.description?.length ?? 0) > 700 && <button className="intro-toggle" type="button" aria-expanded={descriptionOpen} aria-controls="stay-description" onClick={() => setDescriptionOpen(open => !open)}>{descriptionOpen ? 'Thu gọn' : 'Đọc thêm về chỗ ở'}</button>}
        </section>
        <section id="stay-reviews" className="pdp-sec">
          <div className="sec-head"><h2 className="sec-title">Đánh giá từ khách lưu trú</h2><p className="sec-sub">Chưa có thông tin đánh giá.</p></div>
        </section>
        <section id="stay-policies" className="pdp-sec">
          <div className="sec-head"><h2 className="sec-title">Quy định &amp; thông tin lưu trú</h2><p className="sec-sub">Những điều bạn cần biết trước khi đặt và nhận phòng</p></div>
          <div className="policy-card">
            <div className="policy-item"><HotelDetailIcon name="checkIn" /><strong className="policy-title">Nhận phòng</strong><p className="policy-text">Từ {hotel.checkInTime.slice(0, 5)} mỗi ngày</p></div>
            <div className="policy-item"><HotelDetailIcon name="checkOut" /><strong className="policy-title">Trả phòng</strong><p className="policy-text">Trước {hotel.checkOutTime.slice(0, 5)}</p></div>
          </div>
          <div className="map-block">
            <h3 className="sec-title">Vị trí &amp; chỉ dẫn di chuyển</h3>
            <div className="map-caption">
              <p>{hotel.address}</p>
              {hotel.latitude != null && hotel.longitude != null && <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${hotel.latitude},${hotel.longitude}`)}`} target="_blank" rel="noopener noreferrer">Mở trong Google Maps</a>}
            </div>
          </div>
        </section>
      </div>
      <aside id="stay-booking" className={`booking${bookingOpen ? ' is-open' : ''}`} aria-label="Đặt phòng của bạn" onKeyDown={event => {
        if (event.key === 'Escape' && bookingOpen && !event.defaultPrevented && event.currentTarget.contains(event.target as Node) && !(event.target as HTMLElement).closest('[aria-expanded="true"]')) closeBooking()
      }}>
        <button ref={bookingClose} className="book-close" type="button" aria-label="Đóng bảng đặt phòng" onClick={closeBooking}>×</button>
        <div className="book-card">
          <div className="book-price-row">
            <strong className="book-price">{selectedInventory?.pricePerNight != null ? <>{money(selectedInventory.pricePerNight, selectedInventory.currency)} <small>/ đêm</small></> : 'Đặt phòng của bạn'}</strong>
          </div>
          <div className="hotel-stay-filters book-dates" ref={filters} role="group" aria-label="Ngày lưu trú và số khách">
            <ClientStayDatePicker today={today} checkIn={params.checkIn} checkOut={params.checkOut} onChange={dates => update(dates)} />
            <ClientGuestPicker label="Khách" showRoomCount autoAdjustOverflow value={{ adults: params.adults, children: params.children }} roomTypes={detail.roomTypes.map(room => ({ ...room, maxOccupancy: inventory.data?.roomTypes.find(r => r.roomTypeId === room.id)?.maxOccupancy ?? room.maxOccupancy }))} selectedRoomId={roomId} onChange={guests => update({ adults: String(guests.adults), children: String(guests.children) })} />
          </div>
          {!valid && <p className="book-note">Chọn ngày lưu trú hợp lệ (tối đa 30 đêm) và số khách để xem giá.</p>}
          {inventory.isError && <p className="book-error" role="alert">Không kiểm tra được giá và phòng trống. <button onClick={() => void inventory.refetch()}>Thử lại</button></p>}
          <dl className="book-lines" aria-live="polite"><div className="book-line"><dt>Hạng phòng</dt><dd>{selected?.name || 'Chưa chọn hạng phòng'}</dd></div></dl>
          {selected && valid && !inventory.isFetching && !inventory.isError && !available && <p role="status" className="book-error">Hạng phòng đã chọn không còn phù hợp. Hãy đổi ngày, số khách hoặc hạng phòng.</p>}
          {roomId && valid && available && quote.isFetching && <p role="status">Đang lấy báo giá…</p>}
          {quote.isError && valid && available && <p role="alert" className="book-error">Không lấy được báo giá. <button onClick={() => void quote.refetch()}>Thử lại</button></p>}
          <button type="button" className="hotel-stay-continue book-cta" disabled={!selected || !currentQuote} onClick={() => {
            if (!currentQuote) return
            const checkout = { href: checkoutHref(hotelId, roomId, params), totalAmount: currentQuote.totalAmount, currency: currentQuote.currency }
            if (!session) {
              pendingCheckout.current = checkout
              setBookingOpen(false)
              setLoginPrompt(true)
              return
            }
            void navigate(checkout.href, { state: { totalAmount: checkout.totalAmount, currency: checkout.currency } })
          }}>Đặt phòng</button>
          <p className="book-note">{currentQuote ? 'Báo giá chưa giữ phòng. Bạn chưa bị trừ tiền.' : 'Chọn ngày, số khách và hạng phòng để nhận báo giá.'}</p>
          {currentQuote && <dl className="book-lines">
            <div className="book-line"><dt>Tiền phòng</dt><dd>{money(currentQuote.roomSubtotalAmount, currentQuote.currency)}</dd></div>
            <div className="book-line"><dt>Phụ thu</dt><dd>{money(currentQuote.surchargeAmount, currentQuote.currency)}</dd></div>
            <div className="book-line"><dt>Giảm giá</dt><dd>−{money(currentQuote.discountAmount, currentQuote.currency)}</dd></div>
          </dl>}
          <div className="book-total"><span>Tổng cần thanh toán</span><strong>{currentQuote ? money(currentQuote.totalAmount, currentQuote.currency) : '—'}</strong></div>
        </div>
      </aside>
    </div>
    <div className="stay-booking-spacer" aria-hidden="true" />
    <div className="mobile-bar">
      <div className="mobile-bar-price"><strong>{currentQuote ? money(currentQuote.totalAmount, currentQuote.currency) : 'Chọn ngày lưu trú'}</strong></div>
      <button type="button" aria-expanded={bookingOpen} aria-controls="stay-booking" onClick={event => openBooking(event.currentTarget)}>Đặt phòng</button>
    </div>
    {bookingOpen && <div className="booking-scrim" aria-hidden="true" onClick={closeBooking} />}
    <Modal title="Tiện ích khách sạn" open={amenitiesOpen} onCancel={() => setAmenitiesOpen(false)} footer={null}><ul className="hotel-stay-amenities hotel-amenities-modal">{hotel.amenities?.map(a => <li key={a.id}><HotelAmenityIcon code={a.code} /><span>{a.name}</span></li>)}</ul></Modal>
    <Modal className="checkout-login-prompt" title="Đăng nhập" open={loginPrompt} onCancel={() => setLoginPrompt(false)} footer={null} centered destroyOnHidden>
      <h2>Vui lòng đăng nhập để thanh toán</h2><p>Đăng nhập để tiếp tục đặt phòng của bạn.</p>
      <button type="button" className="checkout-login-primary" onClick={() => { setLoginPrompt(false); setAuthMode('login') }}>Đăng nhập ngay</button>
      <div className="checkout-login-switch">Chưa có tài khoản? <button type="button" onClick={() => { setLoginPrompt(false); setAuthMode('register') }}>Đăng ký</button></div>
    </Modal>
    <AuthModal isOpen={authMode !== null} initialMode={authMode ?? 'login'} onClose={() => setAuthMode(null)} variant="checkout" onSuccess={() => { const checkout = pendingCheckout.current; if (checkout) void navigate(checkout.href, { state: { totalAmount: checkout.totalAmount, currency: checkout.currency } }) }} />
  </div>
}
