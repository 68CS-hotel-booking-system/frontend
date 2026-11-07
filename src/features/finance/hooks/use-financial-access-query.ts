import { useQuery } from '@tanstack/react-query'
import { useDataMode } from '@/shared/lib/data-mode-context'
import { getFinancialAccess } from '../api/financial-access-api'
import { getMockFinancialAccess } from '../mocks/financial-access-mock'
import { financialAccessKeys } from './financial-access-query-keys'

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
