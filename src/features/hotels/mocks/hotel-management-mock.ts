import type { AmenityItem, CityItem, DailyRoomRate, ManagementHotelDetail, ManagementHotelListQuery, ManagementHotelPage } from '../model/hotel'
import type { CreateAdminHotelFormValues, UpdateManagementHotelFormValues } from '../model/hotel-form-schemas'

/**
 * DỮ LIỆU MẪU (MOCK PREVIEW) — Chỉ sử dụng khi người dùng bật chế độ "Dữ liệu mẫu (Mock)"
 * để xem trước giao diện quản trị khách sạn tuần 2 khi Backend chưa triển khai các endpoint này.
 */
export const MOCK_CITIES: CityItem[] = [
  {
    id: '11111111-1111-4111-8111-111111111101',
    countryCode: 'VN',
    name: 'Hà Nội',
    slug: 'ha-noi',
  },
]

export const MOCK_AMENITIES: AmenityItem[] = [
  {
    id: '22222222-2222-4222-8222-222222222201',
    code: 'INFINITY_POOL',
    name: 'Hồ bơi vô cực (Infinity Pool)',
    category: 'HOTEL',
  },
]

let mockHotelsStore: ManagementHotelDetail[] = [
  {
    id: '33333333-3333-4333-8333-333333333301',
    ownerUserId: '99999999-9999-4999-8999-999999999901',
    ownerName: 'Nguyễn Minh Quân (IHG Representative)',
    cityId: '11111111-1111-4111-8111-111111111101',
    cityName: 'Hà Nội',
    name: 'InterContinental Hanoi Westlake By IHG',
    slug: 'intercontinental-hanoi-westlake-by-ihg-ha-noi-vn',
    address: '05 Phố Từ Hoa, Phường Quảng An, Quận Tây Hồ, Hà Nội',
    starRating: 5,
    checkInTime: '14:00',
    checkOutTime: '12:00',
    status: 'ACTIVE',
    coverImageUrl:
      'https://pix6.agoda.net/hotelImages/90776/0/3292e1e48233abcd435c21c5317ff385.jpeg?ce=0&s=1024x768',
    vibeTags: ['Boutique Art', 'Pool Party', 'Rooftop Chill'],
    roomTypeCount: 1,
    description:
      'Biểu tượng nghỉ dưỡng 5 sao sang trọng bậc nhất thủ đô, nổi bật với các biệt thự pavilion tọa lạc ngay trên mặt nước phẳng lặng của Hồ Tây thanh bình cùng quầy Sunset Bar trứ danh.',
    latitude: 21.0583,
    longitude: 105.8306,
    amenityIds: ['22222222-2222-4222-8222-222222222201'],
    roomTypes: [
      {
        id: '44444444-4444-4444-8444-444444444401',
        hotelId: '33333333-3333-4333-8333-333333333301',
        name: 'Westlake Lakefront Suite (Suite View Hồ Tây)',
        description: '48m² · 1 King Bed lớn · Ban công riêng ngắm hoàng hôn Hồ Tây',
        maxAdults: 3,
        maxChildren: 1,
        isActive: true,
        totalRooms: 4,
      },
    ],
    createdAt: '2026-09-10T08:00:00Z',
    updatedAt: '2026-10-27T14:20:00Z',
  },
]

const BASE_ROOM_RATES_BY_TYPE: Record<string, number> = {
  '44444444-4444-4444-8444-444444444401': 3200000,
}

export async function getMockCities(): Promise<CityItem[]> {
  return MOCK_CITIES
}

export async function getMockAmenities(): Promise<AmenityItem[]> {
  return MOCK_AMENITIES
}

export async function getMockManagementHotels(
  query: ManagementHotelListQuery = {},
): Promise<ManagementHotelPage> {
  const page = query.page ?? 0
  const size = query.size ?? 6
  const keyword = query.keyword?.trim().toLowerCase() ?? ''

  const filtered = mockHotelsStore.filter((hotel) => {
    if (query.cityId && hotel.cityId !== query.cityId) return false
    if (query.status && query.status !== 'ALL' && hotel.status !== query.status) {
      return false
    }
    if (query.vibe && query.vibe !== 'ALL') {
      const tags = hotel.vibeTags ?? []
      if (!tags.includes(query.vibe)) return false
    }
    if (keyword) {
      const haystack =
        `${hotel.name} ${hotel.slug} ${hotel.address} ${hotel.cityName ?? ''} ${hotel.ownerName ?? ''}`.toLowerCase()
      if (!haystack.includes(keyword)) return false
    }
    return true
  })

  const totalElements = filtered.length
  const totalPages = Math.max(1, Math.ceil(totalElements / size))
  const start = page * size
  const content = filtered.slice(start, start + size)

  return {
    content,
    page,
    size,
    totalElements,
    totalPages,
    first: page <= 0,
    last: page >= totalPages - 1,
  }
}

export async function getMockManagementHotelDetail(
  hotelId: string,
): Promise<ManagementHotelDetail> {
  const found = mockHotelsStore.find((item) => item.id === hotelId)
  if (!found) {
    return mockHotelsStore[0]
  }
  return found
}

export async function createMockAdminHotel(
  payload: CreateAdminHotelFormValues,
): Promise<ManagementHotelDetail> {
  const city = MOCK_CITIES.find((item) => item.id === payload.cityId)
  const now = new Date().toISOString()
  const newHotelId = `33333333-3333-4333-8333-${String(Date.now()).slice(-12).padStart(12, '0')}`
  const defaultRoomTypeId = `44444444-4444-4444-8444-${String(Date.now()).slice(-12).padStart(12, '0')}`

  const created: ManagementHotelDetail = {
    id: newHotelId,
    ownerUserId: payload.ownerUserId,
    ownerName: `Owner (${payload.ownerUserId.slice(0, 8)}...)`,
    cityId: payload.cityId,
    cityName: city?.name ?? 'Việt Nam',
    name: payload.name,
    slug: payload.slug,
    address: payload.address,
    starRating: payload.starRating,
    checkInTime: payload.checkInTime,
    checkOutTime: payload.checkOutTime,
    status: 'DRAFT',
    coverImageUrl:
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=80',
    vibeTags: ['Boutique Art', 'Workation'],
    roomTypeCount: 1,
    description: payload.description ?? null,
    latitude: payload.latitude ?? null,
    longitude: payload.longitude ?? null,
    amenityIds: ['22222222-2222-4222-8222-222222222201'],
    roomTypes: [
      {
        id: defaultRoomTypeId,
        hotelId: newHotelId,
        name: 'Deluxe Signature Room (Mặc định)',
        description: '35m² · Hạng phòng khởi tạo mẫu',
        maxAdults: 2,
        maxChildren: 1,
        isActive: true,
        totalRooms: 5,
      },
    ],
    createdAt: now,
    updatedAt: now,
  }

  mockHotelsStore = [created, ...mockHotelsStore]
  return created
}

export async function updateMockManagementHotel(
  hotelId: string,
  payload: UpdateManagementHotelFormValues,
): Promise<ManagementHotelDetail> {
  const city = MOCK_CITIES.find((item) => item.id === payload.cityId)
  const now = new Date().toISOString()

  let updatedRecord: ManagementHotelDetail | undefined
  mockHotelsStore = mockHotelsStore.map((hotel) => {
    if (hotel.id !== hotelId) return hotel
    updatedRecord = {
      ...hotel,
      name: payload.name,
      cityId: payload.cityId,
      cityName: city?.name ?? hotel.cityName,
      address: payload.address,
      starRating: payload.starRating,
      checkInTime: payload.checkInTime,
      checkOutTime: payload.checkOutTime,
      description: payload.description || null,
      latitude: payload.latitude,
      longitude: payload.longitude,
      status: payload.status,
      updatedAt: now,
    }
    return updatedRecord
  })

  return updatedRecord ?? mockHotelsStore[0]
}

export async function updateMockHotelAmenities(
  hotelId: string,
  amenityIds: string[],
): Promise<string[]> {
  const now = new Date().toISOString()
  mockHotelsStore = mockHotelsStore.map((hotel) =>
    hotel.id === hotelId
      ? { ...hotel, amenityIds: [...amenityIds], updatedAt: now }
      : hotel,
  )
  return amenityIds
}

export async function getMockRoomTypeDailyRates(params: {
  hotelId: string
  roomTypeId: string
  startDate: string
  endDate: string
}): Promise<DailyRoomRate[]> {
  const basePrice = BASE_ROOM_RATES_BY_TYPE[params.roomTypeId] ?? 1800000
  const start = new Date(`${params.startDate}T00:00:00Z`)
  const end = new Date(`${params.endDate}T00:00:00Z`)

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    return []
  }

  const rates: DailyRoomRate[] = []
  const cursor = new Date(start)
  let dayCount = 0

  while (cursor <= end && dayCount < 31) {
    const dayOfWeek = cursor.getUTCDay()
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6
    // Dữ liệu mẫu mô phỏng bảng room_rates lưu sẵn từng đêm từ Backend (FE chỉ đọc và hiển thị)
    const nightAmount = isWeekend ? basePrice + 350000 : basePrice
    rates.push({
      roomTypeId: params.roomTypeId,
      rateDate: cursor.toISOString().slice(0, 10),
      amount: nightAmount,
      currency: 'VND',
    })
    cursor.setUTCDate(cursor.getUTCDate() + 1)
    dayCount += 1
  }

  return rates
}
