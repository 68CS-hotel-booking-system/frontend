import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { App as AntApp } from 'antd'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RoomTypeDailyRatesPanel } from './RoomTypeDailyRatesPanel'
import { hotelManagementKeys } from '../hooks/hotel-query-keys'
import { localRateDate, rateRangeEnd } from '../model/room-rates'
import type { DailyRoomRate } from '../model/hotel'

function renderRates(rates: DailyRoomRate[], hotelStatus = 'DRAFT', basePrice: number | 'missing' = 500000) {
  const date = localRateDate()
  const client = new QueryClient()
  client.setQueryData(hotelManagementKeys.rates('api', { hotelId: 'hotel', roomTypeId: 'type', startDate: date, endDate: rateRangeEnd(date, 7) }), rates)
  return renderToStaticMarkup(<QueryClientProvider client={client}><AntApp>
    <RoomTypeDailyRatesPanel hotelId="hotel" hotelStatus={hotelStatus} roomTypes={[{ id: 'type', hotelId: 'hotel', name: 'Deluxe', maxAdults: 2, maxChildren: 0, isActive: true, basePrice: basePrice === 'missing' ? undefined : basePrice }]} />
  </AntApp></QueryClientProvider>)
}

const day = (offset: number, source: DailyRoomRate['source'], price: number | null): DailyRoomRate => ({
  roomTypeId: 'type', rateDate: rateRangeEnd(localRateDate(), offset + 1), currency: 'VND', source,
  amount: source === 'RATE' ? price : null, effectivePrice: price, hasRate: source === 'RATE',
})

describe('backend-owned effective price rendering', () => {
  it.each(['ACTIVE', 'DRAFT', 'SUSPENDED'])('shows the backend price and source while hotel is %s', (hotelStatus) => {
    const markup = renderRates([day(0, 'BASE', 500000), day(1, 'RATE', 700000)], hotelStatus)
    expect(markup).toContain('Giá cơ bản')
    expect(markup).toContain('Giá riêng')
    expect(markup).toContain('500.000')
    expect(markup).toContain('700.000')
    expect(markup).toContain('Áp dụng 7 ngày')
    expect(markup).not.toContain('Chưa đặt giá')
    expect(markup).not.toContain('NaN')
    expect(markup).not.toContain('Infinity')
  })

  it('does not replace NONE with the room base price in calendar cells', () => {
    const markup = renderRates([day(0, 'NONE', null)], 'ACTIVE', 500000)
    expect(markup).toContain('Chưa có giá hợp lệ')
    expect(markup).toContain('Thiếu giá hợp lệ')
    expect(markup).not.toContain('Chưa đặt giá')
  })

  it('summarizes five base days and two custom days using effective prices', () => {
    const rates = Array.from({ length: 7 }, (_, i) => day(i, i === 1 || i === 2 ? 'RATE' : 'BASE', i === 1 || i === 2 ? 700000 : 500000))
    const markup = renderRates(rates)
    expect(markup).toContain('5 ngày')
    expect(markup).toContain('2 ngày')
    expect(markup).toContain('0 ngày')
    expect(markup).not.toContain('Đã đặt giá')
  })

  it('blocks the calendar for locked hotels without showing stale price cells', () => {
    const markup = renderRates([day(0, 'BASE', 500000)], 'LOCKED')
    expect(markup).toContain('Khách sạn đang bị khóa')
    expect(markup).not.toContain('Lưới giá theo ngày')
  })
})

it('distinguishes a missing base-price field from a stored zero without overriding Pricing daily prices', () => {
  const missing = renderRates([day(0, 'BASE', 300000)], 'DRAFT', 'missing')
  expect(missing).toContain('Chưa tải được giá cơ bản')
  expect(missing).not.toContain('Chưa có giá cơ bản')
  expect(missing).toContain('300.000')
  const zero = renderRates([day(0, 'NONE', null)], 'DRAFT', 0)
  expect(zero).toContain('Chưa có giá cơ bản')
  expect(zero).not.toContain('Chưa tải được giá cơ bản')
})
it('shows the saved base price in the header independently from a custom nightly rate', () => {
  const markup = renderRates([day(0, 'RATE', 200000)], 'DRAFT', 300000)
  expect(markup).toContain('300.000')
  expect(markup).toContain('200.000')
})
