import { useState, type ComponentType } from 'react'
import { CalendarOutlined, ClockCircleOutlined, EnvironmentOutlined, ReloadOutlined, TeamOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { Link } from 'react-router'
import { usePublicHotelDetailQuery } from '@/features/hotels'
import { PaymentButton } from '@/features/payments'
import { ErrorState } from '@/shared/ui/ErrorState'
import { PageLoading } from '@/shared/ui/PageLoading'
import { type BookingSummary } from '../api/booking-api'
import { CancellationDialog } from './CancellationDialog'
import { tripGroups, useCustomerTrips } from '../hooks/use-customer-trips'
import { bookingStatusLabels } from '../model/booking-display'
import { checkoutDate, checkoutMoney } from '../model/client-checkout'
import { BookingDetailsDrawer } from './BookingList'
import '@/shared/styles/customer-trips.css'

const tabs = [
  { id: 'upcoming', label: 'Sắp tới', emptyTitle: 'Chưa có đơn đặt phòng sắp tới' },
  { id: 'completed', label: 'Đã hoàn thành', emptyTitle: 'Chưa có chuyến đi đã hoàn thành' },
  { id: 'cancelled', label: 'Đã hủy', emptyTitle: 'Chưa có đơn đã hủy hoặc hết hạn' },
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
  const [cancellationId, setCancellationId] = useState<string>()

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
            onDetails={() => setSelectedId(booking.id)} onCancel={() => setCancellationId(booking.id)} cancelling={Boolean(cancellationId)} />)}
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
    {cancellationId && <CancellationDialog bookingId={cancellationId} onClose={() => setCancellationId(undefined)} />}
  </section>
}

function CustomerTripCard({ booking, CoverImage, onDetails, onCancel, cancelling }: {
  booking: BookingSummary; CoverImage: Cover; onDetails: () => void; onCancel: () => void; cancelling: boolean
}) {
  const { hotel } = usePublicHotelDetailQuery(booking.hotelId)
  const pending = booking.status === 'PENDING_PAYMENT'
  const cancelled = booking.status === 'CANCELLED' || booking.status === 'EXPIRED'
  return <li className={cancelled ? 'tr-item is-cancelled' : 'tr-item'}>
    <article className="tr-card">
      <div className="tr-main">
        <div className="tr-media"><CoverImage hotelId={booking.hotelId} /></div>
        <div className="tr-body">
          <div className="tr-top">
            <span className={`tr-badge tr-badge-${badgeTone[booking.status] ?? 'neutral'}`}><span className="tr-dot" aria-hidden="true" />{bookingStatusLabels[booking.status] ?? booking.status}</span>
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
          <div className="tr-buttons">
            {pending && <PaymentButton bookingId={booking.id} disabled={cancelling} />}
            <Button onClick={onDetails}>Xem chi tiết</Button>
            {(pending || booking.status === 'CONFIRMED') && <button disabled={cancelling} className="tr-link is-danger" type="button" onClick={onCancel}>Hủy đặt phòng</button>}
            {cancelled && <Link to={`/my-refunds?bookingId=${encodeURIComponent(booking.id)}`}>Theo dõi hoàn tiền</Link>}
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
