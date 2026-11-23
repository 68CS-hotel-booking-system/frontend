import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it } from 'vitest'
import { AccountSecuritySettings } from './AccountSecuritySettings'

it('renders only the real password update form without mock security sections', () => {
  const html = renderToStaticMarkup(
    <QueryClientProvider client={new QueryClient()}>
      <AccountSecuritySettings />
    </QueryClientProvider>,
  )
  expect(html.match(/<input[^>]*type="password"/g)).toHaveLength(3)
  expect(html).toContain('autoComplete="current-password"')
  expect(html).toContain('data-score="0"')
  expect(html.match(/<button[^>]*type="submit"[^>]*>/)?.[0]).toContain('disabled')
  expect(html).not.toContain('Xác minh 2 bước')
  expect(html).not.toContain('Thiết bị &amp; phiên đăng nhập')
  expect(html).not.toContain('Liên kết Google')
  expect(html).not.toContain('Trung tâm an toàn')
})
