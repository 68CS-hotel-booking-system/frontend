import { useState } from 'react'
import { Alert } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { errorMessage } from '@/shared/api/api-error'
import { PendingVnpayPayment } from '@/features/payments'
import { getBooking } from '../api/booking-api'
import { checkoutDate, checkoutMoney } from '../model/client-checkout'

const statusLabels: Record<string, string> = {
  PENDING_PAYMENT: 'Chờ thanh toán',
  CONFIRMED: 'Đã xác nhận',
  CHECKED_IN: 'Đã nhận phòng',
  CHECKED_OUT: 'Đã trả phòng',
  EXPIRED: 'Hết hạn thanh toán',
  CANCELLED: 'Đã hủy',
  NO_SHOW: 'Khách không đến',
}

const dateTime = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'Asia/Ho_Chi_Minh',
})

type Props = {
  hotelId: string
  bookingId: string
  customerId: string
  coverUrl?: string
}

export function ClientBookingConfirmation({ hotelId, bookingId, customerId, coverUrl }: Props) {
  const [failedCover, setFailedCover] = useState<string>()
  const query = useQuery({
    queryKey: ['bookings', 'client-confirmation', customerId, bookingId],
    queryFn: ({ signal }) => getBooking(bookingId, undefined, signal),
    retry: false,
  })

  if (query.isPending) return <div className="pending-pay" role="status">Đang tải đơn đặt phòng…</div>
  const booking = query.data
  if (!booking) return <div className="pending-pay">
    <Alert type="error" title="Không tải được đơn đặt phòng" description={errorMessage(query.error)}
      action={<button type="button" onClick={() => void query.refetch()}>Thử lại</button>} />
    <Link to="/my-bookings">Xem đơn đặt phòng của tôi</Link>
  </div>
  if (booking.hotelId !== hotelId) return <div className="pending-pay">
    <Alert type="error" title="Đơn đặt phòng không thuộc khách sạn này." />
    <Link to="/my-bookings">Xem đơn đặt phòng của tôi</Link>
  </div>

  const pending = booking.status === 'PENDING_PAYMENT'
  const status = statusLabels[booking.status] ?? booking.status
  const roomNames = booking.items.map(item => item.roomTypeName).join(', ')
  const stay = `${checkoutDate(booking.checkIn)} – ${checkoutDate(booking.checkOut)} · ${booking.nights} đêm`
  const guestCount = `${booking.adults} người lớn${booking.children > 0 ? ` · ${booking.children} trẻ em` : ''}`
  const rows = [
    ['Lưu trú', stay],
    ['Hạng phòng', roomNames],
    ['Số khách', guestCount],
    ['Người đặt', [booking.booker.fullName, booking.booker.phone].filter(Boolean).join(' · ')],
    ['Người nhận phòng', [booking.guest.fullName, booking.guest.phone].filter(Boolean).join(' · ')],
    ['Email nhận phòng', booking.guest.email],
    ['Hạn thanh toán', pending && booking.expiresAt ? dateTime.format(new Date(booking.expiresAt)) : null],
  ]

  return <div className="pending-pay">
    <Link to="/my-bookings" className="pending-pay-back">← Đặt phòng của tôi</Link>
    <header className="pending-pay-heading">
      <p className="pending-pay-badge" data-status={booking.status}>{status}</p>
      <h1>{pending ? 'Hoàn tất thanh toán' : `Đơn đặt phòng ${booking.bookingCode}`}</h1>
      {pending && <p>Đơn đã được tạo lúc {dateTime.format(new Date(booking.createdAt))}. Hoàn tất thanh toán để giữ phòng.</p>}
      <p className="pending-pay-code">Mã đơn <strong>{booking.bookingCode}</strong></p>
    </header>
    <div className="pending-pay-grid">
      <div className="pending-pay-main">
        <section className="pending-pay-stay" aria-label="Tóm tắt kỳ lưu trú">
          {coverUrl && coverUrl !== failedCover &&
            <img src={coverUrl} alt="" width="96" height="96" onError={() => setFailedCover(coverUrl)} />}
          <div><h2>{roomNames}</h2><p>{stay}</p><p>{guestCount}</p></div>
        </section>
        <section>
          <h2>Thông tin đơn đặt phòng</h2>
          <dl className="pending-pay-info">
            {rows.map(([label, value]) => value && <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
          </dl>
        </section>
      </div>
      {pending ? <PendingVnpayPayment
        bookingId={booking.id}
        expiresAt={booking.expiresAt}
        amount={booking.totalAmount}
        currency={booking.currency}
        roomAmount={booking.roomSubtotalAmount}
        surcharge={booking.surchargeAmount}
        discount={booking.discountAmount}
      /> : <aside className="pending-pay-card" aria-label="Tóm tắt đơn">
        <dl className="pending-pay-cost"><div className="pending-pay-total"><dt>Tổng tiền đơn</dt>
          <dd>{checkoutMoney(booking.totalAmount, booking.currency)}</dd></div></dl>
        <Link to="/my-bookings" className="pending-pay-primary">Xem đơn đặt phòng của tôi</Link>
      </aside>}
    </div>
  </div>
}
