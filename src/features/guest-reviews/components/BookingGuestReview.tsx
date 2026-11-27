import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, App, Button, Input } from 'antd'
import { ApiError, errorMessage } from '@/shared/api/api-error'
import { PageLoading } from '@/shared/ui/PageLoading'
import { reviewFormSchema, type ReviewValues } from '../api/guest-review-api'
import { useBookingReview, useSubmitGuestReview } from '../hooks/use-guest-reviews'
import { GuestReviewCard } from './GuestReviewCard'
import '../guest-reviews.css'

export function BookingGuestReview({ bookingId }: { bookingId: string }) {
  const query = useBookingReview(bookingId)
  return <section className="gr-booking" aria-label="Đánh giá sau lưu trú">
    <h3>Đánh giá sau lưu trú</h3>
    {query.isPending ? <PageLoading /> : query.isError ? <Alert type="error" showIcon title="Chưa tải được đánh giá" description={errorMessage(query.error)} action={<Button onClick={() => void query.refetch()}>Thử lại</Button>} />
      : query.data.review ? <><p>Bạn đã đánh giá đơn này. Nhận xét được hiển thị công khai với tên rút gọn.</p><GuestReviewCard review={query.data.review} /></>
        : query.data.canReview ? <ReviewForm bookingId={bookingId} onReload={() => void query.refetch()} /> : <p>{query.data.message}</p>}
  </section>
}
function ReviewForm({ bookingId, onReload }: { bookingId: string; onReload: () => void }) {
  const mutation = useSubmitGuestReview(bookingId)
  const { message } = App.useApp()
  const { control, handleSubmit, formState: { errors } } = useForm<ReviewValues>({ resolver: zodResolver(reviewFormSchema), defaultValues: { rating: 0, content: '' } })
  const conflict = mutation.error instanceof ApiError && mutation.error.status === 409
  async function submit(values: ReviewValues) {
    try { await mutation.mutateAsync(values); void message.success('Đã gửi đánh giá. Cảm ơn bạn đã chia sẻ trải nghiệm.') } catch { /* Keep the draft and show the server error. */ }
  }
  return <form className="gr-form" aria-label="Gửi đánh giá sau lưu trú" onSubmit={handleSubmit(submit)}>
    <p>Đánh giá được công khai với tên rút gọn. Mỗi đơn chỉ gửi một lần và không sửa sau khi gửi.</p>
    <fieldset className="gr-rating-input" disabled={mutation.isPending}><legend>Trải nghiệm của bạn <span>(1–5 sao)</span></legend>
      <Controller name="rating" control={control} render={({ field }) => <div className="gr-rating-options">{[1, 2, 3, 4, 5].map(value => <label key={value} htmlFor={`review-rating-${bookingId}-${value}`}>
        <input id={`review-rating-${bookingId}-${value}`} type="radio" name={field.name} value={value} checked={field.value === value} onBlur={field.onBlur} onChange={() => field.onChange(value)} ref={value === 1 ? field.ref : undefined} aria-describedby={errors.rating ? `rating-error-${bookingId}` : undefined} />
        <span>{value} sao</span></label>)}</div>} />
    </fieldset>
    {errors.rating && <p className="gr-field-error" id={`rating-error-${bookingId}`} role="alert">Chọn điểm từ 1 đến 5 sao.</p>}
    <label htmlFor={`review-content-${bookingId}`}>Nhận xét của bạn</label>
    <Controller name="content" control={control} render={({ field }) => <Input.TextArea {...field} id={`review-content-${bookingId}`} rows={5} maxLength={2000} disabled={mutation.isPending} status={errors.content ? 'error' : undefined} aria-describedby={errors.content ? `content-error-${bookingId}` : undefined} />} />
    {errors.content && <p className="gr-field-error" id={`content-error-${bookingId}`} role="alert">{errors.content.message}</p>}
    {mutation.isError && <Alert type="error" showIcon title="Chưa gửi được đánh giá" description={errorMessage(mutation.error)} action={conflict ? <Button onClick={onReload}>Tải lại đánh giá</Button> : undefined} />}
    <Button type="primary" htmlType="submit" loading={mutation.isPending} disabled={conflict}>Gửi đánh giá</Button>
  </form>
}
