import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ForgotPasswordPage } from './ForgotPasswordPage'
import { ResetPasswordPage } from './ResetPasswordPage'

describe('customer forgot and reset password pages', () => {
  it('renders forgot password modal without dev harness', () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/forgot-password']}>
        <QueryClientProvider client={new QueryClient()}>
          <ForgotPasswordPage />
        </QueryClientProvider>
      </MemoryRouter>,
    )

    expect(markup).toContain('role="dialog"')
    expect(markup).toContain('aria-modal="true"')
    expect(markup).toMatch(/<h2[^>]*>Quên mật khẩu<\/h2>/)
    expect(markup).toContain('type="email"')
    expect(markup).toContain('Quay lại đăng nhập')
    expect(markup).not.toContain('Kiểm thử nghiệp vụ')
    expect(markup).not.toContain('Chức năng cần kiểm thử')
  })

  it('renders reset password modal without dev harness', () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/reset-password']}>
        <QueryClientProvider client={new QueryClient()}>
          <ResetPasswordPage />
        </QueryClientProvider>
      </MemoryRouter>,
    )

    expect(markup).toContain('role="dialog"')
    expect(markup).toContain('aria-modal="true"')
    expect(markup).toMatch(/<h2[^>]*>Đặt lại mật khẩu<\/h2>/)
    expect(markup).toContain('autoComplete="new-password"')
    expect(markup).toContain('Quay lại đăng nhập')
    expect(markup).not.toContain('Kiểm thử nghiệp vụ')
    expect(markup).not.toContain('Chức năng cần kiểm thử')
  })
})
