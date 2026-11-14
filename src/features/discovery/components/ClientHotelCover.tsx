import { useState } from 'react'
import { useCover } from '../hooks/use-public-discovery'

export function ClientHotelCover({ mediaId, hotelName }: { mediaId?: string; hotelName: string }) {
  const cover = useCover(mediaId)
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const url = cover.data?.url
  return <div className="my-7 overflow-hidden rounded-2xl bg-[#eee8df]">
    {url && failedUrl !== url ? <img src={url} alt={`Ảnh bìa ${hotelName}`} className="h-64 w-full object-cover sm:h-96" onError={() => setFailedUrl(url)} /> : <div className="flex h-64 flex-col items-center justify-center gap-3 text-[#706a62]" role={cover.isError || failedUrl ? 'alert' : undefined}>
      {cover.isFetching ? 'Đang tải ảnh bìa…' : mediaId ? 'Không tải được ảnh bìa' : 'Chưa có thông tin ảnh bìa'}
      {mediaId && (cover.isError || failedUrl) && <button type="button" onClick={() => { setFailedUrl(null); void cover.refetch() }}>Thử lại</button>}
    </div>}
  </div>
}
