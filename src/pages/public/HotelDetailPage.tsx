import { useState } from 'react'
import { Link, useLocation, useParams, useSearchParams } from 'react-router'
import { usePublicHotelDetailQuery } from '@/features/hotels'
import { ClientHotelCover, useStayQuote, type StayParams } from '@/features/discovery'

const money = (amount: number, currency: string) => `${new Intl.NumberFormat('vi-VN').format(amount)} ${currency}`
const input = 'w-full rounded-lg border border-[#d7cec1] bg-white p-3'

export function HotelDetailPage() {
  const { hotelId = '' } = useParams()
  const location = useLocation()
  const state: unknown = location.state
  const coverMediaId = typeof state === 'object' && state !== null && 'hotelId' in state && state.hotelId === hotelId && 'coverMediaId' in state && typeof state.coverMediaId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(state.coverMediaId) ? state.coverMediaId : undefined
  const [url, setUrl] = useSearchParams()
  const validId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(hotelId)
  const detail = usePublicHotelDetailQuery(validId ? hotelId : undefined)
  const [roomId, setRoomId] = useState('')
  const params: StayParams = { checkIn: url.get('checkIn') ?? '', checkOut: url.get('checkOut') ?? '', adults: Number(url.get('adults') ?? 1), children: Number(url.get('children') ?? 0), quantity: Number(url.get('quantity') ?? 1) }
  const nights = (Date.parse(params.checkOut) - Date.parse(params.checkIn)) / 86400000
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date())
  const valid = Boolean(params.checkIn && params.checkOut && params.checkIn >= today && nights > 0 && nights <= 30 && Number.isInteger(params.adults) && params.adults >= 1 && Number.isInteger(params.children) && params.children >= 0 && Number.isInteger(params.quantity) && params.quantity >= 1)
  const { inventory, quote, available } = useStayQuote(hotelId, params, roomId, valid && validId)
  const update = (key: keyof StayParams, value: string) => { const next = new URLSearchParams(url); next.set(key, value); setUrl(next, { replace: true }) }
  if (!validId) return <div className="p-10">Không tìm thấy khách sạn. <Link to="/">Về trang chủ</Link></div>
  if (detail.isLoading) return <div className="p-10">Đang tải khách sạn…</div>
  if (detail.isError || !detail.hotel) return <div className="p-10" role="alert">Không tìm thấy hoặc không tải được khách sạn. <button onClick={detail.refetch}>Thử lại</button> <Link to="/">Về trang chủ</Link></div>
  const hotel = detail.hotel
  return <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6"><Link to="/">← Khám phá khách sạn</Link><h1 className="mt-5 text-3xl font-serif sm:text-4xl">{hotel.name}</h1><p className="mt-2 text-[#706a62]">{hotel.starRating != null && `${hotel.starRating} sao · `}{hotel.address}</p>
    <ClientHotelCover mediaId={coverMediaId} hotelName={hotel.name} />
    <div className="grid gap-10 lg:grid-cols-3"><div className="space-y-10 lg:col-span-2"><section><h2 className="text-2xl font-semibold">Giới thiệu</h2><p className="mt-4 whitespace-pre-line">{hotel.description || 'Chưa có thông tin giới thiệu.'}</p></section>
      {!!hotel.amenities?.length && <section><h2 className="text-2xl font-semibold">Tiện ích khách sạn</h2><ul className="mt-4 grid gap-2 sm:grid-cols-2">{hotel.amenities.map(a => <li key={a.id}>✓ {a.name}</li>)}</ul></section>}
      <section><h2 className="text-2xl font-semibold">Hạng phòng</h2>{detail.roomTypes.length === 0 && <p className="mt-4">Chưa có hạng phòng được công bố.</p>}<div className="mt-4 space-y-4">{detail.roomTypes.map(room => { const state = inventory.data?.roomTypes.find(r => r.roomTypeId === room.id); return <article key={room.id} className="rounded-xl border border-[#e3dcd1] p-5"><h3 className="text-xl font-semibold">{room.name}</h3>{room.description && <p>{room.description}</p>}<p className="mt-2">Tối đa {room.maxAdults} người lớn, {room.maxChildren} trẻ em / phòng</p>{!!room.amenities?.length && <p>{room.amenities.map(a => a.name).join(' · ')}</p>}<p className="mt-2">{!valid ? 'Chọn ngày để kiểm tra' : inventory.isFetching ? 'Đang kiểm tra…' : state?.isAvailable ? `Còn ${state.availableQuantity} phòng` : 'Không khả dụng cho lựa chọn này hoặc chưa có giá'}</p><button className="mt-3 rounded-lg border px-4 py-2 disabled:opacity-40" disabled={!state?.isAvailable || inventory.isFetching} onClick={() => setRoomId(room.id)}>{roomId === room.id ? 'Đã chọn' : 'Chọn hạng phòng'}</button></article> })}</div></section>
      <section><h2 className="text-2xl font-semibold">Thông tin lưu trú</h2><p className="mt-3">Nhận phòng: {hotel.checkInTime} · Trả phòng: {hotel.checkOutTime}</p><p className="mt-2">{hotel.address}</p></section></div>
      <aside><div className="sticky top-6 rounded-2xl border border-[#e3dcd1] bg-white p-6"><h2 className="text-xl font-semibold">Kiểm tra phòng và giá</h2><div className="mt-4 grid grid-cols-2 gap-3"><label>Nhận phòng<input className={input} type="date" value={params.checkIn} onChange={e => update('checkIn', e.target.value)} /></label><label>Trả phòng<input className={input} type="date" value={params.checkOut} onChange={e => update('checkOut', e.target.value)} /></label><label>Người lớn / phòng<input className={input} type="number" min="1" value={params.adults} onChange={e => update('adults', e.target.value)} /></label><label>Trẻ em / phòng<input className={input} type="number" min="0" value={params.children} onChange={e => update('children', e.target.value)} /></label><label>Số phòng<input className={input} type="number" min="1" value={params.quantity} onChange={e => update('quantity', e.target.value)} /></label></div>
        {!valid && <p className="mt-4">Chọn ngày hợp lệ (tối đa 30 đêm), số khách và số phòng.</p>}{inventory.isError && <p role="alert" className="mt-4">Không kiểm tra được tình trạng phòng. <button onClick={() => void inventory.refetch()}>Thử lại</button></p>}{valid && inventory.data?.roomTypes.length === 0 && <p className="mt-4">Không có hạng phòng phù hợp sức chứa.</p>}
        {roomId && available && quote.isFetching && <p className="mt-4">Đang lấy báo giá…</p>}{quote.isError && <p role="alert" className="mt-4">Không lấy được báo giá. <button onClick={() => void quote.refetch()}>Thử lại</button></p>}{available && !quote.isFetching && quote.data && <div className="mt-4 space-y-2"><p className="font-semibold">Báo giá {quote.data.nights} đêm</p>{quote.data.items.flatMap(i => i.nightlyPrices.map(n => <p key={i.roomTypeId + n.stayDate}>{n.stayDate}: {money(n.unitPrice, quote.data.currency)} / phòng</p>))}<p>Tiền phòng: {money(quote.data.roomSubtotalAmount, quote.data.currency)}</p><p>Phụ thu: {money(quote.data.surchargeAmount, quote.data.currency)}</p><p>Giảm giá: {money(quote.data.discountAmount, quote.data.currency)}</p><p className="font-bold">Tổng: {money(quote.data.totalAmount, quote.data.currency)}</p><p className="text-sm">Báo giá chưa giữ phòng.</p></div>}
        <button disabled className="mt-5 w-full rounded-lg bg-[#a8532a] p-3 text-white opacity-50">Tiếp tục đặt phòng</button><p className="mt-2 text-sm text-[#706a62]">Chức năng đặt phòng trực tuyến chưa sẵn sàng.</p></div></aside></div>
  </div>
}
