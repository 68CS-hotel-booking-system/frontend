import { Button, Descriptions, Modal, Tag } from 'antd'
import { RoomTypeAmenitiesSummary } from '@/features/hotels'
import { formatCurrencyAmount } from '@/shared/lib/format'
import type { ManagementRoomType } from '../api/room-type-api'

export function RoomTypeDetailsModal({ hotelId, roomType, onClose, onEdit, onAmenities, onViewRooms, readOnly = false }: {
  hotelId: string
  roomType: ManagementRoomType
  onClose: () => void
  onEdit: () => void
  onAmenities: () => void
  onViewRooms: () => void
  readOnly?: boolean
}) {
  return <Modal open title="Chi tiết hạng phòng" onCancel={onClose} width={760} styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }} footer={
    <div className="flex flex-wrap justify-end gap-2">
      <Button onClick={onClose}>Đóng</Button>
      {!readOnly && <Button type="primary" onClick={onEdit}>Chỉnh sửa hạng phòng</Button>}
    </div>
  }>
    <div className="space-y-5 py-2">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="m-0 text-lg font-bold">{roomType.name}</h2>
        <Tag color={roomType.active ? 'green' : 'default'} style={roomType.active ? { color: '#0b5f3b', background: '#e8f4ed' } : undefined}>{roomType.active ? 'Đang kích hoạt' : 'Tạm ngưng'}</Tag>
      </div>
      <Descriptions column={1} styles={{ label: { color: '#526760' } }} items={[
        { key: 'price', label: 'Giá cơ bản / đêm', children: roomType.basePrice === undefined ? 'Chưa tải được giá' : roomType.basePrice > 0 ? formatCurrencyAmount(roomType.basePrice, 'VND') : 'Chưa thiết lập' },
        { key: 'capacity', label: 'Sức chứa', children: `${roomType.maxAdults} người lớn · ${roomType.maxChildren} trẻ em` },
        { key: 'description', label: 'Mô tả', children: roomType.description || 'Chưa có mô tả' },
      ]} />
      <section className="border-t border-[#dce7e3] pt-4 space-y-3" aria-label="Tiện ích chung của hạng phòng">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="m-0 text-base font-semibold">Tiện ích hạng phòng</h3>
          {!readOnly && <Button onClick={onAmenities}>Chỉnh tiện ích hạng phòng</Button>}
        </div>
        <p className="text-sm text-[#526760] text-pretty">Áp dụng chung cho mọi phòng vật lý thuộc hạng này.</p>
        <RoomTypeAmenitiesSummary hotelId={hotelId} roomTypeId={roomType.id} />
      </section>
      <div className="border-t border-[#dce7e3] pt-4">
        <Button onClick={onViewRooms}>Xem phòng vật lý thuộc hạng</Button>
      </div>
    </div>
  </Modal>
}
