import { describe, expect, it } from 'vitest'
import { calculateHotelCompletion } from './hotel-workspace-context'

describe('hotel completion based on available server data', () => {
  it('does not infer configured prices merely from the existence of a room type', () => {
    const completion = calculateHotelCompletion({ roomTypes: [{ id: 'type', hotelId: 'hotel', name: 'Double', maxAdults: 2, maxChildren: 0, isActive: true }] })
    expect(completion.sections.rooms).toBe(true)
    expect(completion.sections.pricing).toBe(false)
  })

  it('counts stored images even if a private URL could not be resolved', () => {
    expect(calculateHotelCompletion({ imageCount: 2, coverImageUrl: null }).sections.photos).toBe(true)
    expect(calculateHotelCompletion({ imageCount: 0, coverImageUrl: 'stale-url' }).sections.photos).toBe(false)
  })
})

const pricedRoom = { id: 'type', hotelId: 'hotel', name: 'Double', maxAdults: 2, maxChildren: 0, isActive: true, basePrice: 500000 }

it('requires a positive base price for every active room type', () => {
  expect(calculateHotelCompletion({ roomTypes: [pricedRoom] }).sections.pricing).toBe(true)
  expect(calculateHotelCompletion({ roomTypes: [pricedRoom, { ...pricedRoom, id: 'second', basePrice: 0 }] }).sections.pricing).toBe(false)
  expect(calculateHotelCompletion({ roomTypes: [pricedRoom, { ...pricedRoom, isActive: false, basePrice: 0 }] }).sections.pricing).toBe(true)
  expect(calculateHotelCompletion({ roomTypes: [{ ...pricedRoom, isActive: false }] }).sections.pricing).toBe(false)
  expect(calculateHotelCompletion({ roomTypes: [], hasConfiguredRates: true }).sections.pricing).toBe(false)
})

it('does not count stale resource data after a load failure', () => {
  const completion = calculateHotelCompletion({ roomTypes: [pricedRoom], amenityIds: ['wifi'], imageCount: 2 }, { pricing: 'error', amenities: 'loading', photos: 'error' })
  expect(completion.sections.pricing).toBe(false)
  expect(completion.sections.amenities).toBe(false)
  expect(completion.sections.photos).toBe(false)
  expect(completion.percent).toBe(20)
})
