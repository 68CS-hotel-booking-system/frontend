import { useQuery } from '@tanstack/react-query'
import { useDataMode } from '@/shared/lib/data-mode-context'
import { getRoomTypeDailyRates } from '../api/hotel-management-api'
import { getMockRoomTypeDailyRates } from '../mocks/hotel-management-mock'
import { hotelManagementKeys } from './hotel-query-keys'
import { roomRatesRangeSchema } from '../model/room-rates'

export function useRoomTypeDailyRatesQuery(params: {
  hotelId: string
  roomTypeId: string
  startDate: string
  endDate: string
}, enabled = true) {
  const { mode } = useDataMode()
  return useQuery({
    queryKey: hotelManagementKeys.rates(mode, params),
    queryFn: ({ signal }) =>
      mode === 'mock'
        ? getMockRoomTypeDailyRates(params)
        : getRoomTypeDailyRates(params, signal),
    enabled: Boolean(
      enabled && params.hotelId && params.roomTypeId && roomRatesRangeSchema.safeParse(params).success,
    ),
    retry: false,
  })
}
