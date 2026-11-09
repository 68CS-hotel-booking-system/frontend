import { z } from 'zod'
import { http } from '@/shared/api/http'

export const managementRoomTypeSchema = z.object({
  id: z.string(),
  hotelId: z.string().optional(),
  name: z.string(),
  description: z.string().nullable().optional(),
  maxAdults: z.number().int(),
  maxChildren: z.number().int(),
  maxOccupancy: z.number().int().positive().optional(),
  basePrice: z.number().nonnegative().optional(),
  active: z.boolean(),
})

export type ManagementRoomType = z.infer<typeof managementRoomTypeSchema>

export interface CreateRoomTypePayload {
  name: string
  description?: string
  maxAdults: number
  maxChildren: number
}

/** GET /api/v1/management/hotels/{hotelId}/room-types — HT15 */
export async function getManagementRoomTypes(
  hotelId: string,
  signal?: AbortSignal,
): Promise<ManagementRoomType[]> {
  return http.request(`/management/hotels/${encodeURIComponent(hotelId)}/room-types`, {
    signal,
    schema: z.array(managementRoomTypeSchema),
  })
}

/** POST /api/v1/management/hotels/{hotelId}/room-types — HT16 */
export async function createManagementRoomType(
  hotelId: string,
  payload: CreateRoomTypePayload,
  signal?: AbortSignal,
): Promise<ManagementRoomType> {
  return http.request(`/management/hotels/${encodeURIComponent(hotelId)}/room-types`, {
    method: 'POST',
    body: payload,
    signal,
    schema: managementRoomTypeSchema,
  })
}

export function buildRoomTypeEditPayload(
  original: Pick<ManagementRoomType, 'name' | 'description' | 'maxAdults' | 'maxChildren' | 'active' | 'maxOccupancy' | 'basePrice'>,
  values: Pick<ManagementRoomType, 'name' | 'description' | 'maxAdults' | 'maxChildren' | 'active' | 'maxOccupancy' | 'basePrice'>,
) {
  const payload: import('./room-api').UpdateRoomTypePayload = {}
  if (values.name.trim() !== original.name) payload.name = values.name.trim()
  if ((values.description ?? '') !== (original.description ?? '')) payload.description = values.description ?? ''
  if (values.active !== original.active) payload.active = values.active
  const capacityChanged = values.maxAdults !== original.maxAdults || values.maxChildren !== original.maxChildren
  if (capacityChanged || (values.maxOccupancy != null && values.maxOccupancy !== original.maxOccupancy)) {
    if (!Number.isInteger(values.maxOccupancy) || values.maxOccupancy! < values.maxAdults) {
      throw new Error('Nhập sức chứa tổng tối đa, ít nhất bằng số người lớn. Backend chưa trả sức chứa trong danh sách.')
    }
    payload.maxAdults = values.maxAdults
    payload.maxChildren = values.maxChildren
    payload.maxOccupancy = values.maxOccupancy
  }
  if (values.basePrice != null && values.basePrice !== original.basePrice) payload.basePrice = values.basePrice
  return payload
}
