import { z } from 'zod'
import { http } from '@/shared/api/http'
import {
  type CreateHotelContractFormValues,
  hotelCommissionContractSchema,
} from '../types/contract'

/**
 * FN01: GET /api/v1/finance/hotels/{hotelId}/contracts — Owner/đại diện xem thỏa thuận được phép.
 */
export function getHotelContracts(hotelId: string, signal?: AbortSignal) {
  return http.request(
    `/finance/hotels/${encodeURIComponent(hotelId)}/contracts`,
    {
      signal,
      schema: z.array(hotelCommissionContractSchema),
    },
  )
}

/**
 * FN02: POST /api/v1/admin/hotels/{hotelId}/contracts — Tạo dự thảo hợp đồng hoa hồng.
 */
export function createHotelContractDraft(
  hotelId: string,
  payload: CreateHotelContractFormValues,
  signal?: AbortSignal,
) {
  return http.request(
    `/admin/hotels/${encodeURIComponent(hotelId)}/contracts`,
    {
      method: 'POST',
      body: payload,
      signal,
      schema: hotelCommissionContractSchema,
    },
  )
}

