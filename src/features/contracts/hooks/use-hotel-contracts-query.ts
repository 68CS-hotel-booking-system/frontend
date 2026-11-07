import { useQuery } from '@tanstack/react-query'
import { useDataMode } from '@/shared/lib/data-mode-context'
import { getHotelContracts } from '../api/contract-api'
import { getMockHotelContracts } from '../mocks/contract-mock'
import { contractKeys } from './contract-query-keys'

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
