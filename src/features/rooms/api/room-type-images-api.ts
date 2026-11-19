import { z } from 'zod'
import { http } from '@/shared/api/http'

const roomTypeImageSchema = z.object({ mediaId: z.uuid(), createdAt: z.string() })
const roomTypeImagesSchema = z.array(roomTypeImageSchema)
export type RoomTypeImageScope = 'public' | 'management'

function imagesPath(hotelId: string, roomTypeId: string, scope: RoomTypeImageScope) {
  const prefix = scope === 'management' ? '/management' : ''
  return `${prefix}/hotels/${encodeURIComponent(hotelId)}/room-types/${encodeURIComponent(roomTypeId)}/images`
}

export function listRoomTypeImages(hotelId: string, roomTypeId: string, scope: RoomTypeImageScope, signal?: AbortSignal) {
  return http.request(imagesPath(hotelId, roomTypeId, scope), { signal, schema: roomTypeImagesSchema })
}

export function attachRoomTypeImage(hotelId: string, roomTypeId: string, mediaId: string) {
  return http.request(imagesPath(hotelId, roomTypeId, 'management'), {
    method: 'POST',
    body: { mediaId },
    schema: roomTypeImageSchema,
  })
}
