import { useMutation, useQueryClient } from '@tanstack/react-query'
import { setRoomTypeDailyRates } from '../api/room-rates-api'
import { exclusiveRateEndDate, type SetRoomRatesFormValues } from '../model/room-rates'

export interface SetRoomRateMutationInput {
  startDate: string
  endDate?: string
  amount: number
  currency?: string
}

export function useSetRoomRatesMutation(hotelId: string, roomTypeId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    retry: false,
    mutationFn: async (values: SetRoomRatesFormValues | SetRoomRateMutationInput) => {
      let endDateExclusive: string | undefined = undefined
      if (values.endDate && values.endDate !== values.startDate) {
        endDateExclusive = exclusiveRateEndDate(values.endDate)
      }
      return setRoomTypeDailyRates({ hotelId, roomTypeId }, {
        startDate: values.startDate,
        endDateExclusive,
        amount: values.amount,
        currency: ('currency' in values && values.currency) ? values.currency : 'VND',
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['hotels', 'room-rates', 'api'] })
    },
  })
}
