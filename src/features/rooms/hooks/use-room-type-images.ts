import { useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { uploadHotelMedia } from '@/features/hotels'
import { attachRoomTypeImage, listRoomTypeImages, type RoomTypeImageScope } from '../api/room-type-images-api'

const imagesKey = (hotelId: string, roomTypeId: string) => ['room-type-images', hotelId, roomTypeId] as const

export function useRoomTypeImages(hotelId: string, roomTypeId: string, scope: RoomTypeImageScope) {
  return useQuery({
    queryKey: [...imagesKey(hotelId, roomTypeId), scope],
    queryFn: ({ signal }) => listRoomTypeImages(hotelId, roomTypeId, scope, signal),
    staleTime: 60_000,
    retry: false,
  })
}

export function useUploadRoomTypeImage(hotelId: string, roomTypeId: string) {
  const client = useQueryClient()
  const uploaded = useRef<{ file: File; mediaId: string } | undefined>(undefined)
  return useMutation({
    mutationFn: async (file: File) => {
      let mediaId = uploaded.current?.file === file ? uploaded.current.mediaId : undefined
      if (!mediaId) {
        const media = await uploadHotelMedia({ hotelId, file })
        mediaId = media.id
        uploaded.current = { file, mediaId }
      }
      const linked = await attachRoomTypeImage(hotelId, roomTypeId, mediaId)
      uploaded.current = undefined
      return linked
    },
    onSuccess: (linked) => {
      const key = imagesKey(hotelId, roomTypeId)
      client.setQueryData<(typeof linked)[]>([...key, 'management'], current =>
        current?.some(image => image.mediaId === linked.mediaId) ? current : [...(current ?? []), linked],
      )
      void client.invalidateQueries({ queryKey: key })
    },
  })
}
