import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useDataMode } from '@/shared/lib/data-mode-context'
import {
  getFinancialAccess,
  updateFinancialAccess,
} from '../api/financial-access-api'
import {
  getMockFinancialAccess,
  updateMockFinancialAccess,
} from '../api/financial-access-mock'
import type { UpdateFinancialAccessFormValues } from '../types/financial-access'

export const financialAccessKeys = {
  all: ['finance'] as const,
  grant: (mode: string, hotelId: string, userId: string) =>
    ['finance', 'access-grant', mode, hotelId, userId] as const,
}

/** FN16: Đọc cấp quyền tài chính và phiên bản trước sửa */
export function useFinancialAccessQuery(hotelId: string, userId: string) {
  const { mode } = useDataMode()
  return useQuery({
    queryKey: financialAccessKeys.grant(mode, hotelId, userId),
    queryFn: ({ signal }) =>
      mode === 'mock'
        ? getMockFinancialAccess({ hotelId, userId })
        : getFinancialAccess({ hotelId, userId }, signal),
    enabled: Boolean(hotelId && userId.trim()),
    retry: false,
  })
}

/** FN00: Cấp/thu hồi quyền đọc tài chính theo thỏa thuận */
export function useUpdateFinancialAccessMutation(hotelId: string, userId: string) {
  const { mode } = useDataMode()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateFinancialAccessFormValues) =>
      mode === 'mock'
        ? updateMockFinancialAccess({ hotelId, userId }, payload)
        : updateFinancialAccess({ hotelId, userId }, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: financialAccessKeys.grant(mode, hotelId, userId),
      })
    },
  })
}
