import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useDataMode } from '@/shared/lib/data-mode-context'
import { unsupportedApi } from '@/shared/api/unsupported-api'
import { setRoomTypeDailyRates } from '../api/room-rates-api'
import { exclusiveRateEndDate, setRoomRatesFormSchema, type SetRoomRatesFormValues } from '../model/room-rates'
import { hotelManagementKeys } from './hotel-query-keys'
import type { ManagementHotelDetail } from '../model/hotel'

export function useSetRoomRatesMutation(hotelId: string, roomTypeId: string) {
  const { mode } = useDataMode()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: SetRoomRatesFormValues) => {
      if (mode !== 'api') return unsupportedApi('lưu giá trong chế độ dữ liệu mẫu')
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
