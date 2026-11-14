import { useQueries } from '@tanstack/react-query'
import { getRoomTypeAmenities } from '../api/scoped-amenities-api'
import { hotelManagementKeys } from './hotel-query-keys'
/** The current API has no aggregate counts: one cached read per type is required. */
export function useAmenityCounts(hotelId: string, typeIds: string[]) {
  return useQueries({ queries: typeIds.map(id => ({ queryKey: hotelManagementKeys.roomTypeAmenities(hotelId, id), queryFn: ({ signal }: { signal: AbortSignal }) => getRoomTypeAmenities(hotelId, id, signal), staleTime: 60000, retry: false })) })
}
