import { describe, expect, it } from 'vitest'
import { formatHotelLocation, formatHotelPrice } from './hotel-presentation'

describe('formatHotelLocation', () => {
  it('bỏ thành phố bị lặp và các đoạn rỗng trong địa chỉ', () => {
    expect(formatHotelLocation('Hà Nội', ' 12 Lý Thái Tổ ,, Hoàn Kiếm, Hà Nội , ')).toEqual({
      city: 'Hà Nội',
      detail: '12 Lý Thái Tổ, Hoàn Kiếm',
    })
  })

  it('so khớp thành phố không phân biệt hoa thường', () => {
    expect(formatHotelLocation('Đà Lạt', 'đà lạt')).toEqual({ city: 'Đà Lạt', detail: '' })
  })

  it('giữ nguyên địa chỉ khi không chứa thành phố', () => {
    expect(formatHotelLocation('Hội An', '128 Nguyễn Duy Hiệu, Cẩm Châu')).toEqual({
      city: 'Hội An',
      detail: '128 Nguyễn Duy Hiệu, Cẩm Châu',
    })
  })
})

describe('formatHotelPrice', () => {
  const hotel = { totalPrice: null, minNightlyPrice: null, currency: 'VND' }

  it('ưu tiên tổng giá kỳ lưu trú khi tìm có ngày', () => {
    expect(formatHotelPrice({ ...hotel, totalPrice: 5400000 })).toEqual({
      amount: 5400000,
      currency: 'VND',
      label: 'Tổng kỳ lưu trú',
      unit: null,
    })
  })

  it('dùng giá mỗi đêm khi không có tổng giá', () => {
    expect(formatHotelPrice({ ...hotel, minNightlyPrice: 1800000 })).toEqual({
      amount: 1800000,
      currency: 'VND',
      label: 'Từ',
      unit: '/ đêm',
    })
  })

  it('giữ tổng giá bằng 0 thay vì coi là thiếu giá', () => {
    expect(formatHotelPrice({ totalPrice: 0, minNightlyPrice: 1800000, currency: 'VND' })?.amount).toBe(0)
  })

  it('mặc định VND khi thiếu đơn vị tiền', () => {
    expect(formatHotelPrice({ totalPrice: 2000000, minNightlyPrice: null, currency: null })?.currency).toBe('VND')
  })

  it('trả null khi chưa biết giá', () => {
    expect(formatHotelPrice(hotel)).toBeNull()
  })
})
