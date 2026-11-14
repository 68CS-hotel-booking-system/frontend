import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { HotelWorkspaceProvider } from '@/features/hotels'
import type { ManagementHotelDetail } from '@/features/hotels'
import { HotelBookingsPage } from './HotelBookingsPage'
import { HotelReviewsPage } from './HotelReviewsPage'

const hotel = { id: 'hotel', name: 'Biển Xanh', status: 'ACTIVE' } as ManagementHotelDetail

describe('hotel pages without a connected list query', () => {
  it.each([
    [HotelBookingsPage, 'Danh sách đặt phòng chưa khả dụng', 'Chưa có đơn đặt phòng nào'],
    [HotelReviewsPage, 'Danh sách đánh giá chưa khả dụng', 'Chưa có đánh giá nào'],
  ] as const)('does not claim an unloaded list is empty', (Page, unavailable, empty) => {
    const markup = renderToStaticMarkup(<MemoryRouter><HotelWorkspaceProvider hotel={hotel} hotelId="hotel" isLoading={false} isError={false} error={null} refetch={() => {}}><Page /></HotelWorkspaceProvider></MemoryRouter>)
    expect(markup).toContain(unavailable)
    expect(markup).not.toContain(empty)
    expect(markup).not.toContain('Làm mới')
  })
})
