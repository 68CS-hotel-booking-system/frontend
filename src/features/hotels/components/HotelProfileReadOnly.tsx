import { Alert, Descriptions } from 'antd'
import type { ManagementHotelDetail } from '../model/hotel'

export function HotelProfileReadOnly({ hotel, reason }: { hotel: ManagementHotelDetail; reason: string }) {
  return <section className="space-y-4" aria-label="Thông tin khách sạn chỉ đọc">
    <Alert type="info" showIcon title="Hồ sơ chỉ đọc" description={reason} />
    <Descriptions bordered column={{ xs: 1, sm: 1, md: 2 }} items={[
      { key: 'name', label: 'Tên khách sạn', children: hotel.name },
      { key: 'address', label: 'Địa chỉ', children: hotel.address },
      { key: 'phone', label: 'Điện thoại liên hệ', children: hotel.contactPhone || 'Chưa khai báo' },
      { key: 'email', label: 'Email liên hệ', children: <span className="break-all">{hotel.contactEmail || 'Chưa khai báo'}</span> },
      { key: 'checkin', label: 'Giờ nhận phòng', children: hotel.checkInTime },
      { key: 'checkout', label: 'Giờ trả phòng', children: hotel.checkOutTime },
      { key: 'description', label: 'Giới thiệu', span: 2, children: <p className="whitespace-pre-wrap m-0">{hotel.description || 'Chưa có mô tả'}</p> },
    ]} />
  </section>
}
