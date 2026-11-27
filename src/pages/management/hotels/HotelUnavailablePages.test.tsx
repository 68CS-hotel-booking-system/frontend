import { expect, it } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { HotelWorkspaceProvider } from '@/features/hotels'
import type { ManagementHotelDetail } from '@/features/hotels'
import { HotelReviewsPage } from './HotelReviewsPage'

const hotel = { id: 'hotel', name: 'Biển Xanh', status: 'ACTIVE' } as ManagementHotelDetail

it('connects guest reviews without claiming that an unloaded list is empty', () => {
  const markup = renderToStaticMarkup(<QueryClientProvider client={new QueryClient()}><MemoryRouter><HotelWorkspaceProvider hotel={hotel} hotelId="hotel" isLoading={false} isError={false} error={null} refetch={() => {}}><HotelReviewsPage /></HotelWorkspaceProvider></MemoryRouter></QueryClientProvider>)
  expect(markup).toContain('Đánh giá &amp; Nhận xét')
  expect(markup).toContain('Tải lại đánh giá')
  expect(markup).not.toContain('Danh sách đánh giá chưa khả dụng')
  expect(markup).not.toContain('Chưa có đánh giá phù hợp')
})
