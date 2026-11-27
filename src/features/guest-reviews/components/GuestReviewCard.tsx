import type { ReactNode } from 'react'
import { StarFilled } from '@ant-design/icons'
import type { PublicGuestReview } from '../api/guest-review-api'
import '../guest-reviews.css'

export function ReviewScore({ rating }: { rating: number }) {
  return <span className="gr-score"><StarFilled aria-hidden="true" /><strong>{rating}/5</strong></span>
}
export function GuestReviewCard({ review, children }: { review: PublicGuestReview; children?: ReactNode }) {
  return <article className="gr-review" aria-label={`Đánh giá của ${review.authorDisplayName}`}>
    <header className="gr-review-heading"><div><strong>{review.authorDisplayName}</strong><time dateTime={review.createdAt}>{new Date(review.createdAt).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</time></div><ReviewScore rating={review.rating} /></header>
    <p className="gr-content">{review.content}</p>
    {review.reply && <section className="gr-owner-reply" aria-label="Phản hồi của khách sạn"><strong>Phản hồi từ khách sạn</strong><p className="gr-content">{review.reply}</p>
      {review.repliedAt && <time dateTime={review.repliedAt}>{new Date(review.repliedAt).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</time>}</section>}
    {children}
  </article>
}
