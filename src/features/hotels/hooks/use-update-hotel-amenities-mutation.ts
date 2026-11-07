import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useDataMode } from '@/shared/lib/data-mode-context'
import { updateHotelAmenities } from '../api/hotel-management-api'
import { updateMockHotelAmenities } from '../mocks/hotel-management-mock'
import type { UpdateHotelAmenitiesFormValues } from '../model/hotel-form-schemas'
import { hotelManagementKeys } from './hotel-query-keys'

export function useUpdateHotelAmenitiesMutation(hotelId: string) {
  const { mode } = useDataMode()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateHotelAmenitiesFormValues) =>
      mode === 'mock'
        ? updateMockHotelAmenities(hotelId, payload.amenityIds)
        : updateHotelAmenities(hotelId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: hotelManagementKeys.detail(mode, hotelId),
      })
    },
  })
}
