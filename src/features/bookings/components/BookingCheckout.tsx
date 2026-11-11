import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, Modal } from 'antd'
import { Link, useLocation } from 'react-router'
import { useCurrentUser, useSession } from '@/features/auth'
import { PaymentButton } from '@/features/payments'
import { errorMessage } from '@/shared/api/api-error'
import { applyApiFieldErrors } from '@/shared/lib/form-errors'
import { bookerFormSchema, localDate, type BookerForm, type StayForm } from '../api/booking-api'
import { useBookingCheckout } from '../hooks/use-booking-checkout'

interface Props { hotelId: string; hotelName?: string; stay?: StayForm; initialStay?: Partial<StayForm>; onStayChange?: (stay: StayForm) => void }
const dateLabel = (date: string) => date.split('-').reverse().join('/')
const money = (value: number, currency = 'VND') => new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(value)

export function BookingCheckout({ hotelId, hotelName, stay: controlledStay, initialStay, onStayChange }: Props) {
  const [localStay, setLocalStay] = useState<StayForm>(() => ({ checkIn: localDate(), checkOut: localDate(1), adults: 1, children: 0, quantity: 1, ...initialStay }))
  const stay = controlledStay ?? localStay
  const changeStay = onStayChange ?? setLocalStay
  const flow = useBookingCheckout(hotelId, stay)
  const session = useSession()
  const { currentUser } = useCurrentUser()
  const location = useLocation()
  const [confirm, setConfirm] = useState(false)
  const booker = useForm<BookerForm>({ resolver: zodResolver(bookerFormSchema), resetOptions: { keepDirtyValues: true }, values: {
    fullName: currentUser?.fullName ?? '', email: currentUser?.email ?? '', phone: currentUser?.phone ?? '',
  } })
  // RHF needs this subscription to preserve edited fields when the profile arrives.
  void booker.formState.dirtyFields
  const current = flow.currentQuote?.quote
  const pending = flow.availability.isPending || flow.quote.isPending || flow.busy
  function showCalendar() {
    document.getElementById('booking-calendar')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    document.querySelector<HTMLButtonElement>('#booking-calendar button[data-date]')?.focus({ preventScroll: true })
  }
  function reserve() {
    if (!flow.validation.success || pending) return
    if (!flow.checked) { flow.availability.mutate(stay); return }
    if (!flow.selected) return
    if (current) { setConfirm(true); return }
    flow.quote.mutate(stay, { onSuccess: () => setConfirm(true) })
  }
  const cta = flow.availability.isPending ? 'Đang kiểm tra phòng…' : flow.quote.isPending ? 'Đang lấy báo giá…' : !flow.checked ? 'Kiểm tra phòng trống' : !flow.selected ? 'Chọn hạng phòng bên dưới' : 'Đặt phòng'
  return <aside className="lg:col-span-5 xl:col-span-4 relative" data-od-id="booking-rail" id="booking-rail">
    <div className="stay-booking-card lg:sticky lg:top-28">
      {flow.create.data ? <div role="status" className="stay-booking-success">
        <h2>Đã tạo đơn {flow.create.data.bookingCode}</h2>
        <p>{dateLabel(flow.create.data.checkIn)} – {dateLabel(flow.create.data.checkOut)}</p>
        <p>{flow.create.data.status === 'PENDING_PAYMENT' ? 'Đang chờ thanh toán' : flow.create.data.status}</p>
        <strong>{money(flow.create.data.totalAmount, flow.create.data.currency)}</strong>
        {flow.create.data.expiresAt && <p>Hạn thanh toán: {new Date(flow.create.data.expiresAt).toLocaleString('vi-VN')}</p>}
        <p><Link to="/my-bookings">Xem đơn đặt phòng của tôi</Link></p>
        {flow.create.data.status === 'PENDING_PAYMENT' && <PaymentButton bookingId={flow.create.data.id} />}
      </div> : <>
        <div className="stay-booking-price"><div>
          <strong>{flow.selected?.pricePerNight != null ? money(flow.selected.pricePerNight, flow.selected.currency) : 'Chọn kỳ nghỉ'}</strong>
          {flow.selected?.pricePerNight != null && <span> / đêm</span>}</div><small>{current ? 'Báo giá từ khách sạn' : 'Giá theo ngày & hạng phòng'}</small>
        </div>
        <fieldset className="stay-booking-fields" aria-label="Ngày lưu trú và số khách" disabled={pending}>
          <div className="stay-booking-dates">
            <button type="button" onClick={showCalendar}><span>Nhận phòng</span><strong>{dateLabel(stay.checkIn)}</strong></button>
            <button type="button" onClick={showCalendar}><span>Trả phòng</span><strong>{dateLabel(stay.checkOut)}</strong></button>
          </div>
          <details className="stay-guest-picker"><summary><span><small>Khách &amp; phòng</small><strong>{stay.adults + stay.children} khách · {stay.quantity} phòng</strong></span><span aria-hidden="true">⌄</span></summary>
            <div className="stay-guest-options">{(['adults', 'children', 'quantity'] as const).map((key) => <label key={key}><span>{{ adults: 'Người lớn', children: 'Trẻ em', quantity: 'Số phòng' }[key]}</span>
              <input type="number" min={key === 'children' ? 0 : 1} max={50} value={Number.isFinite(stay[key]) ? stay[key] : ''} onChange={(event) => changeStay({ ...stay, [key]: event.target.valueAsNumber })} /></label>)}</div>
          </details>
        </fieldset>
        {!flow.validation.success && <p role="alert" className="stay-field-error">{flow.validation.error.issues[0].message}</p>}
        {flow.checked && <div className="stay-room-choice"><label htmlFor="booking-room-type">Hạng phòng</label>
          <select id="booking-room-type" value={flow.roomTypeId} disabled={pending} onChange={(event) => flow.selectRoom(event.target.value)}><option value="">Chọn hạng phòng</option>
            {flow.checked.roomTypes.map((room) => <option key={room.roomTypeId} value={room.roomTypeId} disabled={!room.isAvailable}>{room.roomTypeName} · {room.availableQuantity} phòng trống{!room.isAvailable ? ' · Không phù hợp' : ''}</option>)}
          </select>{!flow.checked.roomTypes.some((room) => room.isAvailable) && <p>Không có phòng phù hợp. Hãy đổi ngày hoặc số khách.</p>}
        </div>}
        <button type="button" className="stay-reserve-button" onClick={reserve} disabled={pending || !flow.validation.success || Boolean(flow.checked && !flow.selected)} data-od-id="btn-reserve-main">{cta}</button>
        <p className="stay-booking-caption">Bạn vẫn chưa bị trừ tiền</p>
        {current ? <div className="stay-price-breakdown" aria-label="Báo giá từ khách sạn">
          <div><span>Tiền phòng · {current.nights} đêm</span><span>{money(current.roomSubtotalAmount, current.currency)}</span></div>
          <div><span>Phụ thu</span><span>{money(current.surchargeAmount, current.currency)}</span></div>
          <div><span>Giảm giá</span><span>−{money(current.discountAmount, current.currency)}</span></div>
          <div className="stay-price-total"><strong>Tổng thanh toán</strong><strong>{money(current.totalAmount, current.currency)}</strong></div>
        </div> : <p className="stay-booking-note">Chọn hạng phòng để nhận báo giá chính xác. Phụ thu và giảm giá được hiển thị theo báo giá của khách sạn.</p>}
        {flow.availability.isError && <Alert type="error" showIcon title="Không thể kiểm tra phòng" description={errorMessage(flow.availability.error)} />}
        {flow.quote.isError && <Alert type="error" showIcon title="Không thể lấy báo giá" description={errorMessage(flow.quote.error)} />}
        {flow.create.isError && <Alert type="error" showIcon title="Chưa thể xác nhận đặt phòng" description={errorMessage(flow.create.error)} />}
        {flow.uncertain && <Alert type="warning" title="Kết nối bị gián đoạn sau khi gửi đơn" description={<Link to="/my-bookings">Kiểm tra đơn của tôi trước khi tạo lại để tránh trùng đơn.</Link>} />}
      </>}
    </div>
    <Modal open={confirm && Boolean(current) && !flow.create.data} onCancel={() => { if (!flow.create.isPending) setConfirm(false) }} footer={null} title="Xác nhận đặt phòng" className="stay-booking-modal" mask={{ closable: !flow.create.isPending }} destroyOnHidden>
      {current && <><h2>{hotelName}</h2><p>{dateLabel(stay.checkIn)} – {dateLabel(stay.checkOut)} · {stay.adults + stay.children} khách · {stay.quantity} phòng</p>
        <p className="stay-confirm-total">Tổng thanh toán <strong>{money(current.totalAmount, current.currency)}</strong></p>
        {!session ? <p><Link to={`/login?returnTo=${encodeURIComponent(location.pathname + location.search)}`}>Đăng nhập để xác nhận đặt phòng</Link></p> : <form noValidate onSubmit={booker.handleSubmit(async (value) => {
          try { await flow.submit(value) } catch (error) { applyApiFieldErrors(error, booker.setError); setConfirm(false) }
        })}><fieldset disabled={flow.busy} className="stay-contact-fields"><legend>Thông tin người đặt và nhận phòng</legend>
          {(['fullName', 'email', 'phone'] as const).map((name) => <label key={name} htmlFor={`booker-${name}`}><span>{{ fullName: 'Họ và tên', email: 'Email liên hệ', phone: 'Số điện thoại liên hệ' }[name]}</span>
            <input {...booker.register(name)} id={`booker-${name}`} type={name === 'email' ? 'email' : name === 'phone' ? 'tel' : 'text'} autoComplete={name === 'fullName' ? 'name' : name === 'phone' ? 'tel' : 'email'} aria-invalid={Boolean(booker.formState.errors[name])} aria-describedby={booker.formState.errors[name] ? `booker-${name}-error` : undefined} />
            {booker.formState.errors[name] && <span className="stay-field-error" id={`booker-${name}-error`}>{booker.formState.errors[name]?.message}</span>}
          </label>)}<button className="stay-reserve-button" type="submit" disabled={flow.busy}>{flow.create.isPending ? 'Đang tạo đơn…' : 'Xác nhận tạo đơn đặt phòng'}</button>
        </fieldset></form>}
      </>}
    </Modal>
  </aside>
}
