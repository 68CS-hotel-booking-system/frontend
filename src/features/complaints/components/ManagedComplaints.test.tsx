import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { expect, it, vi } from 'vitest'
import { ManagedComplaints } from './ManagedComplaints'
import { ManagedComplaintDetail } from './ManagedComplaintDetail'
import { ComplaintHistory } from './ComplaintHistory'
const state = vi.hoisted(() => ({ admin: false, status: 'OPEN', version: 0 }))
const id = '11111111-1111-4111-8111-111111111111'
vi.mock('@/features/auth', () => ({ useCurrentUser: () => ({ currentUser: { id }, isAdmin: state.admin }) }))
vi.mock('../hooks/use-managed-complaints', () => ({
  useManagedComplaints: () => ({ isPending: false, isFetching: false, isError: false, data: { content: [], totalElements: 0 } }),
  useManagedComplaint: () => ({ isPending: false, isFetching: false, isError: false, data: {
    complaint: { id, category: 'BILLING', content: 'Sai hóa đơn', status: state.status, version: state.version, history: [], createdAt: '2030-01-01T00:00:00Z' },
    hotelName: 'Khách sạn', bookingCode: 'BK001', bookerName: 'Người đặt', bookerEmail: 'guest@test.local', bookerPhone: '0901234567',
  } }),
  useHandleComplaint: () => ({ isPending: false, isError: false, mutateAsync: vi.fn() }),
}))
it('explains role scope and the empty queue without sample records', () => {
  state.admin = false
  const owner = renderToStaticMarkup(<MemoryRouter><ManagedComplaints /></MemoryRouter>)
  expect(owner).toContain('các khách sạn thuộc bạn')
  expect(owner).toContain('Chưa có khiếu nại trong phạm vi quản lý.')
  state.admin = true
  expect(renderToStaticMarkup(<MemoryRouter><ManagedComplaints /></MemoryRouter>)).toContain('toàn hệ thống')
})
it.each(['RESOLVED', 'REJECTED'])('hides processing controls for closed complaints: %s', status => {
  state.status = status
  const html = renderToStaticMarkup(<MemoryRouter><ManagedComplaintDetail id={id} /></MemoryRouter>)
  expect(html).toContain('Khiếu nại đã đóng')
  expect(html).not.toContain('handling-response')
  state.status = 'OPEN'
})
it('renders public feedback as text and explains the result without injecting HTML', () => {
  const html = renderToStaticMarkup(<ComplaintHistory history={[{ id, actorRole: 'ADMIN', fromStatus: 'IN_REVIEW', toStatus: 'RESOLVED',
    response: '<script>alert(1)</script>', createdAt: '2030-01-01T00:00:00Z', version: 2 }]} />)
  expect(html).toContain('Quản trị nền tảng')
  expect(html).toContain('Đã giải quyết')
  expect(html).not.toContain('<script>')
})
