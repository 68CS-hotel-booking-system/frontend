import { describe, expect, it, beforeEach } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AdminOverviewPage } from './AdminOverviewPage'
import { setSession } from '@/shared/api/session'

const adminTokens = {
  accessToken: 'overview-test-token',
  refreshToken: 'overview-test-refresh',
  expiresAt: '2026-11-05T10:00:00Z',
}

describe('AdminOverviewPage component', () => {
  beforeEach(() => {
    setSession(null)
  })

  it('renders overview header and operational tasks with truthful data boundaries', () => {
    setSession(adminTokens)
    const qc = new QueryClient()
    qc.setQueryData(['auth', 'current-user', 'overview-test-token'], {
      id: '88888888-8888-4888-8888-888888888888',
      email: 'lead.admin@stayhub.vn',
      fullName: 'Vũ Quản Trị Hệ Thống',
      phone: null,
      status: 'ACTIVE',
      emailVerified: true,
      version: 1,
      roles: ['ADMIN'],
    })

    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <QueryClientProvider client={qc}>
          <AdminOverviewPage />
        </QueryClientProvider>
      </MemoryRouter>,
    )

    // Heading
    expect(markup).toContain('Tổng quan')
    expect(markup).toContain('Theo dõi nhu cầu, doanh thu và vận hành StayHub trong một màn hình.')

    // Live verified user data
    expect(markup).toContain('Vũ Quản Trị Hệ Thống')
    expect(markup).toContain('lead.admin@stayhub.vn')

    // Real operational & status sections
    expect(markup).toContain('Quản lý tài khoản')
    expect(markup).toContain('Khách sạn')
    expect(markup).toContain('Trạng thái máy chủ')
    expect(markup).toContain('Doanh thu &amp; hoa hồng')

    // All mock data & demo labels removed
    expect(markup).not.toContain('Phiên demo')
    expect(markup).not.toContain('Dữ liệu minh họa')
    expect(markup).not.toContain('dữ liệu mô phỏng')
    expect(markup).not.toContain('Công việc cần xử lý')
    expect(markup).not.toContain('đơn chờ xử lý')
    expect(markup).not.toContain('Chưa kết nối')
    expect(markup).not.toContain('Lượng đặt phòng theo thời gian')
    expect(markup).not.toContain('Doanh thu nền tảng theo thời gian')
    expect(markup).not.toContain('Chạy kiểm tra mô phỏng')
  })

  it('adapts header CTA and hides admin-only user module for HOTEL_OWNER', () => {
    setSession(adminTokens)
    const qc = new QueryClient()
    qc.setQueryData(['auth', 'current-user', 'overview-test-token'], {
      id: '99999999-9999-4999-8999-999999999999',
      email: 'owner@stayhub.vn',
      fullName: 'Chủ Khách Sạn',
      phone: null,
      status: 'ACTIVE',
      emailVerified: true,
      version: 1,
      roles: ['HOTEL_OWNER'],
    })

    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <QueryClientProvider client={qc}>
          <AdminOverviewPage />
        </QueryClientProvider>
      </MemoryRouter>,
    )

    expect(markup).toContain('Chủ Khách Sạn')
    expect(markup).not.toContain('Quản lý tài khoản')
    expect(markup).not.toContain('Người dùng &amp; Phân quyền')
    expect(markup).not.toContain('Chạy kiểm tra mô phỏng')
    expect(markup).toContain('6 phân hệ vận hành đối tác')
  })
})

