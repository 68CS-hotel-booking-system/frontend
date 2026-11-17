import { expect, it } from 'vitest'
import { canAccommodateGuests } from './guest-capacity'

const rooms = [
  { id: 'a', name: 'A', maxAdults: 2, maxChildren: 1, maxOccupancy: 2 },
  { id: 'b', name: 'B', maxAdults: 1, maxChildren: 2, maxOccupancy: 3 },
]
it('respects adult, child and combined room limits', () => {
  expect(canAccommodateGuests([rooms[0]], { adults: 1, children: 1 })).toBe(true)
  expect(canAccommodateGuests([rooms[0]], { adults: 2, children: 1 })).toBe(false)
  expect(canAccommodateGuests([rooms[0]], { adults: 1, children: 2 })).toBe(false)
  expect(canAccommodateGuests([rooms[0]], { adults: 3, children: 0 })).toBe(false)
})
it('does not combine maximums from different room types before a room is selected', () => {
  expect(canAccommodateGuests(rooms, { adults: 2, children: 2 })).toBe(false)
  expect(canAccommodateGuests(rooms, { adults: 1, children: 2 })).toBe(true)
})
it('rejects empty room lists, invalid values and selections below minimums', () => {
  expect(canAccommodateGuests([], { adults: 1, children: 0 })).toBe(false)
  expect(canAccommodateGuests(rooms, { adults: 0, children: 0 })).toBe(false)
  expect(canAccommodateGuests(rooms, { adults: 1, children: -1 })).toBe(false)
  expect(canAccommodateGuests(rooms, { adults: NaN, children: 0 })).toBe(false)
})
