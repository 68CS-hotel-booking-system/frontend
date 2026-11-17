import { expect, it } from 'vitest'
import { listingDetailHref, parseListingSearch, updateListingStay } from './client-listing-search'

it('searches one room using the total of adults and children and ignores old quantity links', () => {
  const result = parseListingSearch(new URLSearchParams('adults=2&children=1&quantity=9'))!
  expect(result.search.guests).toBe(3)
  expect(result.search).not.toHaveProperty('quantity')
  expect(listingDetailHref('hotel', result.stay)).toBe('/stays/hotel?adults=2&children=1')
})

it('rejects invalid deep links instead of fetching a different search silently', () => {
  for (const value of ['page=-1', 'sort=unknown', 'adults=0', 'children=-1', 'checkIn=2099-01-10', 'checkIn=2099-01-12&checkOut=2099-01-10', 'minPrice=500&maxPrice=100']) {
    expect(parseListingSearch(new URLSearchParams(value)), value).toBeNull()
  }
})

it('preserves a zero minimum price and backend sort while using zero-based pagination', () => {
  const result = parseListingSearch(new URLSearchParams('minPrice=0&maxPrice=1000000&starRating=4&sort=price&page=2'))!
  expect(result.search).toMatchObject({ minPrice: 0, maxPrice: 1000000, starRating: 4, sort: 'price', page: 2, size: 8 })
})

it('resets the page and stale city slug while retaining other filters after editing the stay', () => {
  const stay = { cityId: 'city', checkIn: '2099-01-10', checkOut: '2099-01-12', adults: 2, children: 1 }
  const next = updateListingStay(new URLSearchParams('page=3&quantity=8&citySlug=hanoi&minPrice=100'), stay)
  expect(next.has('page')).toBe(false)
  expect(next.has('quantity')).toBe(false)
  expect(next.has('citySlug')).toBe(false)
  expect(next.get('minPrice')).toBe('100')
  expect(listingDetailHref('hotel', stay)).toContain('checkIn=2099-01-10&checkOut=2099-01-12')
})
