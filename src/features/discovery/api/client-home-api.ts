import type { ClientDestination, ClientStay } from '../model/client-home'
import { CLIENT_HOME_DESTINATIONS } from '../mocks/client-home-data'
import { getCities } from '@/features/hotels'
import { resolveCover, searchHotels, type SearchHotel } from './search-api'

export async function fetchClientStays(signal?: AbortSignal): Promise<ClientStay[]> {
  const page = await searchHotels({ page: 0, size: 20 }, signal)
  return Promise.all(page.content.map(async (hotel) => toClientStay(hotel, await resolveCover(hotel.coverImage?.mediaId, signal))))
}
export function toClientStay(hotel: SearchHotel, image: string): ClientStay {
  return {
    id: hotel.id, name: hotel.name, city: hotel.city.name, region: hotel.city.name, location: hotel.address,
    type: 'Khách sạn', rating: 0, reviews: 0, price: hotel.minNightlyPrice ?? 0, oldPrice: 0,
    badge: 'Đang mở bán', badgeClass: 'dark' as const, note: 'Kiểm tra giá và phòng trống theo ngày lưu trú',
    amenities: hotel.amenities.map((item) => item.name), vibes: ['all' as const],
    image, desc: '', source: 'api' as const, starRating: hotel.starRating,
  }
}
export async function fetchClientDestinations(signal?: AbortSignal): Promise<ClientDestination[]> {
  const cities = await getCities(signal)
  return cities.map((city) => {
    const editorial = CLIENT_HOME_DESTINATIONS.find((item) => item.city === city.name)
    return { id: city.id, city: city.name, kicker: city.countryCode, image: editorial?.image ?? '/assets/client/experience.jpg',
      tag: 'Điểm đến', count: 'Khám phá lưu trú', desc: editorial?.desc ?? `Tìm chỗ nghỉ đang mở bán tại ${city.name}.`, ctaText: `Khám phá ${city.name}` }
  })
}
