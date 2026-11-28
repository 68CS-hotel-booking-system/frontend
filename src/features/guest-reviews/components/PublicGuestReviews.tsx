import { useState } from 'react'
import { Alert, Button, Pagination } from 'antd'
import { errorMessage } from '@/shared/api/api-error'
import { PageLoading } from '@/shared/ui/PageLoading'
import { usePublicGuestReviews } from '../hooks/use-guest-reviews'
import { GuestReviewCard } from './GuestReviewCard'
import '../guest-reviews.css'

export function PublicGuestReviews({ hotelId }: { hotelId: string }) {
  return <PublicReviewList key={hotelId} hotelId={hotelId} />
}
function PublicReviewList({ hotelId }: { hotelId: string }) {
  const [page, setPage] = useState(0)
  const [rating, setRating] = useState<number>()
  const query = usePublicGuestReviews(hotelId, { page, size: 5, rating })
  return <div className="gr-public">
    <div className="gr-public-heading"><h2 className="sec-title">Đánh giá từ khách lưu trú</h2>
      {query.data && <p className="gr-summary" aria-live="polite">{query.data.summary.averageRating === null ? 'Chưa có đánh giá' : <><strong>{new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(query.data.summary.averageRating)}/5</strong><span> · {query.data.summary.totalReviews} đánh giá</span></>}</p>}
    </div>
    <p className="gr-help">Nhận xét từ người đặt đã hoàn thành lượt lưu trú.</p>
    <div className="gr-toolbar"><label>Lọc theo điểm <select aria-label="Lọc theo điểm" value={rating ?? ''} onChange={event => { setRating(event.target.value ? Number(event.target.value) : undefined); setPage(0) }}>
      <option value="">Tất cả điểm</option>{[5, 4, 3, 2, 1].map(value => <option key={value} value={value}>{value} sao</option>)}</select></label>
      <Button loading={query.isFetching} onClick={() => void query.refetch()}>Làm mới đánh giá</Button></div>
    {query.isPending ? <PageLoading /> : query.isError ? <Alert type="error" showIcon title="Chưa tải được đánh giá" description={errorMessage(query.error)} action={<Button onClick={() => void query.refetch()}>Thử lại</Button>} />
      : query.data.reviews.content.length ? <><div className="gr-list">{query.data.reviews.content.map(review => <GuestReviewCard key={review.id} review={review} />)}</div>
        <Pagination current={page + 1} pageSize={5} total={query.data.reviews.totalElements} showSizeChanger={false} onChange={value => setPage(value - 1)} hideOnSinglePage /></>
        : <p className="gr-empty">{rating ? 'Không có đánh giá với số sao đã chọn.' : 'Khách sạn chưa có đánh giá từ khách đã hoàn thành lưu trú.'}</p>}
  </div>
}
