import type { ReactNode } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { App } from 'antd'
import { setAuthStatus, setSession } from '@/shared/api/session'
import { HotelReviewSubmission } from './HotelReviewSubmission'
import { HotelReviewDetail } from './HotelReviewDetail'
import { HotelProfileReadOnly } from './HotelProfileReadOnly'
import { useHotelProfileAccess } from '../hooks/use-hotel-profile-access'
import { hotelReviewKeys } from '../hooks/use-hotel-reviews'
import { reviewAdminId, reviewHotel, reviewOwnerId, reviewPage, submittedReview } from '../api/hotel-review.test-fixtures'
import type { HotelReviewSummary } from '../api/hotel-review-api'

const { ownerId: ownerUserId, ...fields } = reviewHotel
const hotel = { ...fields, ownerUserId }
afterEach(() => { setAuthStatus('unauthenticated'); setSession(null) })
function render(role: 'ADMIN' | 'HOTEL_OWNER', review: HotelReviewSummary | undefined, node: ReactNode, failedReviewRead = false) {
  const token = `test-${role}`
  setSession({ accessToken: token, expiresAt: '2099-01-01T00:00:00Z' })
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  client.setQueryData(['auth', 'current-user', token], {
    id: role === 'ADMIN' ? reviewAdminId : reviewOwnerId, email: 'review@test.local', fullName: 'Test', roles: [role],
  })
  client.setQueryData(hotelReviewKeys.management(hotel.id), reviewPage(review ? [review] : []))
  if (failedReviewRead) {
    client.getQueryCache().find({ queryKey: hotelReviewKeys.management(hotel.id) })?.setState({ status: 'error', error: new Error('Review unavailable') })
  }
  client.setQueryData(hotelReviewKeys.detail(submittedReview.id), submittedReview)
  const html = renderToStaticMarkup(<MemoryRouter><QueryClientProvider client={client}><App>{node}</App></QueryClientProvider></MemoryRouter>)
  client.clear()
  return html
}
function AccessProbe() {
  const access = useHotelProfileAccess(hotel)
  return <span>{access.canEditProfile ? 'edit-allowed' : 'read-only'}</span>
}
describe('owner submission and read-only admin review', () => {
  it('allows the owner to submit a draft without relying on the decorative completion percentage', () => {
    const html = render('HOTEL_OWNER', undefined, <HotelReviewSubmission hotel={hotel} />)
    expect(html).toContain('Gửi hồ sơ xét duyệt')
    expect(html).not.toContain('Backend chưa')
    expect(render('HOTEL_OWNER', undefined, <AccessProbe />)).toContain('edit-allowed')
  })
  it('locks pending profiles after reload and shows the submitted snapshot link', () => {
    const html = render('HOTEL_OWNER', submittedReview, <><HotelReviewSubmission hotel={hotel} /><AccessProbe /></>)
    expect(html).toContain('read-only')
    expect(html).toContain('đang chờ xét duyệt')
    expect(html).toContain(`/hotel-review-requests/${submittedReview.id}`)
    expect(html).not.toContain('Gửi hồ sơ xét duyệt</span>')
  })
  it('re-enables edits and resubmission after rejection while displaying the reason', () => {
    const rejected = { ...submittedReview, status: 'REJECTED' as const, reason: 'Bổ sung mô tả' }
    const html = render('HOTEL_OWNER', rejected, <><HotelReviewSubmission hotel={hotel} /><AccessProbe /></>)
    expect(html).toContain('edit-allowed')
    expect(html).toContain('Gửi lại hồ sơ')
    expect(html).toContain('Bổ sung mô tả')
  })
  it('never grants admin edit or owner submission actions', () => {
    const html = render('ADMIN', submittedReview, <><HotelReviewSubmission hotel={hotel} /><AccessProbe /><HotelProfileReadOnly hotel={hotel} reason="Admin chỉ xét duyệt" /></>)
    expect(html).toContain('read-only')
    expect(html).toContain('Danh sách chờ xét duyệt')
    expect(html).not.toContain('Gửi lại hồ sơ')
    expect(html).not.toContain('<input')
    expect(html).not.toContain('<textarea')
  })
  it('keeps editing locked when review status cannot be verified instead of treating the error as no pending review', () => {
    expect(render('HOTEL_OWNER', undefined, <AccessProbe />, true)).toContain('read-only')
  })
  it('shows decision buttons to admin only on a read-only submitted snapshot', () => {
    const adminHtml = render('ADMIN', submittedReview, <HotelReviewDetail requestId={submittedReview.id} />)
    expect(adminHtml).toContain('Duyệt hồ sơ')
    expect(adminHtml).toContain('Từ chối hồ sơ')
    expect(adminHtml).toContain('Mô tả tại thời điểm gửi')
    expect(adminHtml).not.toContain('<input')
    expect(adminHtml).not.toContain('Lưu toàn bộ thay đổi')
    const ownerHtml = render('HOTEL_OWNER', submittedReview, <HotelReviewDetail requestId={submittedReview.id} />)
    expect(ownerHtml).not.toContain('Duyệt hồ sơ')
    expect(ownerHtml).not.toContain('Từ chối hồ sơ')
  })
})
