import { useQuery } from '@tanstack/react-query'
import { useDataMode } from '@/shared/lib/data-mode-context'
import { getManagementHotelDetail } from '../api/hotel-management-api'
import { getMockManagementHotelDetail } from '../mocks/hotel-management-mock'
import { hotelManagementKeys } from './hotel-query-keys'

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
