import { useQuery } from '@tanstack/react-query'
import { useDataMode } from '@/shared/lib/data-mode-context'
import { getRoomTypeDailyRates } from '../api/hotel-management-api'
import { getMockRoomTypeDailyRates } from '../mocks/hotel-management-mock'
import { hotelManagementKeys } from './hotel-query-keys'

export function useRoomTypeDailyRatesQuery(params: {
  hotelId: string
  roomTypeId: string
  startDate: string
  endDate: string
}) {
  const { mode } = useDataMode()
  return useQuery({
    queryKey: hotelManagementKeys.rates(mode, params),
    queryFn: ({ signal }) =>
      mode === 'mock'
        ? getMockRoomTypeDailyRates(params)
        : getRoomTypeDailyRates(params, signal),
    enabled: Boolean(
      params.hotelId && params.roomTypeId && params.startDate && params.endDate,
    ),
    retry: false,
  })
}
