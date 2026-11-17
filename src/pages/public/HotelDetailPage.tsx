import { useRef, useState } from 'react'
import { Modal } from 'antd'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { usePublicHotelDetailQuery } from '@/features/hotels'
import { checkoutHref } from '@/features/bookings'
import { AuthModal, useSession } from '@/features/auth'
import { ClientGuestPicker, ClientStayDatePicker, ClientHotelGallery, HotelDetailActions, HotelDetailIcon, HotelAmenityIcon, useStayQuote, type StayParams } from '@/features/discovery'
import '@/shared/styles/hotel-stay-detail.css'

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
  return <div className="hotel-stay-detail">
    <header className="hotel-stay-heading"><Link to="/"><HotelDetailIcon name="back" />Khám phá khách sạn</Link><div className="hotel-detail-title-row"><div><h1>{hotel.name}</h1><div className="hotel-detail-meta">{hotel.starRating != null && <><span className="hotel-detail-stars" aria-label={`${hotel.starRating} sao`}>{Array.from({ length: Math.max(0, Math.min(5, Math.floor(hotel.starRating))) }, (_, i) => <HotelDetailIcon key={i} name="star" />)}</span><strong>Khách sạn {hotel.starRating} sao</strong><span>·</span></>}<a href="#stay-policies">{hotel.address}</a></div></div><HotelDetailActions hotelId={hotelId} name={hotel.name} /></div></header>
    <ClientHotelGallery hotelId={hotelId} hotelName={hotel.name} />
    <nav className="hotel-stay-nav" aria-label="Thông tin khách sạn">
      {[['rooms', 'Hạng phòng'], ['amenities', 'Tiện ích'], ['about', 'Giới thiệu'], ['policies', 'Chính sách & Vị trí']].map(([id, label]) => <a key={id} href={`#stay-${id}`} aria-current={activeSection === id ? 'location' : undefined} onClick={() => setActiveSection(id)}>{label}</a>)}
    </nav>
    <div className="hotel-stay-columns"><div className="hotel-stay-content">
      <section id="stay-rooms" className="hotel-stay-section"><div className="hotel-section-heading"><h2>Chọn hạng phòng</h2><p>Lựa chọn hạng phòng phù hợp với kỳ nghỉ của bạn</p></div>
        {!detail.roomTypes.length && <p className="hotel-stay-notice">Chưa có hạng phòng được công bố.</p>}
        <div className="hotel-stay-rooms">{detail.roomTypes.map(room => {
          const state = valid && !inventory.isError ? inventory.data?.roomTypes.find(r => r.roomTypeId === room.id) : undefined
          const capacity = state?.maxOccupancy ?? room.maxOccupancy
          const selectedRoom = roomId === room.id
          return <article key={room.id} className={`hotel-room-card${selectedRoom ? ' is-selected' : ''}`}>
            <div className="hotel-room-photo"><HotelDetailIcon name="bed" /><span>Chưa có ảnh hạng phòng</span></div>
            <div className="hotel-room-info"><div className="hotel-room-title"><h3>{room.name}</h3>{selectedRoom && <span className="hotel-room-selected">Đang chọn</span>}</div>{room.description && <p>{room.description}</p>}
              <ul className="hotel-room-chips" aria-label="Sức chứa"><li><HotelDetailIcon name="guests" /><span>{room.maxAdults} người lớn · {room.maxChildren} trẻ em</span></li>{capacity != null && <li>Tối đa {capacity} khách</li>}</ul>
              {!!room.amenities?.length && <ul className="hotel-room-amenities" aria-label="Tiện ích hạng phòng">{room.amenities.map(a => <li key={a.id}><HotelAmenityIcon code={a.code} />{a.name}</li>)}</ul>}
              <p className="hotel-room-status">{!valid ? 'Chọn ngày để kiểm tra phòng trống' : inventory.isFetching ? 'Đang kiểm tra phòng trống…' : inventory.isError ? 'Chưa xác định tình trạng phòng' : state?.isAvailable ? `Còn ${state.availableQuantity} phòng phù hợp` : 'Không có phòng phù hợp với lựa chọn này'}</p>
            </div>
            <div className="hotel-room-price">{valid && inventory.isFetching ? <p>Đang tải giá…</p> : state?.pricePerNight != null ? <><span>Từ</span><strong>{money(state.pricePerNight, state.currency)}</strong><span>/ đêm</span>{state.totalEstimatedPrice != null && <small>{money(state.totalEstimatedPrice, state.currency)} / {nights} đêm · tạm tính</small>}</> : <p>{!valid ? 'Chọn ngày để xem giá' : 'Chưa có giá phù hợp'}</p>}
              <button type="button" aria-pressed={selectedRoom} onClick={() => { update({ roomTypeId: room.id }); if (!valid || window.matchMedia('(max-width: 900px)').matches) { filters.current?.scrollIntoView({ block: 'center', behavior: 'smooth' }); if (!valid) filters.current?.querySelector<HTMLButtonElement>('.hotel-stay-date-trigger')?.focus({ preventScroll: true }) } }}>{selectedRoom && <HotelDetailIcon name="selected" />}{selectedRoom ? 'Đã chọn phòng' : 'Chọn phòng'}</button>
            </div>
          </article>
        })}</div>
      </section>
      <section id="stay-amenities" className="hotel-stay-section"><div className="hotel-section-heading"><h2>Nơi này có những gì cho bạn</h2><p>Tiện ích khách sạn</p></div>{hotel.amenities?.length ? <><ul className="hotel-stay-amenities">{hotel.amenities.slice(0, 10).map(a => <li key={a.id}><HotelAmenityIcon code={a.code} /><span>{a.name}</span></li>)}</ul>{hotel.amenities.length > 10 && <button type="button" className="hotel-detail-outline" onClick={() => setAmenitiesOpen(true)}>Hiển thị tất cả {hotel.amenities.length} tiện nghi</button>}</> : <p>Chưa có thông tin tiện ích.</p>}</section>
      <section id="stay-about" className="hotel-stay-section"><h2>Giới thiệu về khách sạn</h2><p className="hotel-stay-description">{hotel.description || 'Chưa có thông tin giới thiệu.'}</p>{hotel.description && hotel.description.length > 700 && <button type="button" className="hotel-detail-read-more" onClick={() => setDescriptionOpen(true)}>Đọc thêm về chỗ ở<HotelDetailIcon name="next" /></button>}</section>
      <section id="stay-policies" className="hotel-stay-section"><div className="hotel-section-heading"><h2>Quy định & Thông tin lưu trú</h2><p>Những điều bạn cần biết trước khi đặt và nhận phòng</p></div><div className="hotel-stay-policies-card"><div className="hotel-stay-times"><div><HotelDetailIcon name="checkIn" /><div><small>Nhận phòng</small><strong>Từ {hotel.checkInTime.slice(0, 5)} mỗi ngày</strong></div></div><div><HotelDetailIcon name="checkOut" /><div><small>Trả phòng</small><strong>Trước {hotel.checkOutTime.slice(0, 5)}</strong></div></div></div><div className="hotel-stay-location"><h3>Vị trí & Chỉ dẫn di chuyển</h3><p>{hotel.address}</p>{hotel.latitude != null && hotel.longitude != null && <a className="hotel-detail-outline" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${hotel.latitude},${hotel.longitude}`)}`} target="_blank" rel="noopener noreferrer">Xem vị trí trên bản đồ</a>}</div></div></section>
    </div>
    <aside className="hotel-stay-summary" aria-label="Đặt phòng của bạn"><div className="hotel-stay-summary-card"><h2 className="sr-only">Đặt phòng của bạn</h2><div className="hotel-summary-rate">{selectedInventory?.pricePerNight != null ? <><strong>{money(selectedInventory.pricePerNight, selectedInventory.currency)}</strong><span>/ đêm</span></> : <strong>Đặt phòng của bạn</strong>}</div>
      <div className="hotel-stay-filters" ref={filters} role="group" aria-label="Ngày lưu trú và số khách">
        <ClientStayDatePicker today={today} checkIn={params.checkIn} checkOut={params.checkOut} onChange={dates => update(dates)} />
        <ClientGuestPicker label="Khách" showRoomCount value={{ adults: params.adults, children: params.children }} roomTypes={detail.roomTypes.map(room => ({ ...room, maxOccupancy: inventory.data?.roomTypes.find(r => r.roomTypeId === room.id)?.maxOccupancy ?? room.maxOccupancy }))} selectedRoomId={roomId} onChange={guests => update({ adults: String(guests.adults), children: String(guests.children) })} />
      </div>
      {!valid && <p className="hotel-stay-notice">Chọn ngày lưu trú hợp lệ (tối đa 30 đêm) và số khách để xem giá.</p>}
      {inventory.isError && <p className="hotel-stay-error" role="alert">Không kiểm tra được giá và phòng trống. <button onClick={() => void inventory.refetch()}>Thử lại</button></p>}
      <dl className="hotel-stay-summary-selection" aria-live="polite"><div><dt>Hạng phòng:</dt><dd>{selected?.name || 'Chưa chọn hạng phòng'}</dd></div></dl>
      {selected && valid && !inventory.isFetching && !inventory.isError && !available && <p role="status" className="hotel-stay-error">Hạng phòng đã chọn không còn phù hợp. Hãy đổi ngày, số khách hoặc hạng phòng.</p>}
      {roomId && valid && available && quote.isFetching && <p role="status">Đang lấy báo giá…</p>}
      {quote.isError && valid && available && <p role="alert" className="hotel-stay-error">Không lấy được báo giá. <button onClick={() => void quote.refetch()}>Thử lại</button></p>}
      {currentQuote && <dl className="hotel-stay-breakdown"><div><dt>Tiền phòng</dt><dd>{money(currentQuote.roomSubtotalAmount, currentQuote.currency)}</dd></div><div><dt>Phụ thu</dt><dd>{money(currentQuote.surchargeAmount, currentQuote.currency)}</dd></div><div><dt>Giảm giá</dt><dd>−{money(currentQuote.discountAmount, currentQuote.currency)}</dd></div></dl>}
      <div className="hotel-stay-total"><span>Tổng cần thanh toán</span><strong>{currentQuote ? money(currentQuote.totalAmount, currentQuote.currency) : '—'}</strong></div>
      <button type="button" className="hotel-stay-continue" disabled={!selected || !currentQuote} onClick={() => { if (!currentQuote) return; const checkout = { href: checkoutHref(hotelId, roomId, params), totalAmount: currentQuote.totalAmount, currency: currentQuote.currency }; if (!session) { pendingCheckout.current = checkout; setLoginPrompt(true); return } void navigate(checkout.href, { state: { totalAmount: checkout.totalAmount, currency: checkout.currency } }) }}>Thanh toán<HotelDetailIcon name="book" /></button>
      <p className="hotel-stay-summary-note">{currentQuote ? 'Báo giá chưa giữ phòng. Bạn chưa bị trừ tiền.' : 'Chọn ngày, số khách và hạng phòng để nhận báo giá.'}</p>
    </div></aside></div>
    <Modal title="Tiện ích khách sạn" open={amenitiesOpen} onCancel={() => setAmenitiesOpen(false)} footer={null}><ul className="hotel-stay-amenities hotel-amenities-modal">{hotel.amenities?.map(a => <li key={a.id}><HotelAmenityIcon code={a.code} /><span>{a.name}</span></li>)}</ul></Modal>
    <Modal title="Giới thiệu về khách sạn" open={descriptionOpen} onCancel={() => setDescriptionOpen(false)} footer={null}><p className="hotel-detail-full-description">{hotel.description}</p></Modal>
    <Modal className="checkout-login-prompt" title="Đăng nhập" open={loginPrompt} onCancel={() => setLoginPrompt(false)} footer={null} centered destroyOnHidden>
      <h2>Vui lòng đăng nhập để thanh toán</h2><p>Đăng nhập để tiếp tục đặt phòng của bạn.</p>
      <button type="button" className="checkout-login-primary" onClick={() => { setLoginPrompt(false); setAuthMode('login') }}>Đăng nhập ngay</button>
      <div className="checkout-login-switch">Chưa có tài khoản? <button type="button" onClick={() => { setLoginPrompt(false); setAuthMode('register') }}>Đăng ký</button></div>
    </Modal>
    <AuthModal isOpen={authMode !== null} initialMode={authMode ?? 'login'} onClose={() => setAuthMode(null)} variant="checkout" onSuccess={() => { const checkout = pendingCheckout.current; if (checkout) void navigate(checkout.href, { state: { totalAmount: checkout.totalAmount, currency: checkout.currency } }) }} />
  </div>
}
