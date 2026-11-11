import { useState } from 'react'
import { Button, Empty, Pagination, Select, Skeleton, Table } from 'antd'
import { Link } from 'react-router'
import { useCurrentUser } from '@/features/auth'
import { ErrorState } from '@/shared/ui/ErrorState'
import type { HotelReviewStatus } from '../api/hotel-review-api'
import { useAdminHotelReviews } from '../hooks/use-hotel-reviews'
import { HotelReviewStatusBadge } from './HotelReviewStatusBadge'

export function AdminHotelReviewQueue() {
  const { isAdmin } = useCurrentUser()
  const [status, setStatus] = useState<HotelReviewStatus | undefined>('PENDING')
  const [page, setPage] = useState(0)
  const query = useAdminHotelReviews({ page, size: 20, status }, isAdmin)
  if (!isAdmin) return <p role="alert">Chỉ quản trị viên được xem danh sách xét duyệt.</p>
  return <section className="space-y-5 min-w-0">
    <div><h1 className="text-2xl font-bold m-0">Xét duyệt hồ sơ khách sạn</h1>
      <p className="text-sm text-[#5f736e] mt-2">Xem hồ sơ do chủ khách sạn gửi, sau đó duyệt hoặc từ chối kèm lý do.</p></div>
    <div className="flex flex-wrap gap-3 justify-between">
      <Select<HotelReviewStatus | 'ALL'> aria-label="Trạng thái xét duyệt" className="min-w-48" value={status ?? 'ALL'} onChange={(value) => { setStatus(value === 'ALL' ? undefined : value); setPage(0) }} options={[
        { value: 'PENDING', label: 'Chờ xét duyệt' }, { value: 'APPROVED', label: 'Đã duyệt' }, { value: 'REJECTED', label: 'Cần bổ sung' }, { value: 'ALL', label: 'Tất cả hồ sơ' },
      ]} />
      <Button onClick={() => void query.refetch()} loading={query.isFetching}>Tải lại danh sách</Button>
    </div>
    {query.isPending ? <Skeleton active paragraph={{ rows: 6 }} /> : query.isError
      ? <ErrorState error={query.error} onRetry={() => void query.refetch()} />
      : <>
        <Table rowKey="id" dataSource={query.data.content} pagination={false} scroll={{ x: 720 }} locale={{ emptyText: <Empty description="Không có hồ sơ ở trạng thái này. Hồ sơ mới sẽ xuất hiện sau khi chủ khách sạn gửi." /> }} columns={[
          { title: 'Khách sạn', key: 'hotel', render: (_, item) => <Link className="break-all" to={`/hotel-review-requests/${item.id}`}>{item.hotelName || 'Hồ sơ khách sạn'}</Link> },
          { title: 'Gửi lúc', dataIndex: 'submittedAt', render: (value: string) => new Date(value).toLocaleString('vi-VN') },
          { title: 'Trạng thái', dataIndex: 'status', render: (value: HotelReviewStatus) => <HotelReviewStatusBadge status={value} /> },
          { title: 'Lý do', dataIndex: 'reason', render: (value: string | null) => value || '—' },
          { title: 'Hồ sơ', key: 'actions', render: (_, item) => <Link className="font-semibold text-[#0b5f53] underline underline-offset-4" to={`/hotel-review-requests/${item.id}`}>Xem hồ sơ</Link> },
        ]} />
        {query.data.totalElements > 20 && <Pagination current={page + 1} pageSize={20} total={query.data.totalElements} showSizeChanger={false} onChange={(value) => setPage(value - 1)} />}
      </>}
  </section>
}
