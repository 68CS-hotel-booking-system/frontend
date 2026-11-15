import { z } from 'zod'
import { http } from '@/shared/api/http'
import { getMediaAccess } from '@/features/hotels'

const searchItemSchema = z.object({
  id: z.uuid(), name: z.string(), slug: z.string(), address: z.string(), starRating: z.number().nullable(),
  city: z.object({ id: z.uuid(), name: z.string(), slug: z.string() }),
  coverImage: z.object({ mediaId: z.uuid() }).nullable(), minNightlyPrice: z.number().nonnegative().nullable(),
  totalPrice: z.number().nonnegative().nullable(), currency: z.string(),
  amenities: z.array(z.object({ id: z.uuid(), code: z.string(), name: z.string() })),
})
const searchPageSchema = z.object({ content: z.array(searchItemSchema), page: z.number().int(), size: z.number().int(),
  totalElements: z.number().int(), totalPages: z.number().int(), first: z.boolean(), last: z.boolean() })
export type SearchHotel = z.infer<typeof searchItemSchema>
export interface HotelSearchParams { cityId?: string; citySlug?: string; checkIn?: string; checkOut?: string; guests?: number;
  minPrice?: number; maxPrice?: number; starRating?: number; amenityIds?: string[]; sort?: 'price' | 'rating' | 'name'; page?: number; size?: number }
export async function searchHotels(params: HotelSearchParams, signal?: AbortSignal) {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') query.set(key, Array.isArray(value) ? value.join(',') : String(value))
  }
  return http.request(`/hotels/search?${query}`, { signal, schema: searchPageSchema })
}
export async function resolveCover(mediaId: string | undefined, signal?: AbortSignal) {
  if (!mediaId) return '/assets/hotel-placeholder.svg'
  try { return (await getMediaAccess(mediaId, signal)).url } catch (error) {
    if (signal?.aborted) throw error
    return '/assets/hotel-placeholder.svg'
  }
}
