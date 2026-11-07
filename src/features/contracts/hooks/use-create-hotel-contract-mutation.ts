import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useDataMode } from '@/shared/lib/data-mode-context'
import { createHotelContractDraft } from '../api/contract-api'
import { createMockHotelContractDraft } from '../mocks/contract-mock'
import type { CreateHotelContractFormValues } from '../model/contract-form-schema'
import { contractKeys } from './contract-query-keys'

export function useCreateHotelContractMutation(hotelId: string) {
  const { mode } = useDataMode()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateHotelContractFormValues) =>
      mode === 'mock'
        ? createMockHotelContractDraft(hotelId, payload)
        : createHotelContractDraft(hotelId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: contractKeys.byHotel(mode, hotelId),
      })
    },
  })
}
