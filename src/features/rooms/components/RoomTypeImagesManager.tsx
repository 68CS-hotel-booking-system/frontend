import { useRef, useState } from 'react'
import { Button } from 'antd'
import { errorMessage } from '@/shared/api/api-error'
import { acceptedImageTypes, imageUploadError } from '@/shared/lib/image-upload'
import { SignedMediaImage } from '@/shared/ui/SignedMediaImage'
import { useRoomTypeImages, useUploadRoomTypeImage } from '../hooks/use-room-type-images'

export function RoomTypeImagesManager({ hotelId, roomTypeId, readOnly }: {
  hotelId: string
  roomTypeId: string
  readOnly: boolean
}) {
  const images = useRoomTypeImages(hotelId, roomTypeId, 'management')
  const upload = useUploadRoomTypeImage(hotelId, roomTypeId)
  const photoInput = useRef<HTMLInputElement>(null)
  const [fileError, setFileError] = useState<string>()

  return <section className="space-y-3 border-t border-[#dce7e3] pt-4" aria-label="Ảnh hạng phòng">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h3 className="m-0 text-base font-semibold">Ảnh hạng phòng</h3>
      {!readOnly && <div>
        <input ref={photoInput} type="file" accept={acceptedImageTypes} hidden onChange={event => {
          const file = event.currentTarget.files?.[0]
          event.currentTarget.value = ''
          if (!file || upload.isPending) return
          upload.reset()
          const error = imageUploadError(file)
          setFileError(error ?? undefined)
          if (!error) upload.mutate(file)
        }} />
        <Button loading={upload.isPending} onClick={() => photoInput.current?.click()}>Thêm ảnh</Button>
      </div>}
    </div>
    {!readOnly && <p className="text-sm text-[#526760]">JPG, PNG hoặc WebP, tối đa 5 MB mỗi ảnh.</p>}
    {fileError && <p role="alert" className="text-sm text-red-700">{fileError}</p>}
    {upload.isError && <div role="alert" className="flex flex-wrap items-center gap-2 text-sm text-red-700">
      <span>{errorMessage(upload.error)}</span>
      <Button size="small" onClick={() => { if (upload.variables) upload.mutate(upload.variables) }}>Thử lại</Button>
    </div>}
    {upload.isSuccess && <p role="status" className="text-sm text-green-800">Đã thêm ảnh hạng phòng.</p>}
    {images.isPending && <p role="status" className="text-sm">Đang tải ảnh…</p>}
    {images.isError && <div role="alert" className="flex flex-wrap items-center gap-2 text-sm text-red-700">
      <span>Không tải được danh sách ảnh. {errorMessage(images.error)}</span>
      <Button size="small" onClick={() => void images.refetch()}>Tải lại</Button>
    </div>}
    {images.data?.length === 0 && <p className="text-sm text-[#526760]">Hạng phòng này chưa có ảnh.</p>}
    {!!images.data?.length && <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3">
      {images.data.map(({ mediaId }, index) => <li key={mediaId} className="aspect-[4/3] overflow-hidden rounded-lg bg-[#f4f6f5]">
        <SignedMediaImage mediaId={mediaId} scope={`management-room:${hotelId}:${roomTypeId}`} alt={`Ảnh hạng phòng ${index + 1}`} className="h-full w-full object-cover"
          fallback={<span className="grid h-full place-items-center text-sm text-[#526760]">Ảnh {index + 1}</span>} />
      </li>)}
    </ul>}
  </section>
}
