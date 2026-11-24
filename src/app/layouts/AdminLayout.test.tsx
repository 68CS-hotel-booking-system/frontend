import { describe, expect, it, beforeEach } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AdminLayout } from './AdminLayout'
import { setSession } from '@/shared/api/session'

const adminTokens = {
  accessToken: 'admin-layout-test-token',
  refreshToken: 'admin-layout-test-refresh',
  expiresAt: '2026-11-05T10:00:00Z',
}

describe('AdminLayout component', () => {
  beforeEach(() => {
    setSession(null)
  })

  it('hides owner-only staff navigation when the account also has ADMIN', () => {
    setSession(adminTokens)
    const qc = new QueryClient()
    qc.setQueryData(['auth', 'current-user', 'admin-layout-test-token'], {
      id: '99999999-9999-4999-8999-999999999999', email: 'admin-owner@stayhub.vn',
      fullName: 'Admin kiêm owner', phone: null, status: 'ACTIVE', emailVerified: true, version: 1,
      roles: ['ADMIN', 'HOTEL_OWNER'],
    })
    const html = renderToStaticMarkup(<MemoryRouter><QueryClientProvider client={qc}><AdminLayout /></QueryClientProvider></MemoryRouter>)
    expect(html).not.toContain('href="/staff"')
    expect(html).not.toContain('href="/vouchers"')
    expect(html).not.toContain('href="/financial-access"')
    expect(html).toContain('href="/admin/users"')
    qc.clear()
  })

  it('renders navigation drawer groups and items with Material 3 structure', () => {
    setSession(adminTokens)
    const qc = new QueryClient()
    qc.setQueryData(['auth', 'current-user', 'admin-layout-test-token'], {
      id: '99999999-9999-4999-8999-999999999999',
      email: 'verified.admin@stayhub.vn',
      fullName: 'Trần Quản Trị Viên',
      phone: null,
      status: 'ACTIVE',
      emailVerified: true,
      version: 1,
      roles: ['ADMIN'],
    })

    const markup = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/admin/overview']}>
        <QueryClientProvider client={qc}>
          <AdminLayout />
        </QueryClientProvider>
      </MemoryRouter>,
    )

    // Structural elements
    expect(markup).toContain('StayHub')
    expect(markup).toContain('Admin Portal')
    expect(markup).toContain('Bảng điều khiển')
    expect(markup).toContain('Vận hành')
    expect(markup).toContain('Hệ thống')

    // Navigation links
    expect(markup).toContain('href="/admin/overview"')
    expect(markup).toContain('href="/admin/users"')
    expect(markup).toContain('href="/hotels"')
    expect(markup).toContain('href="/system-status"')
    expect(markup).not.toContain('href="/staff"')
    expect(markup).not.toContain('href="/vouchers"')

    expect(markup).not.toContain('href="/financial-access"')

    // Active link has is-active class
    expect(markup).toContain('is-active')
  })

  it('displays verified real user information and avoids hardcoded names', () => {
    setSession(adminTokens)
    const qc = new QueryClient()
    qc.setQueryData(['auth', 'current-user', 'admin-layout-test-token'], {
      id: '99999999-9999-4999-8999-999999999999',
      email: 'director@stayhub.vn',
      fullName: 'Lê Hoàng Giám Đốc',
      phone: '0988776655',
      status: 'ACTIVE',
      emailVerified: true,
      version: 1,
      roles: ['ADMIN'],
    })

    const markup = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/admin/overview']}>
        <QueryClientProvider client={qc}>
          <AdminLayout />
        </QueryClientProvider>
      </MemoryRouter>,
    )

    // Real dynamic user info
    expect(markup).toContain('Lê Hoàng Giám Đốc')
    expect(markup).toContain('director@stayhub.vn')

    // MUST NOT have old hardcoded name
    expect(markup).not.toContain('Nguyễn Văn An')
  })

  it('renders quick action link back to customer homepage', () => {
    setSession(adminTokens)
    const qc = new QueryClient()
    const markup = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/admin/overview']}>
        <QueryClientProvider client={qc}>
          <AdminLayout />
        </QueryClientProvider>
      </MemoryRouter>,
    )

    expect(markup).toContain('Về trang khách')
    expect(markup).toContain('href="/"')
  })

  it('renders customized owner menu hiding admin-only items like user management and system status', () => {
    setSession(adminTokens)
    const qc = new QueryClient()
    qc.setQueryData(['auth', 'current-user', 'admin-layout-test-token'], {
      id: '88888888-8888-4888-8888-888888888888',
      email: 'owner@stayhub.vn',
      fullName: 'Phạm Khách Sạn',
      phone: '0901234567',
      status: 'ACTIVE',
      emailVerified: true,
      version: 1,
      roles: ['HOTEL_OWNER'],
    })

    const markup = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/hotels']}>
        <QueryClientProvider client={qc}>
          <AdminLayout />
        </QueryClientProvider>
      </MemoryRouter>,
    )

    // Owner brand
    expect(markup).toContain('Partner Portal')
    expect(markup).toContain('Phạm Khách Sạn')

    // Owner allowed menus
    expect(markup).toContain('href="/hotels"')
    expect(markup).toContain('href="/bookings"')
    expect(markup).toContain('href="/customers"')
    expect(markup).toContain('href="/staff"')
    expect(markup).toContain('href="/vouchers"')
    expect(markup).toContain('href="/finance"')
    expect(markup).toContain('href="/reports"')
    expect(markup).not.toContain('tab=create')
    expect(markup).not.toContain('href="/management/rates"')

    // Admin-only menus MUST NOT be present
    expect(markup).not.toContain('href="/financial-access"')
    expect(markup).not.toContain('href="/admin/users"')
    expect(markup).not.toContain('href="/system-status"')
  })

  it('displays exact breadcrumb title for /staff route', () => {
    setSession(adminTokens)
    const qc = new QueryClient()
    const markup = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/staff']}>
        <QueryClientProvider client={qc}>
          <AdminLayout />
        </QueryClientProvider>
      </MemoryRouter>,
    )

    expect(markup).toContain('Nhân sự khách sạn')
  })
})

