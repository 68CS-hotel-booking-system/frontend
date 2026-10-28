export type VibeIconKey =
  | 'glamping'
  | 'boutique'
  | 'pool-party'
  | 'pet-friendly'
  | 'workation'
  | 'beachfront'
  | 'eco-retreat'
  | 'rooftop'

export interface VibeCategoryItem {
  id: string
  label: string
  subLabel: string
  icon: VibeIconKey
  count: number
}

export interface BentoDestinationItem {
  id: string
  cityName: string
  tagline: string
  description: string
  accommodationCount: number
  badgeText: string
  spanClass: 'featured' | 'wide' | 'square'
  imageUrl: string
  highlightVibe: string
}

export interface StayVibeHotelItem {
  id: string
  name: string
  slug: string
  cityId: string
  cityName: string
  distanceLabel: string
  rating: number
  reviewCount: number
  vibeIds: VibeIconKey[]
  badge?: {
    text: string
    variant: 'discount' | 'trend'
  }
  amenities: [string, string, string]
  originalPricePerNight?: number
  pricePerNight: number
  currency: 'VND'
  taxStatusNote: string
  roomsLeftNote?: string
  images: string[]
}

export interface FooterLinkGroup {
  id: string
  title: string
  links: Array<{
    label: string
    href: string
    badge?: string
  }>
}

/**
 * Dữ liệu mẫu (Mock Data) phục vụ dựng khung giao diện (UI Skeleton) theo design.md.
 * Lưu ý: Đây là dữ liệu tĩnh hiển thị mẫu ở tầng UI, chưa tích hợp endpoint tìm kiếm thật của Backend.
 */
export const VIBE_CATEGORIES: VibeCategoryItem[] = [
  {
    id: 'glamping',
    label: 'Glamping',
    subLabel: 'Săn mây & rừng thông',
    icon: 'glamping',
    count: 64,
  },
  {
    id: 'boutique',
    label: 'Boutique Art',
    subLabel: 'Không gian nghệ thuật',
    icon: 'boutique',
    count: 92,
  },
  {
    id: 'pool-party',
    label: 'Pool Party',
    subLabel: 'Hồ bơi vô cực & chill',
    icon: 'pool-party',
    count: 48,
  },
  {
    id: 'pet-friendly',
    label: 'Pet-friendly',
    subLabel: 'Chào đón thú cưng',
    icon: 'pet-friendly',
    count: 37,
  },
  {
    id: 'workation',
    label: 'Workation',
    subLabel: 'Wi-Fi tốc độ cao & bàn làm việc',
    icon: 'workation',
    count: 85,
  },
  {
    id: 'beachfront',
    label: 'Sát biển',
    subLabel: 'Bước chân chạm cát',
    icon: 'beachfront',
    count: 110,
  },
  {
    id: 'eco-retreat',
    label: 'Eco Retreat',
    subLabel: 'Chữa lành giữa thiên nhiên',
    icon: 'eco-retreat',
    count: 53,
  },
  {
    id: 'rooftop',
    label: 'Rooftop Chill',
    subLabel: 'Ngắm trọn skyline đêm',
    icon: 'rooftop',
    count: 41,
  },
]

export const BENTO_DESTINATIONS: BentoDestinationItem[] = [
  {
    id: 'da-lat',
    cityName: 'Đà Lạt',
    tagline: 'Featured Vibe · Săn mây & Glamping giữa rừng thông',
    description:
      'Những khu lều glamping sưởi ấm dưới tán thông và villa gỗ view thung lũng sương mù dành riêng cho hội bạn thân.',
    accommodationCount: 340,
    badgeText: 'Featured Vibe',
    spanClass: 'featured',
    imageUrl:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    highlightVibe: 'Glamping & Chill',
  },
  {
    id: 'ha-noi',
    cityName: 'Hà Nội',
    tagline: 'Trending City · Boutique Art & Phố cổ',
    description:
      'Trải nghiệm staycation đậm chất điện ảnh giữa lòng phố cổ và hồ Tây lộng gió.',
    accommodationCount: 420,
    badgeText: 'Trending · 420+ chỗ nghỉ',
    spanClass: 'wide',
    imageUrl:
      'https://images.unsplash.com/photo-1555921015-5532091f6026?auto=format&fit=crop&w=1000&q=80',
    highlightVibe: 'Boutique Art',
  },
  {
    id: 'phu-quoc',
    cityName: 'Phú Quốc',
    tagline: 'Hidden Gem · Sunset Pool Villa',
    description: 'Ngắm hoàng hôn rực rỡ từ hồ bơi vô cực sát biển.',
    accommodationCount: 285,
    badgeText: '285+ chỗ nghỉ',
    spanClass: 'square',
    imageUrl:
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80',
    highlightVibe: 'Pool Party',
  },
  {
    id: 'hoi-an',
    cityName: 'Hội An',
    tagline: 'Hidden Gem · Eco Craft & Làng lụa',
    description: 'Nghỉ dưỡng xanh bên sông Thu Bồn và cánh đồng lúa.',
    accommodationCount: 195,
    badgeText: '195+ chỗ nghỉ',
    spanClass: 'square',
    imageUrl:
      'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=80',
    highlightVibe: 'Eco Retreat',
  },
]

export const STAYVIBE_FEATURED_HOTELS: StayVibeHotelItem[] = [
  {
    id: '11111111-1111-4111-8111-111111111101',
    name: 'StayVibe Cloud Pine Glamping & Resort',
    slug: 'stayvibe-cloud-pine-glamping-da-lat',
    cityId: 'da-lat',
    cityName: 'Đà Lạt',
    distanceLabel: 'Đồi Đa Phú · Cách trung tâm 4.2km',
    rating: 4.9,
    reviewCount: 328,
    vibeIds: ['glamping', 'eco-retreat', 'pet-friendly'],
    badge: {
      text: 'Giảm 25%',
      variant: 'discount',
    },
    amenities: ['Lửa trại Acoustic', 'Free ăn sáng', 'Cho phép thú cưng'],
    originalPricePerNight: 1850000,
    pricePerNight: 1390000,
    currency: 'VND',
    taxStatusNote: 'Giá niêm yết từ hệ thống · Đã gồm thuế & phí dịch vụ',
    roomsLeftNote: 'Chỉ còn 2 lều Panorama cuối',
    images: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    id: '22222222-2222-4222-8222-222222222202',
    name: 'Lumina Old Quarter Boutique & Work Hub',
    slug: 'lumina-old-quarter-boutique-ha-noi',
    cityId: 'ha-noi',
    cityName: 'Hà Nội',
    distanceLabel: 'Hoàn Kiếm · Cách Hồ Gươm 350m',
    rating: 4.8,
    reviewCount: 412,
    vibeIds: ['boutique', 'workation', 'rooftop'],
    badge: {
      text: 'Tuyển chọn',
      variant: 'trend',
    },
    amenities: ['Wi-Fi tốc độ cao', 'Rooftop Cocktail Bar', 'Lễ tân 24/7'],
    originalPricePerNight: 1650000,
    pricePerNight: 1290000,
    currency: 'VND',
    taxStatusNote: 'Giá niêm yết từ hệ thống · Miễn phí hủy phòng',
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    id: '33333333-3333-4333-8333-333333333303',
    name: 'Solaris Sunset Beach Club & Pool Villas',
    slug: 'solaris-sunset-beach-club-phu-quoc',
    cityId: 'phu-quoc',
    cityName: 'Phú Quốc',
    distanceLabel: 'Bãi Trường · Sát biển 100m',
    rating: 4.9,
    reviewCount: 519,
    vibeIds: ['pool-party', 'beachfront', 'rooftop'],
    badge: {
      text: 'Giảm 20%',
      variant: 'discount',
    },
    amenities: ['Hồ bơi vô cực', 'DJ Sunset Set', 'Buffet sáng nhiệt đới'],
    originalPricePerNight: 2750000,
    pricePerNight: 2190000,
    currency: 'VND',
    taxStatusNote: 'Giá niêm yết từ hệ thống · Đã gồm thuế & phí dịch vụ',
    roomsLeftNote: 'Còn 3 căn Pool Access',
    images: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    id: '44444444-4444-4444-8444-444444444404',
    name: 'An Nhiên Riverside Eco Retreat & Spa',
    slug: 'an-nhien-riverside-eco-retreat-hoi-an',
    cityId: 'hoi-an',
    cityName: 'Hội An',
    distanceLabel: 'Cẩm Thanh · Bên sông Thu Bồn',
    rating: 4.9,
    reviewCount: 276,
    vibeIds: ['eco-retreat', 'boutique', 'pet-friendly'],
    badge: {
      text: 'Trending',
      variant: 'trend',
    },
    amenities: ['Xe đạp miễn phí', 'Yoga bình minh', 'Hồ bơi muối khoáng'],
    originalPricePerNight: 1550000,
    pricePerNight: 1250000,
    currency: 'VND',
    taxStatusNote: 'Giá niêm yết từ hệ thống · Miễn phí hủy trước 48h',
    images: [
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    id: '55555555-5555-4555-8555-555555555505',
    name: 'Nomad Hub Co-Living & Rooftop Suites',
    slug: 'nomad-hub-co-living-da-lat',
    cityId: 'da-lat',
    cityName: 'Đà Lạt',
    distanceLabel: 'Phường 3 · View thung lũng thông',
    rating: 4.7,
    reviewCount: 194,
    vibeIds: ['workation', 'rooftop', 'glamping'],
    amenities: ['Ghế công thái học', 'Specialty Coffee 24/7', 'Phòng họp Pod'],
    pricePerNight: 890000,
    currency: 'VND',
    taxStatusNote: 'Giá niêm yết từ hệ thống · Ưu đãi lưu trú dài ngày',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    id: '66666666-6666-4666-8666-666666666606',
    name: 'Cyan Coastline Surf & Pool Hideaway',
    slug: 'cyan-coastline-surf-phu-quoc',
    cityId: 'phu-quoc',
    cityName: 'Phú Quốc',
    distanceLabel: 'Ông Lang · Cách biển 80m',
    rating: 4.8,
    reviewCount: 231,
    vibeIds: ['beachfront', 'pool-party', 'pet-friendly'],
    badge: {
      text: 'Tuyển chọn',
      variant: 'trend',
    },
    amenities: ['Chèo SUP miễn phí', 'Bar bên hồ bơi', 'Bữa sáng cả ngày'],
    originalPricePerNight: 1980000,
    pricePerNight: 1590000,
    currency: 'VND',
    taxStatusNote: 'Giá niêm yết từ hệ thống · Đã gồm thuế & phí dịch vụ',
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    id: '77777777-7777-4777-8777-777777777707',
    name: 'Maison De L’Art Indigo Gallery Hotel',
    slug: 'maison-de-lart-indigo-ha-noi',
    cityId: 'ha-noi',
    cityName: 'Hà Nội',
    distanceLabel: 'Tây Hồ · Cách Hồ Tây 120m',
    rating: 4.9,
    reviewCount: 168,
    vibeIds: ['boutique', 'rooftop', 'workation'],
    badge: {
      text: 'Giảm 18%',
      variant: 'discount',
    },
    amenities: ['Triển lãm Art đương đại', 'Bồn tắm Panorama', 'Check-in tự động'],
    originalPricePerNight: 1790000,
    pricePerNight: 1460000,
    currency: 'VND',
    taxStatusNote: 'Giá niêm yết từ hệ thống · Miễn phí hủy phòng',
    images: [
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    id: '88888888-8888-4888-8888-888888888808',
    name: 'Terra Bamboo Sanctuary & Organic Farm',
    slug: 'terra-bamboo-sanctuary-hoi-an',
    cityId: 'hoi-an',
    cityName: 'Hội An',
    distanceLabel: 'An Bàng · Cách biển 300m',
    rating: 4.8,
    reviewCount: 142,
    vibeIds: ['eco-retreat', 'beachfront', 'glamping'],
    amenities: ['Nhà tre thủ công', 'Ẩm thực Farm-to-Table', 'Hồ bơi vô cực'],
    pricePerNight: 1320000,
    currency: 'VND',
    taxStatusNote: 'Giá niêm yết từ hệ thống · Đã gồm thuế & phí dịch vụ',
    roomsLeftNote: 'Chỉ còn 1 Bungalow Tre',
    images: [
      'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=900&q=80',
    ],
  },
]

export const QUICK_LOCATION_SUGGESTIONS: string[] = [
  'Đà Lạt',
  'Hà Nội',
  'Phú Quốc',
  'Hội An',
]

export const STAYVIBE_FOOTER_GROUPS: FooterLinkGroup[] = [
  {
    id: 'discover',
    title: 'Khám phá theo phong cách',
    links: [
      { label: 'Glamping & Săn mây Đà Lạt', href: '#vibe-section', badge: 'Hot' },
      { label: 'Boutique Art Staycation', href: '#vibe-section' },
      { label: 'Pool Party & Beach Club', href: '#vibe-section' },
      { label: 'Workation Wi-Fi tốc độ cao', href: '#vibe-section' },
      { label: 'Chỗ nghỉ thân thiện thú cưng', href: '#vibe-section' },
    ],
  },
  {
    id: 'partner-ops',
    title: 'Dành cho Đối tác & Quản trị',
    links: [
      { label: 'Quản lý khách sạn', href: '/management/hotels' },
      { label: 'Bảng giá phòng theo ngày', href: '/management/rates' },
      { label: 'Hợp đồng hoa hồng', href: '/management/contracts' },
      {
        label: 'Phân quyền tài chính',
        href: '/management/financial-access',
        badge: 'Mới',
      },
    ],
  },
  {
    id: 'transparency',
    title: 'Hỗ trợ & Chính sách',
    links: [
      { label: 'Chính sách hoàn hủy linh hoạt', href: '#hotels-section' },
      { label: 'Giá niêm yết minh bạch', href: '#hotels-section' },
      { label: 'Trạng thái dịch vụ hệ thống', href: '/system-status' },
      { label: 'Đăng nhập tài khoản', href: '/login' },
    ],
  },
]

