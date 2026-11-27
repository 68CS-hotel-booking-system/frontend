import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, App, Button, Input, Pagination } from 'antd'
import { ApiError, errorMessage } from '@/shared/api/api-error'
import { PageLoading } from '@/shared/ui/PageLoading'
import { replyFormSchema, type GuestReview, type ReplyValues } from '../api/guest-review-api'
import { useManagedGuestReviews, useReplyGuestReview } from '../hooks/use-guest-reviews'
import { GuestReviewCard } from './GuestReviewCard'
import '../guest-reviews.css'

export function ManagedGuestReviews({ hotelId }: { hotelId: string }) { return <ManagedReviewList key={hotelId} hotelId={hotelId} /> }
function ManagedReviewList({ hotelId }: { hotelId: string }) {
  const [page, setPage] = useState(0)
  const [rating, setRating] = useState<number>()
  const [replyFilter, setReplyFilter] = useState('')
  const [editing, setEditing] = useState<string>()
  const query = useManagedGuestReviews(hotelId, { page, size: 5, rating, replied: replyFilter === '' ? undefined : replyFilter === 'true' })
  return <section className="gr-managed surface-card" aria-label="Đánh giá của khách lưu trú">
    <div className="gr-toolbar"><label>Điểm đánh giá <select aria-label="Điểm đánh giá" value={rating ?? ''} onChange={event => { setRating(event.target.value ? Number(event.target.value) : undefined); setPage(0); setEditing(undefined) }}><option value="">Tất cả điểm</option>{[5, 4, 3, 2, 1].map(value => <option key={value} value={value}>{value} sao</option>)}</select></label>
      <label>Phản hồi <select aria-label="Phản hồi" value={replyFilter} onChange={event => { setReplyFilter(event.target.value); setPage(0); setEditing(undefined) }}><option value="">Tất cả</option><option value="false">Chưa phản hồi</option><option value="true">Đã phản hồi</option></select></label>
      <Button loading={query.isFetching} onClick={() => void query.refetch()}>Tải lại đánh giá</Button></div>
    {query.data && <p className="gr-summary">{query.data.summary.averageRating === null ? 'Chưa có đánh giá' : `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(query.data.summary.averageRating)}/5 · ${query.data.summary.totalReviews} đánh giá toàn khách sạn`}</p>}
    {query.isPending ? <PageLoading /> : query.isError ? <Alert type="error" showIcon title="Chưa tải được đánh giá" description={errorMessage(query.error)} action={<Button onClick={() => void query.refetch()}>Thử lại</Button>} />
      : query.data.reviews.content.length ? <><div className="gr-list">{query.data.reviews.content.map(review => <GuestReviewCard key={review.id} review={review}>
        <p className="gr-help">Đơn đặt phòng: {review.bookingCode}</p>
        {review.canReply && (editing === review.id ? <ReplyForm key={`${review.id}-${review.version}`} hotelId={hotelId} review={review} refreshing={query.isFetching} onReload={() => void query.refetch()} onDone={() => setEditing(undefined)} />
          : <Button onClick={() => setEditing(review.id)}>{review.reply ? 'Sửa phản hồi' : 'Phản hồi đánh giá'}</Button>)}
      </GuestReviewCard>)}</div>
        <Pagination current={page + 1} pageSize={5} total={query.data.reviews.totalElements} showSizeChanger={false} hideOnSinglePage onChange={value => { setPage(value - 1); setEditing(undefined) }} /></>
        : <p className="gr-empty">Chưa có đánh giá phù hợp với bộ lọc. Đánh giá sẽ xuất hiện khi khách hoàn thành lưu trú và gửi nhận xét.</p>}
  </section>
}
function ReplyForm({ hotelId, review, refreshing, onReload, onDone }: { hotelId: string; review: GuestReview; refreshing: boolean; onReload: () => void; onDone: () => void }) {
  const mutation = useReplyGuestReview(hotelId, review.id)
  const { message } = App.useApp()
  const { control, handleSubmit, formState: { errors } } = useForm<ReplyValues>({ resolver: zodResolver(replyFormSchema), defaultValues: { content: review.reply ?? '' } })
  const conflict = mutation.error instanceof ApiError && mutation.error.status === 409
  async function submit(values: ReplyValues) {
    try { await mutation.mutateAsync({ values, version: review.version }); void message.success('Đã lưu phản hồi công khai của khách sạn.'); onDone() } catch { /* Preserve draft until explicit reload. */ }
  }
  return <form className="gr-form" aria-label="Phản hồi đánh giá" onSubmit={handleSubmit(submit)}>
    <label htmlFor={`review-reply-${review.id}`}>Phản hồi công khai của khách sạn</label>
    <Controller name="content" control={control} render={({ field }) => <Input.TextArea {...field} id={`review-reply-${review.id}`} rows={4} maxLength={2000} disabled={mutation.isPending || refreshing} status={errors.content ? 'error' : undefined} aria-describedby={errors.content ? `reply-error-${review.id}` : undefined} />} />
    {errors.content && <p className="gr-field-error" id={`reply-error-${review.id}`} role="alert">{errors.content.message}</p>}
    {mutation.isError && <Alert type="error" showIcon title="Chưa lưu được phản hồi" description={errorMessage(mutation.error)} action={conflict ? <Button onClick={() => { mutation.reset(); onReload() }}>Tải phiên bản mới</Button> : undefined} />}
    <div className="gr-actions"><Button htmlType="button" disabled={mutation.isPending} onClick={onDone}>Hủy chỉnh sửa</Button><Button type="primary" htmlType="submit" loading={mutation.isPending} disabled={refreshing || conflict}>Lưu phản hồi</Button></div>
  </form>
}
