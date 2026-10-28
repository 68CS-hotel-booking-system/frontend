import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useDataMode } from '@/shared/lib/data-mode-context'
import { getAmenities, getCities } from '../api/catalog-api'
import {
  createAdminHotel,
  getManagementHotelDetail,
  getManagementHotels,
  getRoomTypeDailyRates,
  updateHotelAmenities,
  updateManagementHotel,
} from '../api/hotel-management-api'
import {
  createMockAdminHotel,
  getMockAmenities,
  getMockCities,
  getMockManagementHotelDetail,
  getMockManagementHotels,
  getMockRoomTypeDailyRates,
  updateMockHotelAmenities,
  updateMockManagementHotel,
} from '../api/hotel-management-mock'
import type {
  CreateAdminHotelFormValues,
  ManagementHotelListQuery,
  UpdateHotelAmenitiesFormValues,
  UpdateManagementHotelFormValues,
} from '../types/hotel-management'

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

/** HT01: Danh mục thành phố dùng chung */
export function useCitiesQuery() {
  const { mode } = useDataMode()
  return useQuery({
    queryKey: hotelManagementKeys.cities(mode),
    queryFn: ({ signal }) => (mode === 'mock' ? getMockCities() : getCities(signal)),
    retry: false,
  })
}

/** HT02: Danh mục tiện ích dùng chung */
export function useAmenitiesQuery() {
  const { mode } = useDataMode()
  return useQuery({
    queryKey: hotelManagementKeys.amenities(mode),
    queryFn: ({ signal }) =>
      mode === 'mock' ? getMockAmenities() : getAmenities(signal),
    retry: false,
  })
}

/** HT07: Danh sách khách sạn được phép vận hành */
export function useManagementHotelsQuery(query: ManagementHotelListQuery) {
  const { mode } = useDataMode()
  return useQuery({
    queryKey: hotelManagementKeys.list(mode, query),
    queryFn: ({ signal }) =>
      mode === 'mock'
        ? getMockManagementHotels(query)
        : getManagementHotels(query, signal),
    retry: false,
  })
}

/** HT08: Chi tiết quản lý khách sạn */
export function useManagementHotelDetailQuery(hotelId: string) {
  const { mode } = useDataMode()
  return useQuery({
    queryKey: hotelManagementKeys.detail(mode, hotelId),
    queryFn: ({ signal }) =>
      mode === 'mock'
        ? getMockManagementHotelDetail(hotelId)
        : getManagementHotelDetail(hotelId, signal),
    enabled: Boolean(hotelId),
    retry: false,
  })
}

/** HT06: Tạo khách sạn mới và phân công Owner */
export function useCreateAdminHotelMutation() {
  const { mode } = useDataMode()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateAdminHotelFormValues) =>
      mode === 'mock' ? createMockAdminHotel(payload) : createAdminHotel(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: hotelManagementKeys.all })
    },
  })
}

/** HT09: Sửa nội dung khách sạn */
export function useUpdateManagementHotelMutation(hotelId: string) {
  const { mode } = useDataMode()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateManagementHotelFormValues) =>
      mode === 'mock'
        ? updateMockManagementHotel(hotelId, payload)
        : updateManagementHotel(hotelId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: hotelManagementKeys.all })
    },
  })
}

/** HT14: Gắn danh sách tiện ích cho khách sạn */
export function useUpdateHotelAmenitiesMutation(hotelId: string) {
  const { mode } = useDataMode()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateHotelAmenitiesFormValues) =>
      mode === 'mock'
        ? updateMockHotelAmenities(hotelId, payload.amenityIds)
        : updateHotelAmenities(hotelId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: hotelManagementKeys.detail(mode, hotelId),
      })
    },
  })
}

/** PR01: Xem giá theo ngày của hạng phòng */
export function useRoomTypeDailyRatesQuery(params: {
  hotelId: string
  roomTypeId: string
  startDate: string
  endDate: string
}) {
  const { mode } = useDataMode()
  return useQuery({
    queryKey: hotelManagementKeys.rates(mode, params),
    queryFn: ({ signal }) =>
      mode === 'mock'
        ? getMockRoomTypeDailyRates(params)
        : getRoomTypeDailyRates(params, signal),
    enabled: Boolean(
      params.hotelId && params.roomTypeId && params.startDate && params.endDate,
    ),
    retry: false,
  })
}
