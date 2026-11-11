import { useQuery } from '@tanstack/react-query'
import { getMediaAccess } from '../api/hotel-media-api'

export function useHotelReviewImage(mediaId: string) {
  return useQuery({
    queryKey: ['hotel-review-media', mediaId], queryFn: ({ signal }) => getMediaAccess(mediaId, signal), retry: false,
    staleTime: 0, refetchInterval: (query) => {
      const expiry = Date.parse(query.state.data?.expiresAt ?? '')
      return Number.isFinite(expiry) ? Math.max(1_000, expiry - Date.now() - 30_000) : false
    },
  })
}
