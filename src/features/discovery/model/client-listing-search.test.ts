import { expect, it } from 'vitest'
import { countListingFilters, listingDetailHref, listingFilterDraftSchema, parseListingSearch, updateListingFilters, updateListingStay } from './client-listing-search'

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

it('counts supported filter groups, including an explicit zero price', () => {
  expect(countListingFilters({ sort: 'name' })).toBe(0)
  expect(countListingFilters({ sort: 'price', minPrice: 0, maxPrice: 2000000 })).toBe(1)
  expect(countListingFilters({ sort: 'rating', maxPrice: 2000000, starRating: 4 })).toBe(2)
})

it('clears empty editable prices without losing a valid zero or bypassing range validation', () => {
  expect(listingFilterDraftSchema.parse({ sort: 'price', minPrice: '', maxPrice: '' })).toEqual({ sort: 'price', minPrice: undefined, maxPrice: undefined })
  expect(listingFilterDraftSchema.parse({ sort: 'name', minPrice: 0, maxPrice: '' }).minPrice).toBe(0)
  expect(listingFilterDraftSchema.safeParse({ sort: 'name', minPrice: 500, maxPrice: 100 }).success).toBe(false)
})

it('applies or clears filters without losing the destination, stay or guest selection', () => {
  const params = new URLSearchParams('cityId=city&checkIn=2099-01-10&checkOut=2099-01-12&adults=3&children=1&page=4&maxPrice=500&starRating=4')
  const next = updateListingFilters(params, { sort: 'price', minPrice: 0 })
  expect(next.get('minPrice')).toBe('0')
  expect(next.has('maxPrice')).toBe(false)
  expect(next.has('starRating')).toBe(false)
  expect(next.has('page')).toBe(false)
  expect(next.get('cityId')).toBe('city')
  expect(next.get('adults')).toBe('3')
  expect(next.get('checkIn')).toBe('2099-01-10')
})
