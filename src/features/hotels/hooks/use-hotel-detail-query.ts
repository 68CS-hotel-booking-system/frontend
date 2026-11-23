import { useQuery } from '@tanstack/react-query'
import { useSessionIdentity } from '@/shared/hooks/use-session-identity'
import { getManagementHotelDetail } from '../api/hotel-management-api'
import { hotelManagementKeys } from './hotel-query-keys'

export function useManagementHotelDetailQuery(hotelId: string) {
  const identity = useSessionIdentity()
  return useQuery({ queryKey: hotelManagementKeys.detail('api', hotelId, identity), queryFn: ({ signal }) => getManagementHotelDetail(hotelId, signal), enabled: Boolean(hotelId), retry: false })
}
