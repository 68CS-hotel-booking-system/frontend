import { useState } from 'react'
import { Alert, App, Button } from 'antd'
import { Link, useSearchParams } from 'react-router'
import { useCurrentUser } from '@/features/auth'
import { useHotelWorkspace } from '@/features/hotels'
import { useHotelPublishReadiness, ReviewRequestModal, ReviewRequestsList, ReviewStatusTag, reviewErrorMessage, useHotelReviewRequests, useReviewMutations } from '@/features/hotel-review-requests'
import { PageHeader } from '@/shared/ui/PageHeader'
import { PageLoading } from '@/shared/ui/PageLoading'
import { ErrorState } from '@/shared/ui/ErrorState'
import { EmptyState } from '@/shared/ui/EmptyState'

export function HotelReviewRequestsPage() {
  const { hotel, hotelId } = useHotelWorkspace()
  const { isAdmin, isOwner, currentUser } = useCurrentUser()
  const { modal, message } = App.useApp()
  const { submit } = useReviewMutations()
  const [page, setPage] = useState(0)
  const [params, setParams] = useSearchParams()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const latestQuery = useHotelReviewRequests(hotelId, 0, 1)
  const history = useHotelReviewRequests(hotelId, page, 10)
  const readiness = useHotelPublishReadiness(hotelId)
  const latest = latestQuery.data?.content[0]
  const pending = latest?.status === 'PENDING'
  const canSend = !isAdmin && isOwner && currentUser?.id === hotel?.ownerUserId && hotel?.status === 'DRAFT' && latest?.status !== 'APPROVED'
  const version = hotel?.version
  const send = () => {
    if (!readiness.data?.ready || !canSend || pending || submit.isPending || typeof version !== 'number') return
    modal.confirm({ title: 'Gửi hồ sơ khách sạn để xét duyệt?', content: 'Hệ thống lưu bản chụp hồ sơ hiện tại. Bạn sẽ không thể sửa nội dung hồ sơ trong lúc chờ duyệt; giá theo ngày và nghiệp vụ vận hành vẫn do hệ thống quản lý riêng.', okText: 'Gửi hồ sơ', cancelText: 'Kiểm tra lại',
      onOk: async () => {
        setSubmitError(null)
        try {
          await submit.mutateAsync({ hotelId, expectedVersion: version })
          void message.success('Đã gửi hồ sơ. Vui lòng chờ quản trị viên xét duyệt.')
        } catch (error) { setSubmitError(reviewErrorMessage(error)) }
      },
    })
  }
  if (!hotel) return null
  return <div className="review-management-page w-full max-w-6xl mx-auto space-y-6">
    <PageHeader kicker="HỒ SƠ CƠ SỞ" title="Gửi và theo dõi xét duyệt" description="Theo dõi các lần gửi hồ sơ, kết quả phê duyệt và nội dung cần bổ sung." breadcrumbItems={[{ label: 'Khách sạn', to: '/hotels' }, { label: hotel.name, to: `/hotels/${hotelId}` }, { label: 'Hồ sơ xét duyệt' }]} />
    {!pending && hotel.status === 'DRAFT' && <section className="surface-card space-y-4"><h2 className="text-lg font-semibold m-0">Điều kiện gửi hồ sơ</h2>
      {readiness.isPending ? <PageLoading /> : readiness.isError ? <ErrorState error={readiness.error} onRetry={() => void readiness.refetch()} /> : <>
        <Alert style={{ background: readiness.data.ready ? '#eff9f5' : '#fff8e8', borderColor: readiness.data.ready ? '#cfe5dd' : '#efdbab', color: '#12211d' }} showIcon type={readiness.data.ready ? 'success' : 'warning'} title={readiness.data.ready ? 'Đủ điều kiện gửi hồ sơ' : 'Cần bổ sung trước khi gửi'} description={<><p>Phòng đang trong thời gian phục vụ: <strong>{readiness.data.operationalRoomCount}</strong>. Trạng thái sẵn sàng không quyết định điều kiện này.</p>{readiness.data.unmetRequirements.length > 0 && <ul className="pl-5 list-disc">{readiness.data.unmetRequirements.map((item) => <li key={item.field}>{item.message}</li>)}</ul>}</>} />
        <div className="flex flex-wrap gap-2"><Link to={`/hotels/${hotelId}/info`}><Button>Thông tin & liên hệ</Button></Link><Link to={`/hotels/${hotelId}/rooms?tab=types`}><Button>Hạng phòng</Button></Link><Link to={`/hotels/${hotelId}/rooms`}><Button>Phòng vật lý</Button></Link></div>
      </>}
    </section>}
    <section className="surface-card space-y-4">
      <div className="flex flex-wrap justify-between items-start gap-3"><div><h2 className="text-lg font-semibold m-0">{hotel.name}</h2><p className="text-sm text-[#526760] mt-2 mb-0">{isAdmin ? 'Bạn chỉ được xem hồ sơ và quyết định xét duyệt; không chỉnh sửa thông tin của Owner.' : 'Kiểm tra thông tin liên hệ, hạng phòng và phòng vật lý trước khi gửi. Hệ thống sẽ báo những điều kiện còn thiếu.'}</p></div>{latest && <ReviewStatusTag status={latest.status} />}</div>
      {latestQuery.isPending ? <PageLoading /> : latestQuery.isError ? <ErrorState error={latestQuery.error} onRetry={() => void latestQuery.refetch()} /> : <>
        {pending && <Alert type="info" showIcon title="Hồ sơ đang chờ xét duyệt" description="Nội dung đã gửi đang được khóa chỉnh sửa. Bạn có thể mở hồ sơ bên dưới để xem bản đã gửi." />}
        {latest?.status === 'REJECTED' && <Alert type="error" showIcon title="Hồ sơ bị từ chối — cần bổ sung" description={<span className="whitespace-pre-wrap break-words">{latest.reason}</span>} />}
        {latest?.status === 'APPROVED' && <Alert type="success" showIcon title="Hồ sơ đã được phê duyệt" description="Xem trạng thái hoạt động hiện tại của khách sạn tại trang Tổng quan." />}
        {submitError && <Alert type="error" showIcon title="Chưa gửi được hồ sơ" description={submitError} />}
        <div className="flex flex-wrap gap-2">
          {latest && <Button onClick={() => setParams({ requestId: latest.id })}>Xem hồ sơ mới nhất</Button>}
          {canSend && !pending && <><Link to={`/hotels/${hotelId}/info`}><Button>Kiểm tra thông tin</Button></Link><Button type="primary" onClick={send} loading={submit.isPending} disabled={!readiness.data?.ready || readiness.isFetching || latestQuery.isFetching || typeof version !== 'number'}>{latest?.status === 'REJECTED' ? 'Gửi lại hồ sơ' : 'Gửi hồ sơ xét duyệt'}</Button></>}
          {isAdmin && <Link to="/admin/hotel-review-requests"><Button>Danh sách xét duyệt toàn hệ thống</Button></Link>}
        </div>
      </>}
    </section>
    <section className="surface-card space-y-4"><h2 className="text-lg font-semibold m-0">Lịch sử hồ sơ</h2>
      {history.isPending ? <PageLoading /> : history.isError ? <ErrorState error={history.error} onRetry={() => void history.refetch()} /> : history.data.content.length === 0 ? <EmptyState title="Chưa gửi hồ sơ xét duyệt" description="Sau khi gửi, hồ sơ và kết quả xét duyệt sẽ được lưu tại đây." /> : <ReviewRequestsList rows={history.data.content} page={page} size={10} total={history.data.totalElements} onPageChange={setPage} onOpen={(id) => setParams({ requestId: id })} />}
    </section>
    {params.get('requestId') && <ReviewRequestModal requestId={params.get('requestId')} onClose={() => setParams({})} />}
  </div>
}
