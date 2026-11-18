import { useState } from 'react'
import { Modal } from 'antd'
import { SignedMediaImage } from '@/shared/ui/SignedMediaImage'
import { useRoomTypeImages } from '../hooks/use-room-type-images'

export function PublicRoomTypePhotos({ hotelId, roomTypeId, name }: {
  hotelId: string
  roomTypeId: string
  name: string
}) {
  const [open, setOpen] = useState(false)
  const { data: images } = useRoomTypeImages(hotelId, roomTypeId, 'public')
  const cover = images?.[0]
  if (!cover) return null

  const scope = `public-room:${hotelId}:${roomTypeId}`
  return <>
    <button type="button" className="stay-room-photo" onClick={() => setOpen(true)} aria-label={`Xem ${images.length} ảnh của ${name}`}>
      <SignedMediaImage key={cover.mediaId} mediaId={cover.mediaId} scope={scope} alt={name} />
      <span>{images.length} ảnh</span>
    </button>
    <Modal title={`Ảnh ${name}`} open={open} onCancel={() => setOpen(false)} footer={null} width={760} destroyOnHidden>
      <div className="stay-room-gallery">
        {images.map(({ mediaId }, index) => <div className="stay-room-gallery-image" key={mediaId}>
          <SignedMediaImage mediaId={mediaId} scope={scope} alt={`${name}, ảnh ${index + 1}`}
            fallback={<span>Ảnh {index + 1}</span>} />
        </div>)}
      </div>
    </Modal>
  </>
}
