import { useQuery } from '@tanstack/react-query'
import { getCities, getMediaAccess } from '@/features/hotels'
import { getAvailability, getQuote, searchHotels, type SearchParams, type StayParams } from '../api/public-discovery-api'

export function useHotelSearch(params: SearchParams) {
  return useQuery({ queryKey: ['discovery', 'search', params], queryFn: ({ signal }) => searchHotels(params, signal), retry: false })
}
export function useCities() { return useQuery({ queryKey: ['discovery', 'cities'], queryFn: ({ signal }) => getCities(signal), retry: false }) }
export function useCover(id?: string) { return useQuery({ queryKey: ['discovery', 'media', id], queryFn: ({ signal }) => getMediaAccess(id!, signal), enabled: Boolean(id), retry: false, staleTime: 60000, refetchInterval: query => query.state.data?.expiresAt ? Math.max(1000, Date.parse(query.state.data.expiresAt) - Date.now() - 10000) : false }) }
export function useStayQuote(id: string, params: StayParams, roomId: string, valid: boolean) {
  const inventory = useQuery({ queryKey: ['discovery', 'availability', id, params], queryFn: ({ signal }) => getAvailability(id, params, signal), enabled: valid, retry: false })
  const available = inventory.data?.roomTypes.some(r => r.roomTypeId === roomId && r.isAvailable) ?? false
  const quote = useQuery({ queryKey: ['discovery', 'quote', id, params, roomId], queryFn: ({ signal }) => getQuote(id, params, roomId, signal), enabled: valid && available, retry: false })
  return { inventory, quote, available }
}
