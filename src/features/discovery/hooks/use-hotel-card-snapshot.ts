import { useQuery, useQueryClient } from '@tanstack/react-query'
import { resolveCover, type SearchHotel } from '../api/search-api'
import type { ClientStay } from '../model/client-home'
import { fetchClientStays } from '../api/client-home-api'

export function useHotelCardSnapshot(hotelId: string) {
  const client = useQueryClient()
  const card = client.getQueriesData<{ content: SearchHotel[] }>({ queryKey: ['discovery', 'search'] })
    .flatMap(([, data]) => data?.content ?? []).find((hotel) => hotel.id === hotelId)
  const home = useQuery<ClientStay[]>({ queryKey: ['discovery', 'stays'], queryFn: ({ signal }) => fetchClientStays(signal), enabled: false })
  const homeCard = home.data?.find((hotel) => hotel.id === hotelId)
  const mediaId = card?.coverImage?.mediaId
  const cover = useQuery({ queryKey: ['discovery', 'cover', mediaId], queryFn: ({ signal }) => resolveCover(mediaId, signal), enabled: Boolean(mediaId), staleTime: 60000 })
  const image = cover.data ?? homeCard?.image
  return { city: card?.city.name ?? homeCard?.city, price: card?.minNightlyPrice ?? homeCard?.price,
    image: image && image !== '/assets/hotel-placeholder.svg' ? image : undefined }
}
