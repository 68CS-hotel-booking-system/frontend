import type {
  AmenityItem,
  CityItem,
  CreateAdminHotelFormValues,
  DailyRoomRate,
  ManagementHotelDetail,
  ManagementHotelListQuery,
  ManagementHotelPage,
  UpdateManagementHotelFormValues,
} from '../types/hotel-management'

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
  {
    id: '11111111-1111-4111-8111-111111111102',
    countryCode: 'VN',
    name: 'Đà Lạt',
    slug: 'da-lat',
  },
  {
    id: '11111111-1111-4111-8111-111111111103',
    countryCode: 'VN',
    name: 'Phú Quốc',
    slug: 'phu-quoc',
  },
  {
    id: '11111111-1111-4111-8111-111111111104',
    countryCode: 'VN',
    name: 'Đà Nẵng',
    slug: 'da-nang',
  },
  {
    id: '11111111-1111-4111-8111-111111111105',
    countryCode: 'VN',
    name: 'Hội An',
    slug: 'hoi-an',
  },
  {
    id: '11111111-1111-4111-8111-111111111106',
    countryCode: 'VN',
    name: 'TP. Hồ Chí Minh',
    slug: 'tp-ho-chi-minh',
  },
]

export const MOCK_AMENITIES: AmenityItem[] = [
  {
    id: '22222222-2222-4222-8222-222222222201',
    code: 'INFINITY_POOL',
    name: 'Hồ bơi vô cực (Infinity Pool)',
    category: 'HOTEL',
  },
  {
    id: '22222222-2222-4222-8222-222222222202',
    code: 'SUNSET_ROOFTOP_BAR',
    name: 'Sunset & Rooftop Bar',
    category: 'HOTEL',
  },
  {
    id: '22222222-2222-4222-8222-222222222203',
    code: 'COWORKING_HUB',
    name: 'Không gian Workation & Wi-Fi 6 tốc độ cao',
    category: 'HOTEL',
  },
  {
    id: '22222222-2222-4222-8222-222222222204',
    code: 'PET_FRIENDLY',
    name: 'Thân thiện thú cưng (Pet-friendly)',
    category: 'HOTEL',
  },
  {
    id: '22222222-2222-4222-8222-222222222205',
    code: 'SPA_WELLNESS',
    name: 'Spa, Xông hơi & Yoga Studio',
    category: 'HOTEL',
  },
  {
    id: '22222222-2222-4222-8222-222222222206',
    code: 'AIRPORT_SHUTTLE',
    name: 'Xe đưa đón sân bay 24/7',
    category: 'HOTEL',
  },
  {
    id: '22222222-2222-4222-8222-222222222207',
    code: 'GLAMPING_CAMPFIRE',
    name: 'Bếp nướng BBQ & Lửa trại Acoustic',
    category: 'HOTEL',
  },
  {
    id: '22222222-2222-4222-8222-222222222208',
    code: 'PANORAMA_BALCONY',
    name: 'Ban công Panorama săn mây / ngắm hồ',
    category: 'ROOM',
  },
  {
    id: '22222222-2222-4222-8222-222222222209',
    code: 'SMART_TV_NETFLIX',
    name: 'Smart TV 4K & Máy chiếu Cinema mini',
    category: 'ROOM',
  },
  {
    id: '22222222-2222-4222-8222-222222222210',
    code: 'ESPRESSO_BAR',
    name: 'Máy pha cà phê Espresso & Minibar thực dưỡng',
    category: 'ROOM',
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
    roomTypeCount: 3,
    description:
      'Biểu tượng nghỉ dưỡng 5 sao sang trọng bậc nhất thủ đô, nổi bật với các biệt thự pavilion tọa lạc ngay trên mặt nước phẳng lặng của Hồ Tây thanh bình cùng quầy Sunset Bar trứ danh.',
    latitude: 21.0583,
    longitude: 105.8306,
    amenityIds: [
      '22222222-2222-4222-8222-222222222201',
      '22222222-2222-4222-8222-222222222202',
      '22222222-2222-4222-8222-222222222205',
      '22222222-2222-4222-8222-222222222206',
      '22222222-2222-4222-8222-222222222208',
      '22222222-2222-4222-8222-222222222210',
    ],
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
      {
        id: '44444444-4444-4444-8444-444444444402',
        hotelId: '33333333-3333-4333-8333-333333333301',
        name: 'Deluxe Overwater Pavilion (Biệt thự nổi mặt hồ)',
        description: '32m² · 1 King Bed · Nằm trên dãy biệt thự nổi mặt nước yên tĩnh',
        maxAdults: 2,
        maxChildren: 1,
        isActive: true,
        totalRooms: 8,
      },
      {
        id: '44444444-4444-4444-8444-444444444403',
        hotelId: '33333333-3333-4333-8333-333333333301',
        name: 'Premier Twin Pavilion (2 Giường Twin 5 Sao)',
        description: '38m² · 2 Giường Twin · Cửa sổ panorama đón ánh sáng mặt hồ',
        maxAdults: 3,
        maxChildren: 1,
        isActive: true,
        totalRooms: 6,
      },
    ],
    createdAt: '2026-09-10T08:00:00Z',
    updatedAt: '2026-10-27T14:20:00Z',
  },
  {
    id: '33333333-3333-4333-8333-333333333302',
    ownerUserId: '99999999-9999-4999-8999-999999999902',
    ownerName: 'Lê Hoàng Thảo Vy (CloudPine Host)',
    cityId: '11111111-1111-4111-8111-111111111102',
    cityName: 'Đà Lạt',
    name: 'StayVibe CloudPine Glamping & Retreat Đà Lạt',
    slug: 'stayvibe-cloudpine-glamping-retreat-da-lat',
    address: 'Đồi Đa Phú, Phường 7, TP. Đà Lạt, Lâm Đồng',
    starRating: 4,
    checkInTime: '15:00',
    checkOutTime: '11:30',
    status: 'ACTIVE',
    coverImageUrl:
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1000&q=80',
    vibeTags: ['Glamping', 'Pet-friendly', 'Eco Retreat'],
    roomTypeCount: 2,
    description:
      'Khu nghỉ dưỡng Glamping săn mây chuẩn Gen Z giữa rừng thông nguyên sinh Đà Lạt, tích hợp lều Dome kính sưởi ấm, đêm nhạc Acoustic lửa trại và khu vực thân thiện với thú cưng.',
    latitude: 11.9765,
    longitude: 108.4319,
    amenityIds: [
      '22222222-2222-4222-8222-222222222203',
      '22222222-2222-4222-8222-222222222204',
      '22222222-2222-4222-8222-222222222207',
      '22222222-2222-4222-8222-222222222208',
      '22222222-2222-4222-8222-222222222209',
    ],
    roomTypes: [
      {
        id: '44444444-4444-4444-8444-444444444404',
        hotelId: '33333333-3333-4333-8333-333333333302',
        name: 'Aurora Panorama Geodesic Dome',
        description: '36m² · Lều vòm kính săn mây · Máy chiếu Cinema + Bồn tắm gỗ thông',
        maxAdults: 2,
        maxChildren: 1,
        isActive: true,
        totalRooms: 10,
      },
      {
        id: '44444444-4444-4444-8444-444444444405',
        hotelId: '33333333-3333-4333-8333-333333333302',
        name: 'Pine Forest Wooden Bungalow (2 Phòng ngủ)',
        description: '55m² · Sân BBQ riêng · Cho phép mang thú cưng',
        maxAdults: 4,
        maxChildren: 2,
        isActive: true,
        totalRooms: 5,
      },
    ],
    createdAt: '2026-09-18T10:15:00Z',
    updatedAt: '2026-10-28T09:10:00Z',
  },
  {
    id: '33333333-3333-4333-8333-333333333303',
    ownerUserId: '99999999-9999-4999-8999-999999999903',
    ownerName: 'Trần Quốc Bảo (Solis Hospitality)',
    cityId: '11111111-1111-4111-8111-111111111103',
    cityName: 'Phú Quốc',
    name: 'CyberCoral Beachfront Club & Resort Phú Quốc',
    slug: 'cybercoral-beachfront-club-resort-phu-quoc',
    address: 'Bãi Trường, Xã Dương Tơ, TP. Phú Quốc, Kiên Giang',
    starRating: 5,
    checkInTime: '14:00',
    checkOutTime: '12:00',
    status: 'PENDING_APPROVAL',
    coverImageUrl:
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1000&q=80',
    vibeTags: ['Pool Party', 'Sát biển', 'Workation'],
    roomTypeCount: 2,
    description:
      'Tổ hợp resort sát biển kết hợp Beach Club sôi động và Co-working Hub hướng biển dành cho Digital Nomads & Millennials.',
    latitude: 10.1452,
    longitude: 103.9684,
    amenityIds: [
      '22222222-2222-4222-8222-222222222201',
      '22222222-2222-4222-8222-222222222202',
      '22222222-2222-4222-8222-222222222203',
      '22222222-2222-4222-8222-222222222206',
    ],
    roomTypes: [
      {
        id: '44444444-4444-4444-8444-444444444406',
        hotelId: '33333333-3333-4333-8333-333333333303',
        name: 'Sunset Ocean Pool Villa',
        description: '75m² · Hồ bơi vô cực riêng · Lối đi thẳng ra biển Bãi Trường',
        maxAdults: 2,
        maxChildren: 2,
        isActive: true,
        totalRooms: 6,
      },
      {
        id: '44444444-4444-4444-8444-444444444407',
        hotelId: '33333333-3333-4333-8333-333333333303',
        name: 'Workation Studio Sea View',
        description: '40m² · Bàn làm việc công thái học + Màn hình rời 27 inch',
        maxAdults: 2,
        maxChildren: 0,
        isActive: true,
        totalRooms: 15,
      },
    ],
    createdAt: '2026-10-02T11:30:00Z',
    updatedAt: '2026-10-26T16:45:00Z',
  },
  {
    id: '33333333-3333-4333-8333-333333333304',
    ownerUserId: '99999999-9999-4999-8999-999999999904',
    ownerName: 'Phạm Gia Hân (Indigo Collective)',
    cityId: '11111111-1111-4111-8111-111111111105',
    cityName: 'Hội An',
    name: 'Anantara Craft & Lantern Boutique Hội An',
    slug: 'anantara-craft-lantern-boutique-hoi-an',
    address: '128 Nguyễn Phúc Chu, Phường Minh An, TP. Hội An, Quảng Nam',
    starRating: 4,
    checkInTime: '14:00',
    checkOutTime: '12:00',
    status: 'DRAFT',
    coverImageUrl:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80',
    vibeTags: ['Boutique Art', 'Eco Retreat'],
    roomTypeCount: 1,
    description:
      'Khách sạn boutique lấy cảm hứng từ làng nghề lồng đèn truyền thống kết hợp kiến trúc đương đại ven sông Hoài.',
    latitude: 15.8771,
    longitude: 108.3262,
    amenityIds: [
      '22222222-2222-4222-8222-222222222201',
      '22222222-2222-4222-8222-222222222205',
      '22222222-2222-4222-8222-222222222210',
    ],
    roomTypes: [
      {
        id: '44444444-4444-4444-8444-444444444408',
        hotelId: '33333333-3333-4333-8333-333333333304',
        name: 'Heritage Riverfront Loft',
        description: '42m² · Ban công nhìn thẳng sông Hoài · Nội thất thủ công',
        maxAdults: 2,
        maxChildren: 1,
        isActive: true,
        totalRooms: 8,
      },
    ],
    createdAt: '2026-10-15T09:00:00Z',
    updatedAt: '2026-10-25T11:20:00Z',
  },
]

const BASE_ROOM_RATES_BY_TYPE: Record<string, number> = {
  '44444444-4444-4444-8444-444444444401': 3200000,
  '44444444-4444-4444-8444-444444444402': 1850000,
  '44444444-4444-4444-8444-444444444403': 2300000,
  '44444444-4444-4444-8444-444444444404': 1650000,
  '44444444-4444-4444-8444-444444444405': 2450000,
  '44444444-4444-4444-8444-444444444406': 4100000,
  '44444444-4444-4444-8444-444444444407': 1950000,
  '44444444-4444-4444-8444-444444444408': 1590000,
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
    amenityIds: ['22222222-2222-4222-8222-222222222203'],
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

