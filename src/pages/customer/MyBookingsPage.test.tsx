import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { expect, it } from 'vitest'
import { ClientHomeProvider } from '@/features/discovery'
import { MyBookingsPage } from './MyBookingsPage'

function renderPage(path: string) {
  return renderToStaticMarkup(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={[path]}>
        <ClientHomeProvider><MyBookingsPage /></ClientHomeProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

it('links the account sidebar to saved stays on the bookings route', () => {
  const markup = renderPage('/my-bookings')
  expect(markup).toContain('href="/my-bookings?section=saved"')
  expect(markup).toContain('aria-label="Danh sách đặt phòng"')
})

it('shows saved stays inside the account layout for a direct link', () => {
  const markup = renderPage('/my-bookings?section=saved')
  const savedLink = markup.match(/<a[^>]+href="\/my-bookings\?section=saved"[^>]*>/)?.[0]
  expect(savedLink).toContain('aria-current="page"')
  expect(markup).toContain('<h1 id="account-page-title">Chỗ nghỉ đã lưu</h1>')
  expect(markup).toContain('Bấm trái tim khi xem một chỗ nghỉ')
  expect(markup).toContain('href="/explore"')
  expect(markup).not.toContain('aria-label="Danh sách đặt phòng"')
})
