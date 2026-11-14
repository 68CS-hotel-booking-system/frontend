import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'
import { HotelWorkspaceProvider } from '@/features/hotels'
import type { ManagementHotelDetail } from '@/features/hotels'
import { reviewKeys } from '@/features/hotel-review-requests'
import { reviewSummaryFixture, hotelId } from '@/features/hotel-review-requests/model/review-request.test-fixture'
import { HotelProfileEditGuard } from './HotelProfileEditGuard'

const auth = vi.hoisted(() => ({ isAdmin: false }))
vi.mock('@/features/auth', () => ({ useCurrentUser: () => auth }))
function render(status?: 'PENDING' | 'REJECTED', operational = false, failed = false) {
  const client = new QueryClient()
  const key = reviewKeys.hotel(hotelId, 0, 1)
  if (failed) client.setQueryDefaults(key, { enabled: false })
  else client.setQueryData(key, { content: status ? [{ ...reviewSummaryFixture, status }] : [], page: 0, size: 1, totalElements: status ? 1 : 0, totalPages: status ? 1 : 0 })
  return renderToStaticMarkup(<MemoryRouter><QueryClientProvider client={client}><HotelWorkspaceProvider hotel={{ id: hotelId, status: 'DRAFT' } as ManagementHotelDetail} hotelId={hotelId} isLoading={false} isError={false} error={null} refetch={() => {}}>
    <HotelProfileEditGuard operational={operational}><form><input name="edit-hotel" /></form></HotelProfileEditGuard>
  </HotelWorkspaceProvider></QueryClientProvider></MemoryRouter>)
}
describe('profile editing during hotel review', () => {
  it('never mounts editing forms for an admin, including direct URLs', () => {
    auth.isAdmin = true
    try { const html = render(); expect(html).not.toContain('name="edit-hotel"'); expect(html).toContain('chỉ xem và xét duyệt') } finally { auth.isAdmin = false }
  })
  it('locks submitted profile content while preserving owner operations', () => {
    expect(render('PENDING')).not.toContain('name="edit-hotel"')
    expect(render('PENDING', true)).toContain('name="edit-hotel"')
  })
  it('allows owner corrections after rejection', () => { expect(render('REJECTED')).toContain('name="edit-hotel"') })
  it('does not expose editing forms before review history is available', () => { expect(render(undefined, false, true)).not.toContain('name="edit-hotel"') })
})
