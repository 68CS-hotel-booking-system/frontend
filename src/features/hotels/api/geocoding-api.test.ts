import { describe, expect, it } from 'vitest'
import { isCityMatch, normalizeCityName } from './geocoding-api'

describe('geocoding-api utilities', () => {
  it('normalizes Vietnamese city names correctly', () => {
    expect(normalizeCityName('Đà Nẵng')).toBe('danang')
    expect(normalizeCityName('Thành phố Đà Nẵng')).toBe('danang')
    expect(normalizeCityName('TP. Đà Nẵng')).toBe('danang')
    expect(normalizeCityName('Hà Nội')).toBe('hanoi')
    expect(normalizeCityName('Thành phố Hà Nội')).toBe('hanoi')
    expect(normalizeCityName('TP. Hồ Chí Minh')).toBe('hochiminh')
  })

  it('detects city match correctly', () => {
    expect(isCityMatch('Đà Nẵng', 'Thành phố Đà Nẵng')).toBe(true)
    expect(isCityMatch('Hà Nội', 'Thành phố Hà Nội')).toBe(true)
    expect(isCityMatch('Hà Nội', 'Đà Nẵng')).toBe(false)
    expect(isCityMatch('Hồ Chí Minh', 'Hà Nội')).toBe(false)
    expect(isCityMatch(undefined, 'Đà Nẵng')).toBe(true)
  })
})
