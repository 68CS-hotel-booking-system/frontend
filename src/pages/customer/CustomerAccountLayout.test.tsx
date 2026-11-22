import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CustomerAccountLayout } from './CustomerAccountLayout'

describe('CustomerAccountLayout consistency', () => {
  it('renders complaints section using unified customer-account-reference layout without admin /staff link', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/my-complaints']}>
        <QueryClientProvider client={new QueryClient()}>
          <CustomerAccountLayout
            section="complaints"
            title="Khiếu nại của tôi"
            description="Xem tình trạng xử lý các yêu cầu hỗ trợ cho đơn đặt phòng."
          >
            <div>Nội dung khiếu nại</div>
          </CustomerAccountLayout>
        </QueryClientProvider>
      </MemoryRouter>,
    )

    expect(html).toContain('customer-account-reference')
    expect(html).toContain('account-breadcrumb')
    expect(html).not.toContain('href="/staff"')
    expect(html).not.toContain('Nhân sự khách sạn')
    expect(html).not.toContain('account-mobile-navigation')
  })
})
