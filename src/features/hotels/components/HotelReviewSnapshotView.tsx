import { Button, Descriptions, Empty, Image, Skeleton, Table, Tag } from 'antd'
import type { HotelReviewSnapshot } from '../api/hotel-review-api'
import { useHotelReviewImage } from '../hooks/use-hotel-review-image'

function SubmittedImage({ mediaId, alt }: { mediaId: string; alt: string }) {
  const query = useHotelReviewImage(mediaId)
  if (query.isPending) return <Skeleton.Image active />
  if (query.isError) return <div className="p-4 border border-[#dce7e3] rounded-xl" role="status">
    <p>Chưa tải được ảnh đã gửi.</p><Button onClick={() => void query.refetch()}>Tải lại ảnh</Button>
  </div>
  return <Image src={query.data.url} alt={alt} width="100%" height={180} style={{ objectFit: 'cover' }} />
}
export function HotelReviewSnapshotView({ snapshot }: { snapshot: HotelReviewSnapshot }) {
  const { hotel } = snapshot
  const names = (items: Array<{ name: string }>) => items.map((item) => item.name).join(', ') || 'Không có'
  const customDetails = (items: Array<{ name: string; description: string | null; attached: boolean }>) =>
    items.filter((item) => item.attached).map((item) => `${item.name}${item.description ? ` — ${item.description}` : ''}`).join('; ') || 'Không có'
  return <div className="space-y-6" aria-label="Nội dung hồ sơ tại thời điểm gửi">
    <section className="surface-card">
      <h2 className="text-lg font-bold">Thông tin khách sạn đã gửi</h2>
      <Descriptions bordered column={{ xs: 1, sm: 1, md: 2 }} size="small" items={[
        { key: 'name', label: 'Tên khách sạn', children: hotel.name },
        { key: 'stars', label: 'Xếp hạng', children: hotel.starRating ? `${hotel.starRating} sao` : 'Chưa khai báo' },
        { key: 'address', label: 'Địa chỉ', children: hotel.address },
        { key: 'city', label: 'Mã thành phố', children: <span className="break-all">{hotel.cityId}</span> },
        { key: 'phone', label: 'Điện thoại', children: hotel.contactPhone || 'Chưa khai báo' },
        { key: 'email', label: 'Email liên hệ', children: <span className="break-all">{hotel.contactEmail || 'Chưa khai báo'}</span> },
        { key: 'checkin', label: 'Nhận phòng', children: hotel.checkInTime },
        { key: 'checkout', label: 'Trả phòng', children: hotel.checkOutTime },
        { key: 'coordinates', label: 'Tọa độ', children: hotel.latitude == null ? 'Chưa khai báo' : `${hotel.latitude}, ${hotel.longitude}` },
        { key: 'version', label: 'Phiên bản khách sạn lúc gửi', children: hotel.version },
        { key: 'description', label: 'Giới thiệu', span: 2, children: <p className="whitespace-pre-wrap m-0">{hotel.description || 'Chưa có mô tả'}</p> },
      ]} />
    </section>
    <section className="surface-card">
      <h2 className="text-lg font-bold">Ảnh và album đã gửi</h2>
      {snapshot.images.length === 0 ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Hồ sơ này chưa gửi kèm ảnh." /> : <Image.PreviewGroup>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {snapshot.images.map((image) => <figure className="m-0 min-w-0" key={image.mediaId}>
            <SubmittedImage mediaId={image.mediaId} alt={image.altText || `Ảnh ${hotel.name}`} />
            <figcaption className="text-sm mt-2">{image.cover && <Tag color="green">Ảnh bìa</Tag>}
              {snapshot.albums.find((album) => album.id === image.albumId)?.name ?? 'Chưa phân album'}
              {image.altText && <span className="block text-[#5f736e]">{image.altText}</span>}
            </figcaption>
          </figure>)}
        </div>
      </Image.PreviewGroup>}
      {snapshot.albums.map((album) => <p key={album.id} className="text-sm mt-3 mb-0"><strong>{album.name}</strong>{album.description && ` — ${album.description}`}</p>)}
    </section>
    <section className="surface-card">
      <h2 className="text-lg font-bold">Tiện ích khách sạn</h2>
      <p><strong>Danh mục: </strong>{names(snapshot.amenities)}</p>
      <p><strong>Tiện ích riêng: </strong>{customDetails(snapshot.customAmenities)}</p>
    </section>
    <section className="surface-card min-w-0">
      <h2 className="text-lg font-bold">Loại phòng ({snapshot.roomTypes.length})</h2>
      <Table rowKey={(item) => item.roomType.id} dataSource={snapshot.roomTypes} pagination={false} scroll={{ x: 720 }} size="small" columns={[
        { title: 'Loại phòng', key: 'name', render: (_, item) => <><strong>{item.roomType.name}</strong><p className="text-sm whitespace-pre-wrap">{item.roomType.description}</p></> },
        { title: 'Sức chứa', key: 'capacity', render: (_, { roomType: type }) => `${type.maxAdults} người lớn · ${type.maxChildren} trẻ em · tối đa ${type.maxOccupancy} khách` },
        { title: 'Giá cơ bản', key: 'price', render: (_, item) => item.roomType.basePrice.toLocaleString('vi-VN') },
        { title: 'Trạng thái', key: 'active', render: (_, item) => item.roomType.active ? 'Đang bán' : 'Ngừng bán' },
        { title: 'Tiện ích', key: 'amenities', render: (_, item) => names(item.amenities) },
      ]} />
    </section>
    <section className="surface-card min-w-0">
      <h2 className="text-lg font-bold">Phòng vật lý ({snapshot.rooms.length})</h2>
      <Table rowKey="id" dataSource={snapshot.rooms} pagination={false} scroll={{ x: 720 }} size="small" columns={[
        { title: 'Phòng', dataIndex: 'roomNumber' }, { title: 'Tầng', dataIndex: 'floor' },
        { title: 'Loại phòng', key: 'type', render: (_, room) => snapshot.roomTypes.find((item) => item.roomType.id === room.roomTypeId)?.roomType.name ?? room.roomTypeId },
        { title: 'Bắt đầu phục vụ', dataIndex: 'operationalFrom', render: (value: string) => new Date(value).toLocaleString('vi-VN') },
        { title: 'Kết thúc phục vụ', dataIndex: 'operationalUntil', render: (value: string | null) => value ? new Date(value).toLocaleString('vi-VN') : 'Chưa ấn định' },
        { title: 'Tiện ích', key: 'amenities', render: (_, room) => <>{names(room.amenities)}<p className="text-sm">Tiện ích riêng: {customDetails(room.customAmenities)}</p></> },
      ]} />
    </section>
  </div>
}
