import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Alert } from 'antd'
import { Link, Navigate, useLocation } from 'react-router'
import { ApiError, errorMessage } from '@/shared/api/api-error'
import { bookerFormSchema, type BookerForm } from '../api/booking-api'
import { checkoutContacts, checkoutDetailHref, checkoutDate, type CheckoutSelection } from '../model/client-checkout'
import { useClientCheckout } from '../hooks/use-client-checkout'
import { CheckoutPriceDetails } from './CheckoutPriceDetails'

interface Props {
  selection: CheckoutSelection
  user: { id: string; fullName: string; email: string; phone: string | null; emailVerified: boolean }
  hotelName: string
  roomName: string
  initialPrice?: { totalAmount: number; currency: string }
}
export function ClientBookingCheckout({ selection, user, hotelName, roomName, initialPrice }: Props) {
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
  return <div className="client-checkout">
    <Link className="checkout-back" to={checkoutDetailHref(selection)}>← Quay lại chọn phòng</Link>
    <header className="checkout-heading"><h1>Xác nhận đặt phòng</h1><p>Kiểm tra thông tin người nhận phòng và tổng tiền trước khi xác nhận.</p></header>
    <div className="checkout-columns"><form id="checkout-form" className="checkout-form" noValidate onSubmit={form.handleSubmit(confirm)} aria-busy={busy}>
      <section className="checkout-trip"><h2>Chuyến đi của bạn</h2><div className="checkout-trip-heading"><span>Ngày lưu trú{flow.current ? ` · ${flow.current.nights} đêm` : ''}</span><Link to={checkoutDetailHref(selection)}>Chỉnh sửa</Link></div><div className="checkout-trip-dates"><div><span>Nhận phòng</span><strong>{checkoutDate(selection.stay.checkIn)}</strong></div><div><span>Trả phòng</span><strong>{checkoutDate(selection.stay.checkOut)}</strong></div></div><div className="checkout-trip-row"><div><span>Khách</span><strong>{selection.stay.adults} người lớn{selection.stay.children > 0 ? `, ${selection.stay.children} trẻ em` : ''}</strong></div><Link to={checkoutDetailHref(selection)}>Chỉnh sửa</Link></div><div className="checkout-trip-row"><div><span>Hạng phòng</span><strong>{roomName}</strong></div><Link to={checkoutDetailHref(selection)}>Chỉnh sửa</Link></div></section>
      <section className="checkout-section"><h2>Thông tin người nhận phòng</h2>
        {!profileComplete && <Alert type="warning" showIcon title="Cần hoàn thiện thông tin tài khoản" description={<span>Kiểm tra họ tên, email và số điện thoại liên hệ (tối đa 20 ký tự) trước khi đặt phòng. <Link to={`/account?returnTo=${encodeURIComponent(location.pathname + location.search)}`}>Cập nhật hồ sơ</Link></span>} />}
        {!user.emailVerified && <Alert type="warning" showIcon title="Vui lòng xác minh email tài khoản trước khi đặt phòng." />}
        <fieldset disabled={busy || flow.uncertain} aria-label="Thông tin người nhận phòng">
          <div className="checkout-contact-fields">{(['fullName', 'email', 'phone'] as const).map(name => <label key={name} htmlFor={`checkout-${name}`}><span>{{ fullName: 'Họ và tên người nhận', phone: 'Số điện thoại liên hệ', email: 'Địa chỉ email' }[name]}</span><input {...form.register(name)} id={`checkout-${name}`} type={name === 'phone' ? 'tel' : name === 'email' ? 'email' : 'text'} readOnly={!changeGuest} autoComplete={name === 'fullName' ? 'name' : name === 'phone' ? 'tel' : 'email'} maxLength={name === 'fullName' ? 100 : name === 'phone' ? 20 : 255} aria-invalid={Boolean(form.formState.errors[name])} aria-describedby={form.formState.errors[name] ? `checkout-${name}-error` : undefined} />{form.formState.errors[name] && <span className="checkout-field-error" role="alert" id={`checkout-${name}-error`}>{form.formState.errors[name]?.message}</span>}</label>)}</div>
          <label className="checkout-checkbox"><input type="checkbox" checked={changeGuest} onChange={event => { setChangeGuest(event.target.checked); if (!event.target.checked) form.reset(profile, { keepDirtyValues: false, keepDirty: false, keepErrors: false }) }} /><span>Người nhận phòng khác với người đặt</span></label>
          <p className="checkout-muted">{changeGuest ? 'Thông tin này chỉ áp dụng cho đơn đặt phòng, không thay đổi hồ sơ tài khoản.' : 'Tích ô phía trên nếu người nhận phòng có thông tin khác.'}</p>
        </fieldset>
      </section>
      <section className="checkout-policies"><h2>Chính sách và điều khoản</h2><p>Kiểm tra thời hạn hủy, quy định nhận phòng và các khoản phí áp dụng cho hạng phòng đã chọn.</p></section>
    </form><aside className="checkout-stay-summary" aria-label="Thông tin đặt phòng"><div className="checkout-hotel"><span>Khách sạn</span><h3>{hotelName}</h3><p>{roomName}</p></div><section className="checkout-quote" aria-live="polite">
        {flow.availability.isFetching && <p role="status">Đang kiểm tra phòng trống…</p>}
        {flow.availability.isError && <Alert type="error" title="Không kiểm tra được phòng trống" description={errorMessage(flow.availability.error)} action={<button type="button" onClick={() => void flow.availability.refetch()}>Thử lại</button>} />}
        {!flow.availability.isPending && !flow.availability.isFetching && !flow.availability.isError && !flow.available && <Alert type="warning" title="Phòng không còn phù hợp với lựa chọn này" description={<Link to={checkoutDetailHref(selection)}>Quay lại chọn phòng hoặc đổi ngày lưu trú</Link>} />}
        {flow.available && flow.quote.isFetching && <p role="status">Đang cập nhật báo giá…</p>}
        {flow.available && flow.quote.isError && <Alert type="error" title="Không lấy được báo giá" description={errorMessage(flow.quote.error)} action={<button type="button" onClick={() => void flow.quote.refetch()}>Thử lại</button>} />}
        {quoteReady && flow.current && <CheckoutPriceDetails quote={flow.current} />}
        {flow.priceChanged && quoteReady && <div className="checkout-price-changed" role="alert"><strong>Báo giá đã thay đổi</strong><p>Vui lòng kiểm tra chi tiết giá mới trước khi xác nhận.</p><label className="checkout-checkbox"><input type="checkbox" checked={!flow.needsAcceptance} disabled={busy || flow.uncertain} onChange={event => flow.acceptPrice(event.target.checked)} /><span>Tôi đồng ý với báo giá mới.</span></label></div>}
        {flow.submit.isError && <Alert type="error" showIcon title="Chưa thể xác nhận đặt phòng" description={errorMessage(flow.submit.error)} />}
        {flow.uncertain && <Alert type="warning" showIcon title="Chưa xác định được kết quả tạo đơn" description={<span>Kết nối bị gián đoạn sau khi gửi yêu cầu. <Link to="/my-bookings">Kiểm tra đơn đặt phòng của tôi</Link> trước khi tạo lại để tránh trùng đơn.</span>} />}
        <button className="checkout-confirm" type="submit" form="checkout-form" disabled={disabled}>{busy ? 'Đang kiểm tra giá và tạo đơn…' : 'Xác nhận đặt phòng'}</button><p className="checkout-submit-note">Xác nhận sẽ tạo đơn chờ thanh toán. Bạn chưa bị trừ tiền.</p>
      </section></aside></div>
  </div>
}
