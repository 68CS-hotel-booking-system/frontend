import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router'
import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it, vi } from 'vitest'
import { RevenueDashboard } from './RevenueDashboard'

vi.mock('@/features/auth', () => ({
  useCurrentUser: () => ({ currentUser: { id: 'owner-test' }, isAdmin: false, isOwner: true }),
}))

it('shows completed commission, legacy exclusions and the expired hotel without claiming payout', () => {
  const client = new QueryClient()
  client.setQueryData(['finance-dashboard', 'owner-test'], {
    bookingCount: 2, bookedAmount: 4000000, collectedAmount: 4000000, completedAmount: 2000000,
    platformAmount: 200000, ownerAmount: 1800000, missingCommissionCount: 1,
    hotels: [{ hotelId: '11111111-1111-4111-8111-111111111111', hotelName: 'Khách sạn thử',
      contractStatus: 'EXPIRED', endsAt: '2026-11-01T00:00:00Z', acceptingBookings: false }],
  })
  const html = renderToStaticMarkup(<MemoryRouter><QueryClientProvider client={client}><RevenueDashboard /></QueryClientProvider></MemoryRouter>)
  expect(html).toContain('Doanh thu lưu trú hoàn thành')
  expect(html).toContain('Hết hạn')
  expect(html).toContain('Đã ngừng bán')
  expect(html).toContain('1 đơn hoàn thành chưa có dữ liệu hoa hồng')
  expect(html).toContain('Chi trả owner thực hiện ngoài hệ thống')
  expect(html).not.toContain('Đã thanh toán cho owner')
})
