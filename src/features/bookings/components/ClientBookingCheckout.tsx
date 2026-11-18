import { useState, type ReactNode } from 'react'
import { CheckOutlined, ClockCircleOutlined, CreditCardOutlined, LeftOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Alert } from 'antd'
import { Link, Navigate, useLocation } from 'react-router'
import { ApiError, errorMessage } from '@/shared/api/api-error'
import { bookerFormSchema, type BookerForm } from '../api/booking-api'
import { checkoutContacts, checkoutDetailHref, checkoutDate, checkoutMoney, type CheckoutSelection } from '../model/client-checkout'
import { useClientCheckout } from '../hooks/use-client-checkout'
import { CheckoutPriceDetails } from './CheckoutPriceDetails'
import '@/shared/styles/checkout-reference.css'

interface Props {
  selection: CheckoutSelection
  user: { id: string; fullName: string; email: string; phone: string | null; emailVerified: boolean }
  hotelName: string
  roomName: string
  checkInTime: string
  checkOutTime: string
  hotelCover: ReactNode
  initialPrice?: { totalAmount: number; currency: string }
}
const contactFields = [
  { name: 'fullName', label: 'Họ và tên', type: 'text', autoComplete: 'name', maxLength: 100 },
  { name: 'email', label: 'Địa chỉ email', type: 'email', autoComplete: 'email', maxLength: 255 },
  { name: 'phone', label: 'Số điện thoại liên hệ', type: 'tel', autoComplete: 'tel', maxLength: 20 },
] as const

export function ClientBookingCheckout({ selection, user, hotelName, roomName, checkInTime, checkOutTime, hotelCover, initialPrice }: Props) {
  const flow = useClientCheckout(selection, user.id, initialPrice)
  const [changeGuest, setChangeGuest] = useState(false)
  const profile = { fullName: user.fullName, email: user.email, phone: user.phone ?? '' }
  const form = useForm<BookerForm>({ resolver: zodResolver(bookerFormSchema), values: profile, resetOptions: { keepDirtyValues: true } })
  void form.formState.dirtyFields
  const location = useLocation()
  const profileComplete = bookerFormSchema.safeParse(profile).success
  const busy = flow.submit.isPending
  const quoteReady = flow.available && Boolean(flow.current) && !flow.quote.isFetching && !flow.quote.isError
  const disabled = busy || !quoteReady || !profileComplete || !user.emailVerified || flow.needsAcceptance || flow.uncertain
  async function confirm(values: BookerForm) {
    if (disabled) return
    try { await flow.reserve(checkoutContacts(user, changeGuest, values)) }
    catch (error) {
      if (changeGuest && error instanceof ApiError) for (const field of error.errors) {
        const name = field.field.replace(/^guest\./, '')
        if (['fullName', 'email', 'phone'].includes(name) && !field.field.startsWith('booker.')) form.setError(name as keyof BookerForm, { type: 'server', message: field.message })
      }
    }
  }
  if (flow.submit.data) return <Navigate to={`/stays/${selection.hotelId}/booking/${flow.submit.data.id}`} replace />
  const detailHref = checkoutDetailHref(selection)
  const quote = quoteReady ? flow.current : undefined
  const total = quote ? checkoutMoney(quote.totalAmount, quote.currency) : '—'
  const confirmLabel = busy ? 'Đang kiểm tra giá và tạo đơn…' : 'Xác nhận đặt phòng'
  const trip = [
    ['Ngày lưu trú', `${checkoutDate(selection.stay.checkIn)} → ${checkoutDate(selection.stay.checkOut)}`, quote ? `${quote.nights} đêm` : ''],
    ['Khách', `${selection.stay.adults} người lớn${selection.stay.children > 0 ? `, ${selection.stay.children} trẻ em` : ''}`],
    ['Hạng phòng', roomName],
  ]

  return <div className="client-checkout checkout-reference">
    <Link className="co-back" to={detailHref}><LeftOutlined />Quay lại chọn phòng</Link>
    <header><h1 className="co-title">Xác nhận đặt phòng</h1><p className="co-sub">Kiểm tra thông tin người nhận phòng và tổng tiền trước khi xác nhận.</p></header>
    <ol className="stepper" aria-label="Các bước đặt phòng">
      <li className="step" data-state="done"><span className="step-dot" aria-hidden="true"><CheckOutlined /></span>Chọn phòng</li>
      <li className="step-sep" aria-hidden="true" />
      <li className="step" aria-current="step"><span className="step-dot" aria-hidden="true">2</span>Thông tin</li>
      <li className="step-sep" aria-hidden="true" />
      <li className="step"><span className="step-dot" aria-hidden="true">3</span>Thanh toán</li>
    </ol>
    <div className="co-grid">
      <form id="checkout-form" className="co-col co-form" noValidate onSubmit={form.handleSubmit(confirm)} aria-busy={busy}>
        <section className="co-sec" aria-labelledby="checkout-trip-title">
          <h2 id="checkout-trip-title" className="co-sec-title">Chuyến đi của bạn</h2>
          <div className="co-rows">{trip.map(([label, value, note]) => <div className="co-row" key={label}>
            <div><span className="co-row-label">{label}</span><span className="co-row-value">{value}{note && <span className="co-note"> · {note}</span>}</span></div>
            <Link className="co-edit" to={detailHref} aria-label={`Chỉnh sửa ${label.toLowerCase()}`}>Chỉnh sửa</Link>
          </div>)}</div>
        </section>
        <section className="co-sec" aria-labelledby="checkout-contact-title">
          <h2 id="checkout-contact-title" className="co-sec-title">Thông tin người nhận phòng</h2>
          <p className="co-sec-sub">Thông tin này được dùng để gửi xác nhận và liên hệ khi nhận phòng.</p>
          {!profileComplete && <Alert type="warning" showIcon title="Cần hoàn thiện thông tin tài khoản" description={<span>Kiểm tra họ tên, email và số điện thoại liên hệ (tối đa 20 ký tự) trước khi đặt phòng. <Link to={`/account?returnTo=${encodeURIComponent(location.pathname + location.search)}`}>Cập nhật hồ sơ</Link></span>} />}
          {!user.emailVerified && <Alert type="warning" showIcon title="Vui lòng xác minh email tài khoản trước khi đặt phòng." />}
          <fieldset disabled={busy || flow.uncertain} aria-label="Thông tin người đặt và người nhận phòng">
            <div className="co-form">
              {contactFields.map(({ name, label, type }) => <div key={name}>
                <label className="co-label" htmlFor={`checkout-booker-${name}`}>{name === 'fullName' ? 'Họ và tên người đặt phòng' : label}</label>
                <input className="co-input" id={`checkout-booker-${name}`} type={type} value={profile[name]} readOnly />
              </div>)}
              <div className="co-check-row">
                <input id="checkout-other-guest" type="checkbox" checked={changeGuest} aria-controls="checkout-other-guest-fields"
                  onChange={event => {
                    setChangeGuest(event.target.checked)
                    if (!event.target.checked) form.reset(profile)
                  }} />
                <label htmlFor="checkout-other-guest">Người nhận phòng khác với người đặt
                  <span className="co-help">Tích ô này nếu người nhận phòng có thông tin khác.</span>
                </label>
              </div>
              <div id="checkout-other-guest-fields" className="co-extra" hidden={!changeGuest}>
                {contactFields.map(({ name, label, type, autoComplete, maxLength }) => <div key={name}>
                  <label className="co-label" htmlFor={`checkout-${name}`}>{label} người nhận phòng</label>
                  <input {...form.register(name)} className="co-input" id={`checkout-${name}`} type={type} autoComplete={`section-guest ${autoComplete}`}
                    maxLength={maxLength} required={changeGuest} aria-invalid={Boolean(form.formState.errors[name])}
                    aria-describedby={form.formState.errors[name] ? `checkout-${name}-error` : undefined} />
                  {form.formState.errors[name] && <p className="co-error" role="alert" id={`checkout-${name}-error`}>{form.formState.errors[name]?.message}</p>}
                </div>)}
              </div>
            </div>
          </fieldset>
        </section>
        <section className="co-sec" aria-labelledby="checkout-payment-title">
          <h2 id="checkout-payment-title" className="co-sec-title">Phương thức thanh toán</h2>
          <p className="co-sec-sub">Bạn sẽ thanh toán sau khi xác nhận đặt phòng.</p>
          <div className="pay-list"><div className="pay-option">
            <span className="pay-dot" aria-hidden="true" />
            <div><span className="pay-name">VNPay</span><p className="pay-desc">Quét mã QR hoặc mở cổng thanh toán VNPay.</p></div>
            <CreditCardOutlined className="pay-icon" />
          </div></div>
        </section>
        <section className="co-sec" aria-labelledby="checkout-policy-title">
          <h2 id="checkout-policy-title" className="co-sec-title">Chính sách và điều khoản</h2>
          <div className="pol-list">
            <div className="pol-row"><SafetyOutlined /><div><p className="pol-title">Hủy phòng</p><p className="pol-text">Chưa có chính sách hủy cụ thể cho hạng phòng này trên màn xác nhận.</p></div></div>
            <div className="pol-row"><ClockCircleOutlined /><div><p className="pol-title">Nội quy chỗ nghỉ</p><p className="pol-text">Nhận phòng từ {checkInTime.slice(0, 5)}. Trả phòng trước {checkOutTime.slice(0, 5)}.</p></div></div>
            <div className="pol-row"><LockOutlined /><div><p className="pol-title">An toàn &amp; bảo mật</p><p className="pol-text">Thông tin thanh toán được nhập ở bước VNPay.</p></div></div>
          </div>
        </section>
      </form>
      <aside id="checkout-summary" className="sum-card" aria-label="Tóm tắt đặt phòng">
        <div className="sum-room">
          <div className="sum-thumb">{hotelCover}</div>
          <div><p className="sum-hotel">Khách sạn</p><p className="sum-room-name">{hotelName}</p><p className="sum-meta">{roomName}</p></div>
        </div>
        <div aria-live="polite">
          {flow.availability.isFetching && <p role="status">Đang kiểm tra phòng trống…</p>}
          {flow.availability.isError && <Alert type="error" title="Không kiểm tra được phòng trống" description={errorMessage(flow.availability.error)} action={<button type="button" onClick={() => void flow.availability.refetch()}>Thử lại</button>} />}
          {!flow.availability.isPending && !flow.availability.isFetching && !flow.availability.isError && !flow.available && <Alert type="warning" title="Phòng không còn phù hợp với lựa chọn này" description={<Link to={checkoutDetailHref(selection)}>Quay lại chọn phòng hoặc đổi ngày lưu trú</Link>} />}
          {flow.available && flow.quote.isFetching && <p role="status">Đang cập nhật báo giá…</p>}
          {flow.available && flow.quote.isError && <Alert type="error" title="Không lấy được báo giá" description={errorMessage(flow.quote.error)} action={<button type="button" onClick={() => void flow.quote.refetch()}>Thử lại</button>} />}
          {quote && <CheckoutPriceDetails quote={quote} />}
          {flow.priceChanged && quoteReady && <div className="checkout-price-changed" role="alert"><strong>Báo giá đã thay đổi</strong><p>Vui lòng kiểm tra chi tiết giá mới trước khi xác nhận.</p><label className="checkout-checkbox"><input type="checkbox" checked={!flow.needsAcceptance} disabled={busy || flow.uncertain} onChange={event => flow.acceptPrice(event.target.checked)} /><span>Tôi đồng ý với báo giá mới.</span></label></div>}
          {flow.submit.isError && <Alert type="error" showIcon title="Chưa thể xác nhận đặt phòng" description={errorMessage(flow.submit.error)} />}
          {flow.uncertain && <Alert type="warning" showIcon title="Chưa xác định được kết quả tạo đơn" description={<span>Kết nối bị gián đoạn sau khi gửi yêu cầu. <Link to="/my-bookings">Kiểm tra đơn đặt phòng của tôi</Link> trước khi tạo lại để tránh trùng đơn.</span>} />}
        </div>
        <button className="co-confirm sum-cta" type="submit" form="checkout-form" disabled={disabled}>{confirmLabel}</button>
        <p className="sum-trust"><LockOutlined />Xác nhận sẽ tạo đơn chờ thanh toán. Bạn chưa bị trừ tiền.</p>
      </aside>
    </div>
    <div className="co-bar">
      <a className="co-bar-total" href="#checkout-summary"><strong>{total}</strong><span>{quote ? `Tổng cộng · ${quote.nights} đêm` : 'Xem tóm tắt đặt phòng'}</span></a>
      <button className="co-confirm" type="submit" form="checkout-form" disabled={disabled}>{confirmLabel}</button>
    </div>
  </div>
}
