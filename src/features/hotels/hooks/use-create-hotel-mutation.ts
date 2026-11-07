import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useDataMode } from '@/shared/lib/data-mode-context'
import { createAdminHotel } from '../api/hotel-management-api'
import { createMockAdminHotel } from '../mocks/hotel-management-mock'
import type { CreateAdminHotelFormValues } from '../model/hotel-form-schemas'
import { hotelManagementKeys } from './hotel-query-keys'

export function useCreateAdminHotelMutation() {
  const { mode } = useDataMode()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateAdminHotelFormValues) =>
      mode === 'mock' ? createMockAdminHotel(payload) : createAdminHotel(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: hotelManagementKeys.all })
    },
  })
}
