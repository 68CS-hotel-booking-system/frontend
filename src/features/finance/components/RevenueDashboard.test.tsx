import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, expect, it, vi } from 'vitest'
import { RevenueDashboard } from './RevenueDashboard'

const access = vi.hoisted(() => ({ isAdmin: false }))
vi.mock('@/features/auth', () => ({
  useCurrentUser: () => ({ currentUser: { id: access.isAdmin ? 'admin-test' : 'owner-test' }, isAdmin: access.isAdmin, isOwner: !access.isAdmin }),
}))
afterEach(() => { access.isAdmin = false })

const contractRevenue = { contractId: '22222222-2222-4222-8222-222222222222', contractCode: 'HD-2026-000001',
  hotelId: '11111111-1111-4111-8111-111111111111', hotelName: 'Khách sạn thử', ownerId: '33333333-3333-4333-8333-333333333333',
  commissionRate: 10, startsAt: '2026-01-01T00:00:00Z', endsAt: '2026-11-01T00:00:00Z',
  completedBookingCount: 1, completedAmount: 2000000, basisAmount: 2000000, platformAmount: 200000, ownerAmount: 1800000, canManageHotel: true }

it('shows completed commission, legacy exclusions and the expired hotel without claiming payout', () => {
  const client = new QueryClient()
  client.setQueryData(['finance-dashboard', 'owner-test'], {
    bookingCount: 2, bookedAmount: 4000000, collectedAmount: 4000000, completedAmount: 2000000,
    platformAmount: 200000, ownerAmount: 1800000, missingCommissionCount: 1,
    contracts: [contractRevenue],
    hotels: [{ hotelId: '11111111-1111-4111-8111-111111111111', hotelName: 'Khách sạn thử',
      contractStatus: 'EXPIRED', endsAt: '2026-11-01T00:00:00Z', acceptingBookings: false }],
  })
  const html = renderToStaticMarkup(<MemoryRouter><QueryClientProvider client={client}><RevenueDashboard /></QueryClientProvider></MemoryRouter>)
  expect(html).toContain('Doanh thu lưu trú hoàn thành')
  expect(html).toContain('Hết hạn')
  expect(html).toContain('Đã ngừng bán')
  expect(html).toContain('1 đơn hoàn thành chưa có dữ liệu hoa hồng')
  expect(html).toContain('Chi trả owner thực hiện ngoài hệ thống')
  expect(html).toContain('Doanh thu của bạn')
  expect(html).toContain('Phân chia theo hợp đồng')
  expect(html).toContain('HD-2026-000001')
  expect(html).toContain('10%')
  expect(html).not.toContain('Đã thanh toán cho owner')
})

it('identifies platform commission as admin revenue rather than all collected guest money', () => {
  access.isAdmin = true
  const client = new QueryClient()
  client.setQueryData(['finance-dashboard', 'admin-test'], { bookingCount: 1, bookedAmount: 2000000, collectedAmount: 2000000,
    completedAmount: 2000000, platformAmount: 200000, ownerAmount: 1800000, missingCommissionCount: 0, hotels: [], contracts: [contractRevenue] })
  const html = renderToStaticMarkup(<MemoryRouter><QueryClientProvider client={client}><RevenueDashboard /></QueryClientProvider></MemoryRouter>)
  const metric = html.slice(html.indexOf('Doanh thu nền tảng'), html.indexOf('Khoản owner được hưởng'))
  expect(metric).toContain('200.000')
  expect(metric).not.toContain('2.000.000')
  expect(html).toContain('Tiền khách đã thanh toán là khoản nền tảng thu hộ')
  client.clear()
})

it('retains former owner revenue without exposing management links for a transferred hotel', () => {
  const client = new QueryClient()
  client.setQueryData(['finance-dashboard', 'owner-test'], { bookingCount: 1, bookedAmount: 2000000, collectedAmount: 2000000,
    completedAmount: 2000000, platformAmount: 200000, ownerAmount: 1800000, missingCommissionCount: 0, hotels: [], contracts: [{ ...contractRevenue, canManageHotel: false }] })
  const html = renderToStaticMarkup(<MemoryRouter><QueryClientProvider client={client}><RevenueDashboard /></QueryClientProvider></MemoryRouter>)
  expect(html).toContain('HD-2026-000001')
  expect(html).toContain('Khách sạn đã đổi chủ')
  expect(html).not.toContain(`href="/contracts?hotelId=${contractRevenue.hotelId}"`)
  expect(html).toContain('1.800.000')
  client.clear()
})

it('renders SVG donut, cashflow, contract split and hotel sales status charts from real dashboard data', () => {
  access.isAdmin = true
  const client = new QueryClient()
  client.setQueryData(['finance-dashboard', 'admin-test'], {
    bookingCount: 4,
    bookedAmount: 8000000,
    collectedAmount: 6000000,
    completedAmount: 5000000,
    platformAmount: 500000,
    ownerAmount: 4500000,
    missingCommissionCount: 0,
    contracts: [contractRevenue],
    hotels: [
      { hotelId: '11111111-1111-4111-8111-111111111111', hotelName: 'Khách sạn A', contractStatus: 'EFFECTIVE', endsAt: '2026-12-31T00:00:00Z', acceptingBookings: true },
      { hotelId: '22222222-2222-4222-8222-222222222222', hotelName: 'Khách sạn B', contractStatus: 'EXPIRED', endsAt: '2026-11-01T00:00:00Z', acceptingBookings: false },
    ],
  })
  const html = renderToStaticMarkup(<MemoryRouter><QueryClientProvider client={client}><RevenueDashboard /></QueryClientProvider></MemoryRouter>)
  expect(html).toContain('Tỷ trọng phân chia doanh thu')
  expect(html).toContain('Dòng tiền &amp; quy mô đặt phòng')
  expect(html).toContain('4 đơn đặt phòng')
  expect(html).toContain('Phân bổ theo hợp đồng')
  expect(html).toContain('Trạng thái mở bán khách sạn')
  expect(html).toContain('<svg')
  client.clear()
})
