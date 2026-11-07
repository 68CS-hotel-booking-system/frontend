import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useDataMode } from '@/shared/lib/data-mode-context'
import { updateManagementHotel } from '../api/hotel-management-api'
import { updateMockManagementHotel } from '../mocks/hotel-management-mock'
import type { UpdateManagementHotelFormValues } from '../model/hotel-form-schemas'
import { hotelManagementKeys } from './hotel-query-keys'

export function useUpdateManagementHotelMutation(hotelId: string) {
  const { mode } = useDataMode()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateManagementHotelFormValues) =>
      mode === 'mock'
        ? updateMockManagementHotel(hotelId, payload)
        : updateManagementHotel(hotelId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: hotelManagementKeys.all })
    },
  })
}
