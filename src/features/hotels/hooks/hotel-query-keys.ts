import type { ManagementHotelListQuery } from '../model/hotel'

export const hotelManagementKeys = {
  all: ['hotels'] as const,
  cities: (mode: string) => ['hotels', 'catalog', 'cities', mode] as const,
  amenities: (mode: string) => ['hotels', 'catalog', 'amenities', mode] as const,
  list: (mode: string, query: ManagementHotelListQuery) =>
    ['hotels', 'management-list', mode, query] as const,
  detail: (mode: string, hotelId: string) =>
    ['hotels', 'management-detail', mode, hotelId] as const,
  rates: (
    mode: string,
    params: {
      hotelId: string
      roomTypeId: string
      startDate: string
      endDate: string
    },
  ) => ['hotels', 'room-rates', mode, params] as const,
}
