import { describe, expect, it } from 'vitest'
import { displayStayDate, isStayDate, selectStayDate, stayNights, type StayDateSelection } from './stay-date-selection'

const today = '2026-11-17'
const initial: StayDateSelection = { checkIn: '2026-12-18', checkOut: '2026-12-20', selecting: 'checkIn' }
describe('stay date selection', () => {
  it('starts with check-in and clears a previous checkout on the first click', () => {
    expect(selectStayDate(initial, '2026-12-04', today)).toEqual({ checkIn: '2026-12-04', checkOut: '', selecting: 'checkOut' })
  })
  it('replaces 4 with 2 and waits for a strictly later checkout', () => {
    const fourth = selectStayDate(initial, '2026-12-04', today)
    const second = selectStayDate(fourth, '2026-12-02', today)
    expect(second).toEqual({ checkIn: '2026-12-02', checkOut: '', selecting: 'checkOut' })
    expect(selectStayDate(second, '2026-12-02', today)).toEqual(second)
    expect(selectStayDate(second, '2026-12-05', today)).toEqual({ checkIn: '2026-12-02', checkOut: '2026-12-05', selecting: 'checkIn' })
  })
  it('starts another range after a completed selection', () => {
    const start = selectStayDate(initial, '2026-12-04', today)
    const end = selectStayDate(start, '2026-12-06', today)
    expect(selectStayDate(end, '2026-12-07', today)).toEqual({ checkIn: '2026-12-07', checkOut: '', selecting: 'checkOut' })
  })
  it('rejects past and invalid dates, including impossible leap days', () => {
    for (const date of ['2026-11-16', '2026-02-29', '2026-12-32', '', 'x']) expect(selectStayDate(initial, date, today)).toBe(initial)
    expect(isStayDate('2028-02-29')).toBe(true)
    expect(selectStayDate(initial, today, today).checkIn).toBe(today)
  })
  it('allows up to 30 nights across month/year boundaries', () => {
    const start = selectStayDate(initial, '2026-12-18', today)
    expect(selectStayDate(start, '2027-01-17', today).checkOut).toBe('2027-01-17')
    expect(selectStayDate(start, '2027-01-18', today)).toBe(start)
    expect(stayNights('2028-02-28', '2028-03-01')).toBe(2)
    expect(stayNights('', '')).toBe(0)
    expect(displayStayDate('2027-01-02')).toBe('02/01/2027')
    expect(displayStayDate('invalid')).toBe('Thêm ngày')
  })
})
