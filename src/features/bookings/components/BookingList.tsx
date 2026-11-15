import { useState } from 'react'
import { Alert, Button, Descriptions, Drawer, Select, Space, Table, Tag } from 'antd'
import { Link } from 'react-router'
import { PaymentButton } from '@/features/payments'
import { ComplaintForm } from '@/features/complaints'
import { ErrorState } from '@/shared/ui/ErrorState'
import { PageLoading } from '@/shared/ui/PageLoading'
import { bookingStatuses, type BookingDetail, type BookingSummary } from '../api/booking-api'
import { useBooking, useBookings } from '../hooks/use-bookings'
import { StayOperations } from './StayOperations'

const bookingStatusLabels: Record<string, string> = {
  PENDING_PAYMENT: 'Chờ thanh toán', CONFIRMED: 'Đã xác nhận', CHECKED_IN: 'Đã nhận phòng', CHECKED_OUT: 'Đã trả phòng',
  CANCELLED: 'Đã hủy', EXPIRED: 'Hết hạn', NO_SHOW: 'Khách không đến',
}
const amount = (value: number, currency: string) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(value)
export function BookingList({ hotelId }: { hotelId?: string }) {
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [status, setStatus] = useState<string>()
  const [selectedId, setSelectedId] = useState<string>()
  const query = useBookings({ page, size, status }, hotelId)
  const detail = useBooking(selectedId, hotelId)
  return <section className="surface-card">
    <div className="section-header"><h2>{hotelId ? 'Đơn đặt phòng của khách sạn' : 'Đơn đặt phòng của tôi'}</h2>
      <Button onClick={() => void query.refetch()} loading={query.isFetching}>Làm mới</Button></div>
    <Space wrap style={{ marginBottom: 20 }}><label htmlFor="booking-status">Trạng thái</label>
      <Select id="booking-status" value={status} allowClear placeholder="Tất cả trạng thái" style={{ minWidth: 200 }}
        options={bookingStatuses.map((value) => ({ value, label: bookingStatusLabels[value] }))}
        onChange={(value) => { setStatus(value); setPage(0) }} />
      {!hotelId && <Link to="/my-complaints">Khiếu nại của tôi</Link>}
    </Space>
    {query.isError ? <ErrorState error={query.error} onRetry={() => void query.refetch()} /> :
      <Table<BookingSummary> rowKey="id" loading={query.isPending} dataSource={query.data?.content ?? []} scroll={{ x: 720 }} locale={{ emptyText: 'Không có đơn đặt phòng phù hợp.' }}
        columns={[
          { title: 'Mã đơn', dataIndex: 'bookingCode', render: (code: string, item) => <Button type="link" onClick={() => setSelectedId(item.id)}>{code}</Button> },
          { title: 'Người nhận phòng', render: (_, item) => item.guestName ?? item.bookerName ?? 'Chưa có thông tin' },
          { title: 'Lưu trú', render: (_, item) => `${item.checkIn} → ${item.checkOut}` },
          { title: 'Tổng tiền', render: (_, item) => amount(item.totalAmount, item.currency) },
          { title: 'Trạng thái', render: (_, item) => <Tag>{bookingStatusLabels[item.status] ?? item.status}</Tag> },
        ]} pagination={{ current: page + 1, pageSize: size, total: query.data?.totalElements ?? 0, showSizeChanger: true,
          onChange: (next, nextSize) => { setPage(nextSize === size ? next - 1 : 0); setSize(nextSize) } }} />}
    <Drawer title="Chi tiết đặt phòng" open={Boolean(selectedId)} onClose={() => setSelectedId(undefined)} size="min(736px, 100vw)" destroyOnHidden>
      {detail.isPending ? <PageLoading /> : detail.isError ? <ErrorState error={detail.error} onRetry={() => void detail.refetch()} /> : detail.data &&
        <BookingDetails key={detail.data.id} booking={detail.data} hotelId={hotelId} />}
    </Drawer>
  </section>
}
function BookingDetails({ booking, hotelId }: { booking: BookingDetail; hotelId?: string }) {
  return <Space orientation="vertical" size="large" style={{ width: '100%' }}>
    <Descriptions title={booking.bookingCode} column={1} items={[
      { key: 'status', label: 'Trạng thái', children: bookingStatusLabels[booking.status] ?? booking.status },
      { key: 'dates', label: 'Lưu trú', children: `${booking.checkIn} → ${booking.checkOut} (${booking.nights} đêm)` },
      { key: 'booker', label: 'Người đặt', children: `${booking.booker.fullName ?? ''} · ${booking.booker.email ?? ''} · ${booking.booker.phone}` },
      { key: 'guest', label: 'Người nhận phòng', children: `${booking.guest.fullName ?? ''} · ${booking.guest.phone}` },
      { key: 'total', label: 'Tổng tiền', children: amount(booking.totalAmount, booking.currency) },
      { key: 'expiry', label: 'Hạn thanh toán', children: booking.expiresAt ? new Date(booking.expiresAt).toLocaleString('vi-VN') : 'Không có' },
    ]} />
    <Table dataSource={booking.items} rowKey="id" pagination={false} size="small" scroll={{ x: 450 }} columns={[
      { title: 'Hạng phòng', dataIndex: 'roomTypeName' }, { title: 'Số phòng', dataIndex: 'quantity' },
      { title: 'Khách', render: (_, item) => `${item.adults} người lớn, ${item.children} trẻ em` },
      { title: 'Thành tiền', render: (_, item) => amount(item.subtotalAmount, booking.currency) },
    ]} expandable={{ expandedRowRender: (item) => <ul>{item.nightlyPrices.map((night) => <li key={night.stayDate}>{night.stayDate}: {amount(night.unitPrice, booking.currency)}</li>)}</ul> }} />
    {hotelId ? <StayOperations booking={booking} hotelId={hotelId} /> : <>
      {booking.status === 'PENDING_PAYMENT' && <PaymentButton bookingId={booking.id} />}
      <Alert type="info" title="Cần hỗ trợ về đơn này?" description="Gửi khiếu nại để hệ thống tiếp nhận và theo dõi xử lý. Điều kiện gửi được kiểm tra theo trạng thái đơn." />
      <ComplaintForm bookingId={booking.id} />
    </>}
  </Space>
}
