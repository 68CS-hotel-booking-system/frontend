import { Alert } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { errorMessage } from '@/shared/api/api-error'
import { PaymentButton } from '@/features/payments'
import { getBooking } from '../api/booking-api'
import { checkoutDate, checkoutMoney } from '../model/client-checkout'

const statusLabels: Record<string, string> = { PENDING_PAYMENT: 'Chờ thanh toán', CONFIRMED: 'Đã xác nhận', CHECKED_IN: 'Đã nhận phòng', CHECKED_OUT: 'Đã trả phòng', EXPIRED: 'Hết hạn thanh toán', CANCELLED: 'Đã hủy', NO_SHOW: 'Khách không đến' }

export function ClientBookingConfirmation({ hotelId, bookingId, customerId }: { hotelId: string; bookingId: string; customerId: string }) {
  const query = useQuery({ queryKey: ['bookings', 'client-confirmation', customerId, bookingId], queryFn: ({ signal }) => getBooking(bookingId, undefined, signal), retry: false })
  if (query.isPending) return <div className="client-checkout" role="status">Đang tải đơn đặt phòng…</div>
  if (query.isError) return <div className="client-checkout"><Alert type="error" title="Không tải được đơn đặt phòng" description={errorMessage(query.error)} action={<button onClick={() => void query.refetch()}>Thử lại</button>} /><Link to="/my-bookings">Xem đơn đặt phòng của tôi</Link></div>
  const booking = query.data
  if (booking.hotelId !== hotelId) return <div className="client-checkout"><Alert type="error" title="Đơn đặt phòng không thuộc khách sạn này." /><Link to="/my-bookings">Xem đơn đặt phòng của tôi</Link></div>
  const status = statusLabels[booking.status] ?? booking.status
  return <div className="client-checkout checkout-confirmation"><header className="checkout-heading"><p className="checkout-status">{status}</p><h1>Đơn đặt phòng {booking.bookingCode}</h1><p>{booking.status === 'PENDING_PAYMENT' ? 'Đã tạo đơn đặt phòng. Bạn chưa thanh toán cho đơn này.' : 'Thông tin trạng thái mới nhất của đơn đặt phòng.'}</p></header><section className="checkout-section"><h2>Thông tin đơn đặt phòng</h2><dl className="checkout-confirmation-details"><div><dt>Lưu trú</dt><dd>{checkoutDate(booking.checkIn)} – {checkoutDate(booking.checkOut)} · {booking.nights} đêm</dd></div><div><dt>Phòng</dt><dd>{booking.items.map(item => item.roomTypeName).join(', ')}</dd></div><div><dt>Số khách</dt><dd>{booking.adults} người lớn · {booking.children} trẻ em</dd></div><div><dt>Người đặt</dt><dd>{booking.booker.fullName} · {booking.booker.phone}</dd></div><div><dt>Người nhận phòng</dt><dd>{booking.guest.fullName} · {booking.guest.phone}</dd></div><div><dt>Email nhận phòng</dt><dd>{booking.guest.email || '—'}</dd></div>{booking.expiresAt && <div><dt>Hạn thanh toán</dt><dd>{new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(booking.expiresAt))}</dd></div>}<div className="checkout-price-total"><dt>Tổng tiền đơn</dt><dd>{checkoutMoney(booking.totalAmount, booking.currency)}</dd></div></dl>{booking.status === 'PENDING_PAYMENT' && <PaymentButton bookingId={booking.id} />}<div className="checkout-confirmation-actions"><Link className="checkout-confirm" to="/my-bookings">Xem đơn đặt phòng</Link><Link to="/">Tiếp tục khám phá khách sạn</Link></div></section></div>
}
