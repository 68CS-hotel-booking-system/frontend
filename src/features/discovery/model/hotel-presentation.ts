const fold = (value: string) => value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('vi')

/** Tách tên thành phố khỏi địa chỉ để không lặp lại thành phố trên thẻ khách sạn. */
export function formatHotelLocation(cityName: string, address: string): { city: string; detail: string } {
  const city = cityName.trim().replace(/\s+/g, ' ')
  const cityKey = fold(city)
  const detail = address
    .split(',')
    .map((part) => part.trim().replace(/\s+/g, ' '))
    .filter((part) => part && fold(part) !== cityKey)
    .join(', ')
  return { city, detail }
}

export interface HotelPriceDisplay {
  amount: number
  currency: string
  label: string
  unit: string | null
}

/**
 * Backend trả totalPrice cho lượt tìm có ngày và minNightlyPrice cho lượt tìm không ngày.
 * Giữ nguyên quy ước đó, không tự tính lại giá.
 */
export function formatHotelPrice(hotel: {
  totalPrice: number | null
  minNightlyPrice: number | null
  currency: string | null
}): HotelPriceDisplay | null {
  const currency = hotel.currency?.trim() || 'VND'
  if (hotel.totalPrice != null) {
    return { amount: hotel.totalPrice, currency, label: 'Tổng kỳ lưu trú', unit: null }
  }
  if (hotel.minNightlyPrice != null) {
    return { amount: hotel.minNightlyPrice, currency, label: 'Từ', unit: '/ đêm' }
  }
  return null
}
