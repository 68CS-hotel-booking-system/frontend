import { z } from 'zod'
import { http } from './http'

export const mediaAccessResponseSchema = z.object({
  mediaId: z.uuid(),
  url: z.url({ protocol: /^https?$/ }),
  expiresAt: z.string().optional(),
})

export type MediaAccessDto = z.infer<typeof mediaAccessResponseSchema>

export function getMediaAccess(mediaId: string, signal?: AbortSignal) {
  return http.request(`/media/${encodeURIComponent(mediaId)}/access`, {
    signal,
    schema: mediaAccessResponseSchema,
  })
}
