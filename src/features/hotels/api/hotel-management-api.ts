import { z } from 'zod'
import { http } from '@/shared/api/http'
import {
  type CreateAdminHotelFormValues,
  dailyRoomRateSchema,
  managementHotelDetailSchema,
  type ManagementHotelListQuery,
  managementHotelPageSchema,
  type UpdateHotelAmenitiesFormValues,
  type UpdateManagementHotelFormValues,
} from '../types/hotel-management'

/**
 * HT07: GET /api/v1/management/hotels — Danh sách khách sạn được phép vận hành (phân trang bắt đầu từ 0).
 */
export function getManagementHotels(
  query: ManagementHotelListQuery = {},
  signal?: AbortSignal,
) {
  const params = new URLSearchParams()
  params.set('page', String(query.page ?? 0))
  params.set('size', String(query.size ?? 6))
  if (query.cityId) params.set('cityId', query.cityId)
  if (query.status && query.status !== 'ALL') params.set('status', query.status)
  if (query.keyword?.trim()) params.set('keyword', query.keyword.trim())

  return http.request(`/management/hotels?${params.toString()}`, {
    signal,
    schema: managementHotelPageSchema,
  })
}

/**
 * HT06: POST /api/v1/admin/hotels — Tạo khách sạn mới và phân công Owner.
 */
export function createAdminHotel(
  payload: CreateAdminHotelFormValues,
  signal?: AbortSignal,
) {
  return http.request('/admin/hotels', {
    method: 'POST',
    body: payload,
    signal,
    schema: managementHotelDetailSchema,
  })
}

/**
 * HT08: GET /api/v1/management/hotels/{hotelId} — Thông tin quản lý chi tiết khách sạn.
 */
export function getManagementHotelDetail(hotelId: string, signal?: AbortSignal) {
  return http.request(`/management/hotels/${encodeURIComponent(hotelId)}`, {
    signal,
    schema: managementHotelDetailSchema,
  })
}

/**
 * HT09: PATCH /api/v1/management/hotels/{hotelId} — Sửa nội dung khách sạn.
 */
export function updateManagementHotel(
  hotelId: string,
  payload: UpdateManagementHotelFormValues,
  signal?: AbortSignal,
) {
  return http.request(`/management/hotels/${encodeURIComponent(hotelId)}`, {
    method: 'PATCH',
    body: payload,
    signal,
    schema: managementHotelDetailSchema,
  })
}

/**
 * HT14: PUT /api/v1/management/hotels/{hotelId}/amenities — Gắn tiện ích khách sạn.
 */
export function updateHotelAmenities(
  hotelId: string,
  payload: UpdateHotelAmenitiesFormValues,
  signal?: AbortSignal,
) {
  return http.request(
    `/management/hotels/${encodeURIComponent(hotelId)}/amenities`,
    {
      method: 'PUT',
      body: payload,
      signal,
      schema: z.array(z.string()),
    },
  )
}

/**
 * PR01: GET /api/v1/management/hotels/{hotelId}/room-types/{roomTypeId}/rates — Xem giá theo ngày.
 */
export function getRoomTypeDailyRates(
  params: {
    hotelId: string
    roomTypeId: string
    startDate: string
    endDate: string
  },
  signal?: AbortSignal,
) {
  const search = new URLSearchParams({
    startDate: params.startDate,
    endDate: params.endDate,
  })
  return http.request(
    `/management/hotels/${encodeURIComponent(params.hotelId)}/room-types/${encodeURIComponent(params.roomTypeId)}/rates?${search.toString()}`,
    {
      signal,
      schema: z.array(dailyRoomRateSchema),
    },
  )
}

