import { describe, expect, it } from 'vitest'
import { createHotelWithContactFormSchema } from './hotel-form-schemas'

const values = {
  name: 'Hotel', slug: '', cityId: '11111111-1111-4111-8111-111111111111',
  ownerUserId: '22222222-2222-4222-8222-222222222222', address: 'Hotel address',
  starRating: 4, checkInTime: '14:00', checkOutTime: '12:00', contactPhone: '', contactEmail: '',
}

describe('hotel creation contact validation', () => {
  it.each([
    { contactPhone: '0901234567' },
    { contactPhone: '+84901234567' },
    { contactEmail: 'desk@hotel.vn' },
    { contactPhone: '0901234567', contactEmail: 'desk@hotel.vn' },
  ])('accepts at least one valid contact: %o', (contact) => {
    expect(createHotelWithContactFormSchema.safeParse({ ...values, ...contact }).success).toBe(true)
  })

  it.each([
    {}, { contactPhone: ' ', contactEmail: ' ' },
    { contactPhone: '123', contactEmail: 'desk@hotel.vn' },
    { contactPhone: '0901234567', contactEmail: 'invalid' },
  ])('rejects missing or malformed contacts: %o', (contact) => {
    expect(createHotelWithContactFormSchema.safeParse({ ...values, ...contact }).success).toBe(false)
  })

  it('trims contacts before saving', () => {
    expect(createHotelWithContactFormSchema.parse({ ...values, contactPhone: ' 0901234567 ', contactEmail: ' desk@hotel.vn ' }))
      .toMatchObject({ contactPhone: '0901234567', contactEmail: 'desk@hotel.vn' })
  })
})
