import { expect, it } from 'vitest'
import { stayKey } from './use-booking-checkout'

it('invalidates the quote identity for every stay input, independent of object field order', () => {
  const stay = { checkIn: '2030-01-10', checkOut: '2030-01-12', adults: 2, children: 0, quantity: 1 }
  const reordered = { quantity: 1, children: 0, adults: 2, checkOut: '2030-01-12', checkIn: '2030-01-10' }
  expect(stayKey(stay)).toBe(stayKey(reordered))
  for (const change of [{ checkIn: '2030-01-11' }, { checkOut: '2030-01-13' }, { adults: 3 }, { children: 1 }, { quantity: 2 }]) {
    expect(stayKey({ ...stay, ...change })).not.toBe(stayKey(stay))
  }
})
