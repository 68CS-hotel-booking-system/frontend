import { useQuery } from '@tanstack/react-query'
import { getPublicGallery } from '../api/public-gallery-api'

export function usePublicGallery(hotelId: string) {
  return useQuery({ queryKey: ['discovery', 'gallery', hotelId], queryFn: ({ signal }) => getPublicGallery(hotelId, signal), enabled: Boolean(hotelId), retry: false })
}
