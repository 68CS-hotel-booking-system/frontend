import { useQuery } from '@tanstack/react-query'
import { useSessionIdentity } from '@/shared/hooks/use-session-identity'
import { getManagementHotels } from '../api/hotel-management-api'
import type { ManagementHotelListQuery } from '../model/hotel'
import { hotelManagementKeys } from './hotel-query-keys'

export function useManagementHotelsQuery(query: ManagementHotelListQuery) {
  const identity = useSessionIdentity()
  const effectiveQuery = { page: query.page, size: query.size }
  return useQuery({ queryKey: hotelManagementKeys.list('api', effectiveQuery, identity), queryFn: ({ signal }) => getManagementHotels(effectiveQuery, signal), retry: false })
}
