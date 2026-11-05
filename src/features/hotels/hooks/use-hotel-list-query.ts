import { useQuery } from '@tanstack/react-query'
import { useDataMode } from '@/shared/lib/data-mode-context'
import { getManagementHotels } from '../api/hotel-management-api'
import { getMockManagementHotels } from '../mocks/hotel-management-mock'
import type { ManagementHotelListQuery } from '../model/hotel'
import { hotelManagementKeys } from './hotel-query-keys'

export function useManagementHotelsQuery(query: ManagementHotelListQuery) {
  const { mode } = useDataMode()
  const effectiveQuery = mode === 'api' ? { page: query.page, size: query.size } : query
  return useQuery({
    queryKey: hotelManagementKeys.list(mode, effectiveQuery),
    queryFn: ({ signal }) =>
      mode === 'mock'
        ? getMockManagementHotels(query)
        : getManagementHotels(effectiveQuery, signal),
    retry: false,
  })
}
