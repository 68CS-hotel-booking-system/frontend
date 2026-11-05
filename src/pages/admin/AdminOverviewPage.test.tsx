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
    expect(markup).toContain('Bảng điều khiển tác vụ quản trị vận hành')

    // Live verified user data
    expect(markup).toContain('Vũ Quản Trị Hệ Thống')
    expect(markup).toContain('lead.admin@stayhub.vn')

    // Operational shortcuts
    expect(markup).toContain('Quản lý người dùng')
    expect(markup).toContain('Cơ sở lưu trú &amp; Phòng')
    expect(markup).toContain('Trạng thái máy chủ')

    // Explicit mock labels vs real API badges
    expect(markup).toContain('API Thật')
    expect(markup).toContain('Dữ liệu minh họa')

    // Empty state for missing backend analytics - NO fake revenue / booking counts
    expect(markup).toContain('Chưa kết nối API báo cáo phân tích')
    expect(markup).toContain('Dữ liệu thống kê doanh thu')
  })
})

