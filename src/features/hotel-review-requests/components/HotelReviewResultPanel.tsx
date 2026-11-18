import { Alert, Button } from 'antd'
import { Link } from 'react-router'
import { ErrorState } from '@/shared/ui/ErrorState'
import { PageLoading } from '@/shared/ui/PageLoading'
import { useHotelReviewRequests } from '../hooks/use-review-requests'
import { reviewDate } from '../model/review-request'
import { ReviewStatusTag } from './ReviewStatusTag'

export function HotelReviewResultPanel({ hotelId, isAdmin = false }: { hotelId: string; isAdmin?: boolean }) {
  const query = useHotelReviewRequests(hotelId, 0, 1)
  const review = query.data?.content[0]
  const titles = { PENDING: 'Hồ sơ đang chờ duyệt', APPROVED: 'Hồ sơ đã được duyệt', REJECTED: 'Hồ sơ bị từ chối — cần bổ sung' }
  return <section aria-label="Kết quả hồ sơ xét duyệt" className="rounded-2xl border border-[#cfe5dd] bg-white p-4 sm:p-5 space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-bold m-0">Kết quả hồ sơ xét duyệt</h2>{review && <ReviewStatusTag status={review.status} />}</div>
    {query.isPending ? <PageLoading /> : query.isError ? <ErrorState error={query.error} onRetry={() => void query.refetch()} /> : <>
      <Alert style={{ background: review?.status === 'REJECTED' ? '#fff2ef' : '#eff9f5', borderColor: review?.status === 'REJECTED' ? '#f2c9bd' : '#cfe5dd', color: '#12211d' }} showIcon type={review?.status === 'REJECTED' ? 'error' : review?.status === 'APPROVED' ? 'success' : 'info'} title={review ? titles[review.status] : 'Bạn chưa gửi hồ sơ xét duyệt'} description={review?.status === 'REJECTED' ? <span className="whitespace-pre-wrap break-words"><strong>Lý do: </strong>{review.reason}</span> : review?.status === 'PENDING' ? 'Nội dung đang khóa chỉnh sửa. Kết quả sẽ được cập nhật tại đây sau khi quản trị viên xét duyệt.' : review?.status === 'APPROVED' ? 'Hồ sơ đã được phê duyệt. Trạng thái hoạt động hiện tại của khách sạn được hiển thị riêng.' : 'Hoàn tất thông tin khách sạn, hạng phòng và phòng đang phục vụ, sau đó gửi hồ sơ.'} />
      {review && <p className="text-sm text-[#526760] m-0">Gửi lúc {reviewDate(review.submittedAt)}{review.reviewedAt ? ` · Xét duyệt lúc ${reviewDate(review.reviewedAt)}` : ''}</p>}
      <div style={{ marginTop: 16 }} className="flex flex-wrap gap-2">
        <Link to={`/hotels/${hotelId}/review-requests${review ? `?requestId=${review.id}` : ''}`}><Button>{review ? 'Xem hồ sơ đã gửi' : 'Xem hướng dẫn gửi hồ sơ'}</Button></Link>
        {!isAdmin && review?.status === 'REJECTED' && <Link to={`/hotels/${hotelId}/info`}><Button type="primary">Sửa hồ sơ</Button></Link>}
        {!isAdmin && (!review || review.status === 'REJECTED') && <Link to={`/hotels/${hotelId}/review-requests`}><Button type={review ? 'default' : 'primary'}>{review ? 'Kiểm tra và gửi lại' : 'Kiểm tra và gửi hồ sơ'}</Button></Link>}
      </div>
    </>}
  </section>
}
