import { useQuery } from '@tanstack/react-query'
import { useDataMode } from '@/shared/lib/data-mode-context'
import { getAmenities } from '../api/catalog-api'
import { getMockAmenities } from '../mocks/hotel-management-mock'
import { hotelManagementKeys } from './hotel-query-keys'

export function useAmenitiesQuery() {
  const { mode } = useDataMode()
  return useQuery({
    queryKey: hotelManagementKeys.amenities(mode),
    queryFn: ({ signal }) =>
      mode === 'mock' ? getMockAmenities() : getAmenities(signal),
    retry: false,
  })
}
