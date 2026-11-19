import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { expect, it } from 'vitest'
import { ForgotPasswordView, ResetPasswordView } from './PasswordRecovery'

function renderRecovery(view: React.ReactNode, pathname: string, state?: Record<string, string>) {
  const client = new QueryClient()
  return renderToStaticMarkup(<QueryClientProvider client={client}>
    <MemoryRouter initialEntries={[{ pathname, state }]}>{view}</MemoryRouter>
  </QueryClientProvider>)
}

it('shows the customer recovery form with the email from sign-in', () => {
  const html = renderRecovery(<ForgotPasswordView />, '/forgot-password', { recoveryEmail: 'guest@example.test' })
  expect(html).toContain('guest@example.test')
  expect(html).toContain('Gửi email đặt lại mật khẩu')
  expect(html).toContain('href="/login"')
  expect(html).not.toContain('Kiểm thử nghiệp vụ')
})

it('offers a fresh recovery link when the reset page opens without a token', () => {
  const html = renderRecovery(<ResetPasswordView />, '/reset-password')
  expect(html).toContain('Yêu cầu liên kết mới')
  expect(html).toContain('href="/forgot-password"')
  expect(html).not.toContain('Lưu mật khẩu mới')
})
