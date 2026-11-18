import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it } from 'vitest'
import { AccountSecuritySettings } from './AccountSecuritySettings'

it('renders a masked password form and marks unavailable security settings', () => {
  const html = renderToStaticMarkup(<QueryClientProvider client={new QueryClient()}><AccountSecuritySettings /></QueryClientProvider>)
  expect(html.match(/<input[^>]*type="password"/g)).toHaveLength(3)
  expect(html).toContain('autoComplete="current-password"')
  expect(html).toContain('data-score="0"')
  expect(html.match(/<button[^>]*type="submit"[^>]*>/)?.[0]).toContain('disabled')
  expect(html.match(/<button[^>]*aria-label="Liên kết Google"[^>]*>/)?.[0]).toContain('disabled')
  expect(html).toContain('Danh sách các phiên khác hiện chưa khả dụng.')
  expect(html).toContain('Trung tâm an toàn')
})
