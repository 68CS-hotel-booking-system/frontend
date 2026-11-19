import { useState, type ComponentType } from 'react'
import { CalendarOutlined, ClockCircleOutlined, EnvironmentOutlined, ReloadOutlined, TeamOutlined } from '@ant-design/icons'
import { App, Button } from 'antd'
import { Link } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { usePublicHotelDetailQuery } from '@/features/hotels'
import { PaymentButton } from '@/features/payments'
import { errorMessage } from '@/shared/api/api-error'
import { ErrorState } from '@/shared/ui/ErrorState'
import { PageLoading } from '@/shared/ui/PageLoading'
import { cancelCustomerBooking, type BookingSummary } from '../api/booking-api'
import { bookingKeys, useBookingAction } from '../hooks/use-bookings'
import { hasBookingHoldExpired, useBookingHoldExpired } from '../hooks/use-booking-hold-expired'
import { tripGroups, useCustomerTrips } from '../hooks/use-customer-trips'
import { bookingStatusLabels } from '../model/booking-display'
import { checkoutDate, checkoutMoney } from '../model/client-checkout'
import { BookingDetailsDrawer } from './BookingList'
import '@/shared/styles/customer-trips.css'

const tabs = [
  { id: 'upcoming', label: 'Sắp tới', emptyTitle: 'Chưa có đơn đặt phòng sắp tới' },
  { id: 'completed', label: 'Đã hoàn thành', emptyTitle: 'Chưa có chuyến đi đã hoàn thành' },
  { id: 'cancelled', label: 'Đã hủy / hết hạn', emptyTitle: 'Chưa có đơn đã hủy hoặc hết hạn' },
] as const
const badgeTone: Record<string, string> = {
  PENDING_PAYMENT: 'warn', CONFIRMED: 'success', CHECKED_IN: 'success', CANCELLED: 'danger', EXPIRED: 'danger',
}
const tripDateOptions = { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' } as const
const tripDate = new Intl.DateTimeFormat('vi-VN', tripDateOptions)
const tripDateTime = new Intl.DateTimeFormat('vi-VN', { ...tripDateOptions, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
type Cover = ComponentType<{ hotelId: string }>

export function CustomerBookingList({ CoverImage }: { CoverImage: Cover }) {
  const [tab, setTab] = useState<(typeof tabs)[number]['id']>('upcoming')
  const [status, setStatus] = useState('')
  const [selectedId, setSelectedId] = useState<string>()
  const upcoming = useCustomerTrips(tripGroups.upcoming)
  const completed = useCustomerTrips(tripGroups.completed)
  const cancelled = useCustomerTrips(tripGroups.cancelled)
  const filtered = useCustomerTrips(status ? [status] : [], Boolean(status))
  const groups = { upcoming, completed, cancelled }
  const query = status ? filtered : groups[tab]
  const bookings = [...new Map(query.data?.pages.flatMap(page => page.flatMap(({ result }) => result.content.map(booking => [booking.id, booking] as const)))).values()]
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))
  const currentTab = tabs.find(item => item.id === tab)!
  const cancel = useBookingAction(cancelCustomerBooking)
  const client = useQueryClient()
  const { message, modal } = App.useApp()

  function confirmCancellation(booking: BookingSummary) {
    const refreshIfExpired = () => {
      if (booking.status !== 'PENDING_PAYMENT' || !hasBookingHoldExpired(booking.expiresAt)) return false
      void client.invalidateQueries({ queryKey: bookingKeys.all }, { cancelRefetch: false })
      void message.info('Hạn thanh toán đã qua. Kiểm tra trạng thái mới của đơn trong danh sách.')
      return true
    }
    if (refreshIfExpired()) return

    modal.confirm({
      title: 'Hủy đơn đặt phòng?',
      content: booking.status === 'CONFIRMED'
        ? `Đơn ${booking.bookingCode} đã được xác nhận. Phí hủy và khoản hoàn tiền áp dụng theo chính sách của đơn.`
        : `Bạn có muốn hủy đơn ${booking.bookingCode}?`,
      okText: 'Hủy đặt phòng',
      cancelText: 'Giữ đặt phòng',
      okButtonProps: { danger: true },
      onOk: async () => {
        if (refreshIfExpired()) return
        try {
          const result = await cancel.mutateAsync(booking.id)
          if (result.status === 'EXPIRED') {
            void message.info('Đơn đã hết hạn thanh toán.')
            return
          }
          const { cancellationFeeAmount, refundAmount, refundStatus } = result.cancellation
          const fee = cancellationFeeAmount ? ` Phí hủy: ${checkoutMoney(cancellationFeeAmount, result.currency)}.` : ''
          const refund = refundAmount && refundStatus === 'PENDING'
            ? ` Khoản hoàn ${checkoutMoney(refundAmount, result.currency)} đang chờ xử lý.` : ''
          void message.success(`Đã hủy đặt phòng.${fee}${refund}`)
        } catch (error) {
          if (refreshIfExpired()) return
          void message.error(errorMessage(error))
          throw error
        }
      },
    })
  }

  return <section className="customer-trips" aria-label="Danh sách đặt phòng">
    <div className="tr-toolbar">
      <div className="tr-tabs" role="group" aria-label="Lọc theo nhóm đặt phòng">
        {tabs.map(item => {
          const firstPage = groups[item.id].data?.pages[0]
          return <button key={item.id} type="button" className="tr-tab" aria-pressed={tab === item.id} onClick={() => { setTab(item.id); setStatus('') }}>
            {item.label}{firstPage && <span className="tr-count">{firstPage.reduce((count, entry) => count + entry.result.totalElements, 0)}</span>}
          </button>
        })}
      </div>
      <div className="tr-filters">
        <select className="tr-select" aria-label="Lọc theo trạng thái đơn" value={status} onChange={event => setStatus(event.target.value)}>
          <option value="">Tất cả trạng thái</option>
          {tripGroups[tab].map(value => <option key={value} value={value}>{bookingStatusLabels[value]}</option>)}
        </select>
        <button className="tr-refresh" type="button" disabled={query.isFetching} onClick={() => {
          void Promise.all([upcoming.refetch(), completed.refetch(), cancelled.refetch(), ...(status ? [filtered.refetch()] : [])])
        }}><ReloadOutlined />Làm mới</button>
      </div>
    </div>
    {query.isPending ? <PageLoading /> : query.isError && !query.data ? (
      <ErrorState error={query.error} onRetry={() => void query.refetch()} />
    ) : bookings.length ? (
      <>
        <ul className="tr-list">
          {bookings.map(booking => <CustomerTripCard key={booking.id} booking={booking} CoverImage={CoverImage}
            onDetails={() => setSelectedId(booking.id)} onCancel={() => confirmCancellation(booking)} />)}
        </ul>
        {query.isError && <ErrorState error={query.error} onRetry={() => void (query.isFetchNextPageError ? query.fetchNextPage() : query.refetch())} />}
        {query.hasNextPage && <Button className="tr-more" loading={query.isFetchingNextPage} disabled={query.isFetching && !query.isFetchingNextPage} onClick={() => void query.fetchNextPage()}>Xem thêm</Button>}
      </>
    ) : <div className="tr-empty">
      <CalendarOutlined aria-hidden="true" />
      <h2>{status ? 'Không có đơn đặt phòng phù hợp' : currentTab.emptyTitle}</h2>
      <p>Khi có đơn phù hợp, thông tin chuyến đi sẽ xuất hiện tại đây.</p>
      <Link to="/explore" className="tr-explore">Khám phá chỗ nghỉ</Link>
    </div>}
    <BookingDetailsDrawer selectedId={selectedId} onClose={() => setSelectedId(undefined)} />
  </section>
}

function CustomerTripCard({ booking, CoverImage, onDetails, onCancel }: {
  booking: BookingSummary; CoverImage: Cover; onDetails: () => void; onCancel: () => void
}) {
  const { hotel } = usePublicHotelDetailQuery(booking.hotelId)
  const holdExpired = useBookingHoldExpired(booking.status === 'PENDING_PAYMENT' ? booking.expiresAt : null)
  const status = holdExpired ? 'EXPIRED' : booking.status
  const pending = status === 'PENDING_PAYMENT'
  const expired = status === 'EXPIRED'
  const cancelled = status === 'CANCELLED' || expired
  return <li className={cancelled ? 'tr-item is-cancelled' : 'tr-item'}>
    <article className="tr-card">
      <div className="tr-main">
        <div className="tr-media"><CoverImage hotelId={booking.hotelId} /></div>
        <div className="tr-body">
          <div className="tr-top">
            <span className={`tr-badge tr-badge-${badgeTone[status] ?? 'neutral'}`}><span className="tr-dot" aria-hidden="true" />{bookingStatusLabels[status] ?? status}</span>
            <span className="tr-code">{booking.bookingCode}</span>
          </div>
          <h2 className="tr-name">{hotel ? <Link to={`/stays/${booking.hotelId}`}>{hotel.name}</Link> : 'Đơn đặt phòng'}</h2>
          {booking.guestName && <p className="tr-room">{booking.guestName}</p>}
          <p className="tr-meta"><CalendarOutlined />{checkoutDate(booking.checkIn)} → {checkoutDate(booking.checkOut)} · {booking.nights} đêm</p>
          <p className="tr-meta"><TeamOutlined />{booking.adults} người lớn{booking.children ? ` · ${booking.children} trẻ em` : ''}</p>
          {hotel?.address && <p className="tr-place"><EnvironmentOutlined />{hotel.address}</p>}
        </div>
        <div className="tr-side">
          <p className="tr-price">{checkoutMoney(booking.totalAmount, booking.currency)}</p>
          <p className="tr-price-note">Tổng tiền đặt phòng</p>
          {pending && booking.expiresAt && <p className="tr-deadline"><ClockCircleOutlined />Thanh toán trước {tripDateTime.format(new Date(booking.expiresAt))}</p>}
          {expired && <p className="tr-deadline">Đơn đã hết thời gian giữ phòng.</p>}
          <div className="tr-buttons">
            {pending && <PaymentButton bookingId={booking.id} />}
            <Button onClick={onDetails}>Xem chi tiết</Button>
            {(pending || status === 'CONFIRMED') && <button className="tr-link is-danger" type="button" onClick={onCancel}>Hủy đặt phòng</button>}
          </div>
        </div>
      </div>
      <div className="tr-foot">
        <span>Đặt ngày {tripDate.format(new Date(booking.createdAt))}</span>
        <button className="tr-support" type="button" onClick={onDetails}>Liên hệ hỗ trợ</button>
      </div>
    </article>
  </li>
}
