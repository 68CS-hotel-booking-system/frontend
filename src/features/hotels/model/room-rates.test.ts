import { afterEach, describe, expect, it, vi } from 'vitest'
import { localRateDate, rateRangeEnd, setRoomRatesFormSchema } from './room-rates'

afterEach(() => vi.useRealTimers())

describe('rate editing dates and amounts', () => {
  it('uses the Vietnam business date across the UTC midnight boundary', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-11T17:30:00Z'))
    expect(localRateDate()).toBe('2026-11-12')
    vi.setSystemTime(new Date('2026-11-11T16:30:00Z'))
    expect(localRateDate()).toBe('2026-11-11')
  })

  it('selects seven inclusive days across month and leap-year boundaries', () => {
    expect(rateRangeEnd('2028-02-27', 7)).toBe('2028-03-04')
    expect(rateRangeEnd('2026-12-29', 7)).toBe('2027-01-04')
  })

  it.each([0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1])('rejects an invalid custom nightly amount: %s', (amount) => {
    expect(setRoomRatesFormSchema.safeParse({ startDate: '2026-11-12', endDate: '2026-11-18', amount }).success).toBe(false)
  })
})
