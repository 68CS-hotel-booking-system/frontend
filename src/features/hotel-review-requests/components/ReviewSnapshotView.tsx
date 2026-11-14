import { useQuery } from '@tanstack/react-query'
import { Alert, Button, Collapse, Descriptions, Image, Tabs, Tag } from 'antd'
import { formatCurrencyAmount } from '@/shared/lib/format'
import { getReviewImageAccess } from '../api/review-requests-api'
import type { ReviewSnapshot } from '../model/review-request'

function Amenities({ items }: { items: Array<{ id: string; name: string }> }) {
  return items.length ? <div className="flex flex-wrap gap-2">{items.map((item) => <Tag key={item.id} className="!m-0">{item.name}</Tag>)}</div> : <p className="text-[#526760]">Không có tiện ích trong hồ sơ đã gửi.</p>
}
function CustomAmenities({ items }: { items: ReviewSnapshot['customAmenities'] }) {
  const attached = items.filter((item) => item.attached)
  return attached.length ? <dl className="space-y-3">{attached.map((item) => <div key={item.id}><dt className="font-medium">{item.name}</dt>{item.description && <dd className="text-sm text-[#526760] whitespace-pre-wrap break-words m-0">{item.description}</dd>}</div>)}</dl> : <p className="text-[#526760]">Không có tiện ích riêng trong hồ sơ.</p>
}
function SnapshotImage({ image, album }: { image: ReviewSnapshot['images'][number]; album?: string }) {
  const query = useQuery({ queryKey: ['review-media-access', image.mediaId], queryFn: ({ signal }) => getReviewImageAccess(image.mediaId, signal), staleTime: 60_000, retry: false })
  return <figure className="m-0 min-w-0 space-y-2">
    {query.data ? <Image src={query.data.url} alt={image.altText || 'Ảnh hồ sơ khách sạn'} className="!h-40 !w-full object-cover rounded-lg" /> : <div className="h-40 bg-[#f3f7f6] rounded-lg grid place-content-center text-center text-sm text-[#526760]">
      {query.isError ? <><span>Chưa tải được ảnh</span><Button onClick={() => void query.refetch()}>Thử lại ảnh</Button></> : 'Đang tải ảnh…'}
    </div>}
    <figcaption className="text-xs text-[#526760]">{image.cover ? 'Ảnh bìa · ' : ''}{album || 'Chưa phân album'}{image.altText ? ` · ${image.altText}` : ''}</figcaption>
  </figure>
}
export function ReviewSnapshotView({ snapshot }: { snapshot: ReviewSnapshot }) {
  const { hotel } = snapshot
  return <Tabs items={[
    { key: 'info', label: 'Thông tin chung', children: <Descriptions column={1} styles={{ label: { color: '#526760', minWidth: 120 } }} items={[
      { key: 'name', label: 'Khách sạn', children: hotel.name },
      { key: 'address', label: 'Địa chỉ', children: hotel.address },
      { key: 'phone', label: 'Điện thoại', children: hotel.contactPhone || 'Chưa cung cấp' },
      { key: 'email', label: 'Email', children: hotel.contactEmail || 'Chưa cung cấp' },
      { key: 'star', label: 'Tiêu chuẩn sao', children: hotel.starRating ? `${hotel.starRating} sao` : 'Chưa xếp hạng' },
      { key: 'time', label: 'Nhận / trả phòng', children: `${hotel.checkInTime.slice(0, 5)} / ${hotel.checkOutTime.slice(0, 5)}` },
      { key: 'description', label: 'Mô tả', children: <span className="whitespace-pre-wrap break-words">{hotel.description || 'Chưa có mô tả'}</span> },
      { key: 'coordinates', label: 'Tọa độ', children: hotel.latitude != null && hotel.longitude != null ? `${hotel.latitude}, ${hotel.longitude}` : 'Chưa có tọa độ' },
      { key: 'owner', label: 'Mã Owner', children: <code className="break-all">{hotel.ownerId}</code> },
    ]} /> },
    { key: 'amenities', label: 'Tiện ích', children: <div className="space-y-5">
      <section><h3 className="text-base font-semibold">Tiện ích khách sạn</h3><Amenities items={snapshot.amenities} /></section>
      <section><h3 className="text-base font-semibold">Tiện ích riêng của khách sạn</h3><CustomAmenities items={snapshot.customAmenities} /></section>
    </div> },
    { key: 'rooms', label: `Hạng phòng (${snapshot.roomTypes.length})`, children: <div className="space-y-4">
      <Alert type="info" showIcon title={`${snapshot.roomTypes.length} hạng phòng · ${snapshot.rooms.length} phòng vật lý trong hồ sơ đã gửi`} />
      {snapshot.roomTypes.length === 0 && <p>Hồ sơ chưa có hạng phòng.</p>}
      <Collapse items={snapshot.roomTypes.map(({ roomType: type, amenities }) => ({ key: type.id, label: type.name, children: <div className="space-y-4">
        <Descriptions column={1} items={[
          { key: 'price', label: 'Giá cơ bản / đêm', children: formatCurrencyAmount(type.basePrice) },
          { key: 'capacity', label: 'Sức chứa', children: `${type.maxAdults} người lớn · ${type.maxChildren} trẻ em · tối đa ${type.maxOccupancy} khách` },
          { key: 'active', label: 'Mở bán', children: type.active ? 'Có' : 'Không' },
          { key: 'description', label: 'Mô tả', children: type.description || 'Chưa có mô tả' },
        ]} />
        <Amenities items={amenities} />
        <div className="space-y-3">{snapshot.rooms.filter((room) => room.roomTypeId === type.id).map((room) => <section key={room.id} className="border-t border-[#dce7e3] pt-3">
          <h4 className="font-semibold">Phòng {room.roomNumber} · Tầng {room.floor || '—'}</h4>
          <p className="text-xs text-[#526760]">Vận hành từ {room.operationalFrom.slice(0, 10)}{room.operationalUntil ? ` đến ${room.operationalUntil.slice(0, 10)}` : ''}</p>
          <Amenities items={room.amenities} /><CustomAmenities items={room.customAmenities} />
        </section>)}</div>
      </div> }))} />
    </div> },
    { key: 'images', label: `Hình ảnh (${snapshot.images.length})`, children: <div className="space-y-4">{snapshot.albums.length > 0 && <div className="space-y-2">{snapshot.albums.map((album) => <div key={album.id}><strong>{album.name}</strong>{album.description && <p className="text-sm text-[#526760] whitespace-pre-wrap break-words">{album.description}</p>}</div>)}</div>}{snapshot.images.length ? <Image.PreviewGroup><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...snapshot.images].sort((a, b) => a.sortOrder - b.sortOrder).map((image) => <SnapshotImage key={image.mediaId} image={image} album={snapshot.albums.find((album) => album.id === image.albumId)?.name} />)}
    </div></Image.PreviewGroup> : <p>Hồ sơ đã gửi chưa có hình ảnh.</p>}</div> },
  ]} />
}
