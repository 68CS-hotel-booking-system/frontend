import { useQuery } from '@tanstack/react-query'
import { useDataMode } from '@/shared/lib/data-mode-context'
import { getCities } from '../api/catalog-api'
import { getMockCities } from '../mocks/hotel-management-mock'
import { hotelManagementKeys } from './hotel-query-keys'

export function useCitiesQuery() {
  const { mode } = useDataMode()
  return useQuery({
    queryKey: hotelManagementKeys.cities(mode),
    queryFn: ({ signal }) => (mode === 'mock' ? getMockCities() : getCities(signal)),
    retry: false,
  })
}
