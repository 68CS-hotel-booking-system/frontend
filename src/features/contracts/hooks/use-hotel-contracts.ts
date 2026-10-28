import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useDataMode } from '@/shared/lib/data-mode-context'
import {
  createHotelContractDraft,
  getHotelContracts,
} from '../api/contract-api'
import {
  createMockHotelContractDraft,
  getMockHotelContracts,
} from '../api/contract-mock'
import type { CreateHotelContractFormValues } from '../types/contract'

export const contractKeys = {
  all: ['contracts'] as const,
  byHotel: (mode: string, hotelId: string) =>
    ['contracts', 'by-hotel', mode, hotelId] as const,
}

/** FN01: Xem danh sách thỏa thuận/hợp đồng của khách sạn */
export function useHotelContractsQuery(hotelId: string) {
  const { mode } = useDataMode()
  return useQuery({
    queryKey: contractKeys.byHotel(mode, hotelId),
    queryFn: ({ signal }) =>
      mode === 'mock'
        ? getMockHotelContracts(hotelId)
        : getHotelContracts(hotelId, signal),
    enabled: Boolean(hotelId),
    retry: false,
  })
}

/** FN02: Tạo dự thảo hợp đồng hoa hồng */
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
