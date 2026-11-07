import type { ClientDestination, ClientStay } from '../model/client-home'
import { CLIENT_HOME_DESTINATIONS, CLIENT_HOME_HOTELS } from '../mocks/client-home-data'

/**
 * Ghi chú kiến trúc tích hợp Backend:
 * - Hiện tại Backend StayHub chỉ mới cung cấp endpoint quản lý: /api/v1/management/hotels (yêu cầu quyền quản lý).
 * - Chưa có endpoint công khai (Public Catalog / Search API) cho khách du lịch vãng lai tìm kiếm theo ngày, điểm đến và phong cách nghỉ dưỡng.
 * - Khi Backend bổ sung endpoint công khai (ví dụ: GET /api/v1/public/hotels/search), thay thế logic bên dưới bằng:
 *   return http.request('/public/hotels/search', { signal, schema: ... })
 *   và ánh xạ response sang ClientStay model.
 */

export async function fetchClientStays(signal?: AbortSignal): Promise<ClientStay[]> {
  if (signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError')
  }

  // Giả lập độ trễ mạng nhẹ (không giả mạo HTTP call) để TanStack Query kích hoạt trạng thái loading chuẩn chỉ
  await new Promise((resolve) => setTimeout(resolve, 80))

  return [...CLIENT_HOME_HOTELS]
}

export async function fetchClientDestinations(signal?: AbortSignal): Promise<ClientDestination[]> {
  if (signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError')
  }

  await new Promise((resolve) => setTimeout(resolve, 60))

  return [...CLIENT_HOME_DESTINATIONS]
}
