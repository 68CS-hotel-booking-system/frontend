import { useState } from 'react'
import { Button, Result, Select, Tag } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import { useSearchParams } from 'react-router'
import { useCurrentUser } from '@/features/auth'
import { ReviewRequestModal, ReviewRequestsList, reviewStatusLabels, type ReviewStatus, useAdminReviewRequests } from '@/features/hotel-review-requests'
import { PageHeader } from '@/shared/ui/PageHeader'
import { ErrorState } from '@/shared/ui/ErrorState'
import { EmptyState } from '@/shared/ui/EmptyState'
import { PageLoading } from '@/shared/ui/PageLoading'

export function AdminHotelReviewRequestsPage() {
  const { isAdmin, isChecking } = useCurrentUser()
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | undefined>('PENDING')
  const [page, setPage] = useState(0)
  const [params, setParams] = useSearchParams()
  const query = useAdminReviewRequests({ status: statusFilter, page, size: 10 }, isAdmin)
  const requestId = params.get('requestId')
  if (isChecking) return <PageLoading />
  if (!isAdmin) return <Result status="403" title="Chỉ quản trị viên được xét duyệt hồ sơ" />
  return <div className="review-management-page w-full max-w-6xl mx-auto space-y-6">
    <PageHeader kicker="KIỂM DUYỆT CƠ SỞ" title="Xét duyệt khách sạn" description="Xem hồ sơ Owner đã gửi, kiểm tra nội dung và quyết định mở bán. Nội dung hồ sơ chỉ đọc." />
    <section className="surface-card space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="review-status-filter" className="font-medium">Trạng thái hồ sơ</label>
          <Select id="review-status-filter" aria-label="Trạng thái hồ sơ" value={statusFilter ?? 'ALL'} className="min-w-40" onChange={(value) => { setStatusFilter(value === 'ALL' ? undefined : value as ReviewStatus); setPage(0) }} options={[{ value: 'ALL', label: 'Tất cả' }, ...Object.entries(reviewStatusLabels).map(([value, label]) => ({ value, label }))]} />
          {query.data && <Tag>{query.data.totalElements} hồ sơ</Tag>}
        </div>
        <Button icon={<ReloadOutlined />} onClick={() => void query.refetch()} loading={query.isFetching}>Làm mới</Button>
      </div>
      {query.isPending ? <PageLoading /> : query.isError ? <ErrorState error={query.error} onRetry={() => void query.refetch()} /> : query.data.content.length === 0 ? <EmptyState title="Chưa có hồ sơ ở trạng thái này" description="Hồ sơ mới sẽ xuất hiện khi Owner gửi xét duyệt. Bạn có thể đổi bộ lọc để xem lịch sử." /> : <ReviewRequestsList rows={query.data.content} page={page} size={10} total={query.data.totalElements} onPageChange={setPage} onOpen={(id) => setParams({ requestId: id })} />}
    </section>
    {requestId && <ReviewRequestModal requestId={requestId} onClose={() => setParams({})} />}
  </div>
}
