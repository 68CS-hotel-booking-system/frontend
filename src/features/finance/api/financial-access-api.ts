import { http } from '@/shared/api/http'
import {
  financialAccessGrantSchema,
  type UpdateFinancialAccessFormValues,
} from '../types/financial-access'

/**
 * FN16: GET /api/v1/admin/hotels/{hotelId}/financial-access/{userId}
 * Đọc cấp quyền tài chính và phiên bản trước sửa.
 */
export function getFinancialAccess(
  params: { hotelId: string; userId: string },
  signal?: AbortSignal,
) {
  return http.request(
    `/admin/hotels/${encodeURIComponent(params.hotelId)}/financial-access/${encodeURIComponent(params.userId)}`,
    {
      signal,
      schema: financialAccessGrantSchema,
    },
  )
}

/**
 * FN00: PUT /api/v1/admin/hotels/{hotelId}/financial-access/{userId}
 * Cấp/thu hồi quyền đọc tài chính theo thỏa thuận (kèm kiểm tra phiên bản expectedVersion).
 */
export function updateFinancialAccess(
  params: { hotelId: string; userId: string },
  payload: UpdateFinancialAccessFormValues,
  signal?: AbortSignal,
) {
  return http.request(
    `/admin/hotels/${encodeURIComponent(params.hotelId)}/financial-access/${encodeURIComponent(params.userId)}`,
    {
      method: 'PUT',
      body: payload,
      signal,
      schema: financialAccessGrantSchema,
    },
  )
}

