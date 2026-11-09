import { ApiError } from '@/shared/api/api-error'
import { http } from '@/shared/api/http'
import { unsupportedApi } from '@/shared/api/unsupported-api'
import type { CreateAdminHotelFormValues, UpdateHotelAmenitiesFormValues, UpdateManagementHotelFormValues } from '../model/hotel-form-schemas'
import type { ManagementHotelDetail, ManagementHotelListQuery, ManagementHotelPage } from '../model/hotel'
import { managementHotelPageResponseSchema, managementHotelResponseSchema, toManagementHotel } from './hotel-contract'

/** GET /api/v1/management/hotels — BE currently supports pagination only. */
export async function getManagementHotels(
  query: ManagementHotelListQuery = {},
  signal?: AbortSignal,
): Promise<ManagementHotelPage> {
  const params = new URLSearchParams({
    page: String(query.page ?? 0),
    size: String(query.size ?? 6),
  })
  const page = await http.request(`/management/hotels?${params}`, {
    signal,
    schema: managementHotelPageResponseSchema,
  })
  return { ...page, content: page.content.map(toManagementHotel) }
}

/** POST /api/v1/management/hotels — ownerId may be omitted for self-creation. */
export async function createAdminHotel(
  payload: CreateAdminHotelFormValues,
  signal?: AbortSignal,
): Promise<ManagementHotelDetail> {
  try {
    const hotel = await http.request('/management/hotels', {
      method: 'POST',
      body: {
        ownerId: payload.ownerUserId ? payload.ownerUserId : undefined,
        cityId: payload.cityId,
        name: payload.name,
        description: payload.description,
        address: payload.address,
        latitude: payload.latitude,
        longitude: payload.longitude,
        starRating: payload.starRating,
        checkInTime: payload.checkInTime,
        checkOutTime: payload.checkOutTime,
      },
      signal,
      schema: managementHotelResponseSchema,
    })
    return toManagementHotel(hotel)
  } catch (error) {
    if (error instanceof ApiError && error.errors.some((item) => item.field === 'ownerId')) {
      throw new ApiError(error.message, {
        kind: error.kind, status: error.status, code: error.code, traceId: error.traceId,
        errors: error.errors.map((item) => ({
          ...item, field: item.field === 'ownerId' ? 'ownerUserId' : item.field,
        })),
      })
    }
    throw error
  }
}

/** GET /api/v1/management/hotels/{hotelId}. */
export async function getManagementHotelDetail(
  hotelId: string,
  signal?: AbortSignal,
): Promise<ManagementHotelDetail> {
  const hotel = await http.request(`/management/hotels/${encodeURIComponent(hotelId)}`, {
    signal,
    schema: managementHotelResponseSchema,
  })
  return toManagementHotel(hotel)
}

/** PATCH /api/v1/management/hotels/{hotelId}/approve — Admin duyệt khách sạn */
export async function approveHotel(
  hotelId: string,
  signal?: AbortSignal,
): Promise<ManagementHotelDetail> {
  const hotel = await http.request(`/management/hotels/${encodeURIComponent(hotelId)}/approve`, {
    method: 'PATCH',
    signal,
    schema: managementHotelResponseSchema,
  })
  return toManagementHotel(hotel)
}

// Preserve callers and mock previews without inventing unimplemented endpoints.
export const updateManagementHotel: (
  hotelId: string,
  payload: UpdateManagementHotelFormValues,
  signal?: AbortSignal,
) => Promise<ManagementHotelDetail> = () => unsupportedApi('cập nhật hồ sơ khách sạn')

export const updateHotelAmenities: (
  hotelId: string,
  payload: UpdateHotelAmenitiesFormValues,
  signal?: AbortSignal,
) => Promise<string[]> = () => unsupportedApi('cập nhật tiện ích khách sạn')

export { getRoomTypeDailyRates, setRoomTypeDailyRates } from './room-rates-api'
