import { useMutation, useQueryClient } from '@tanstack/react-query'
import { setRoomTypeDailyRates } from '../api/room-rates-api'
import { exclusiveRateEndDate, setRoomRatesFormSchema, type SetRoomRatesFormValues } from '../model/room-rates'
import { hotelManagementKeys } from './hotel-query-keys'
import type { ManagementHotelDetail } from '../model/hotel'

export function useSetRoomRatesMutation(hotelId: string, roomTypeId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    retry: false,
    mutationFn: async (values: SetRoomRatesFormValues) => {
      const parsed = setRoomRatesFormSchema.parse(values)
      return setRoomTypeDailyRates({ hotelId, roomTypeId }, {
        startDate: parsed.startDate, endDateExclusive: exclusiveRateEndDate(parsed.endDate), amount: parsed.amount,
      })
    },
    onSuccess: async () => {
      queryClient.setQueryData<ManagementHotelDetail>(hotelManagementKeys.detail('api', hotelId), (hotel) =>
        hotel ? { ...hotel, hasConfiguredRates: true } : hotel)
      await queryClient.invalidateQueries({ queryKey: ['hotels', 'room-rates', 'api'] })
    },
  })
}
