import { z } from 'zod'
import { http } from '@/shared/api/http'

export const publicGallerySchema = z.object({
  hotelId: z.uuid(),
  images: z.array(z.object({ mediaId: z.uuid(), albumId: z.uuid().nullable(), sortOrder: z.number().int(), cover: z.boolean() })),
  albums: z.array(z.object({ id: z.uuid(), name: z.string(), description: z.string().nullable(), sortOrder: z.number().int() })),
})
export type PublicGallery = z.infer<typeof publicGallerySchema>
export function getPublicGallery(hotelId: string, signal?: AbortSignal) {
  return http.request(`/hotels/${encodeURIComponent(hotelId)}/gallery`, { signal, schema: publicGallerySchema })
}
