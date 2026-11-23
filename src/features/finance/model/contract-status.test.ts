import { expect, it } from 'vitest'
import { isContractEndingSoon } from './contract-status'

it('warns only before expiry and inside the seven-day window', () => {
  const now = Date.parse('2026-11-22T00:00:00Z')
  expect(isContractEndingSoon('2026-11-29T00:00:00Z', now)).toBe(true)
  expect(isContractEndingSoon('2026-11-29T00:00:01Z', now)).toBe(false)
  expect(isContractEndingSoon('2026-11-22T00:00:00Z', now)).toBe(false)
  expect(isContractEndingSoon('2026-11-21T00:00:00Z', now)).toBe(false)
  expect(isContractEndingSoon(null, now)).toBe(false)
})
