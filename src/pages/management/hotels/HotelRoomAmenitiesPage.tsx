import { Button, Checkbox, message } from 'antd'
import { SaveOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { useHotelWorkspace } from '@/features/hotels'
import { PageHeader } from '@/shared/ui/PageHeader'

const MOCK_ROOM_AMENITIES = [
  { id: 'amenity-ac', name: 'Điều hòa nhiệt độ 2 chiều', category: 'Thiết bị' },
  { id: 'amenity-tv', name: 'Smart TV 55 inch 4K', category: 'Thiết bị' },
  { id: 'amenity-fridge', name: 'Tủ lạnh mini bar', category: 'Thiết bị' },
  { id: 'amenity-bath', name: 'Bồn tắm nằm ngâm mình', category: 'Phòng tắm' },
  { id: 'amenity-shower', name: 'Vòi sen đứng nóng lạnh', category: 'Phòng tắm' },
  { id: 'amenity-hairdryer', name: 'Máy sấy tóc công suất lớn', category: 'Phòng tắm' },
  { id: 'amenity-balcony', name: 'Ban công thoáng mát hướng phố', category: 'Không gian' },
  { id: 'amenity-kettle', name: 'Ấm đun nước siêu tốc', category: 'Tiện nghi' },
  { id: 'amenity-safe', name: 'Két an toàn điện tử', category: 'Tiện nghi' },
]

export function HotelRoomAmenitiesPage() {
  const { hotel, hotelId } = useHotelWorkspace()
  const [selected, setSelected] = useState<string[]>(['amenity-ac', 'amenity-tv', 'amenity-shower'])

  if (!hotel) return null

  const breadcrumbItems = [
    { label: 'Khách sạn', to: '/hotels' },
    { label: hotel.name, to: `/hotels/${hotelId}` },
    { label: 'Phòng', to: `/hotels/${hotelId}/rooms` },
    { label: 'Tiện ích phòng' },
  ]

  const handleSave = () => {
    // TODO: Gán tiện ích phòng HT18 (PUT /api/v1/management/hotels/{hotelId}/room-types/{roomTypeId}/amenities)
    message.success('Đã lưu cấu hình tiện ích phòng (Mẫu thử nghiệm)!')
  }

  return (
    <div className="hotel-room-amenities-page max-w-4xl">
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        kicker="TIỆN NGHI TRONG PHÒNG"
        title="Tiện ích phòng"
        description="Đánh dấu các tiện ích và trang thiết bị có sẵn bên trong phòng nghỉ (Máy lạnh, Bồn tắm, Smart TV, Két an toàn...)."
        extra={
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            className="!bg-[#0b5f53]"
          >
            Lưu tiện ích phòng
          </Button>
        }
      />

      <div className="bg-white p-6 rounded-2xl border border-[#dce7e3] shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {MOCK_ROOM_AMENITIES.map((item) => {
            const isChecked = selected.includes(item.id)
            return (
              <label
                key={item.id}
                className={`p-3.5 rounded-xl border transition-colors flex items-center gap-3 cursor-pointer select-none ${
                  isChecked
                    ? 'border-[#0b5f53] bg-[#eef8f5]'
                    : 'border-[#dce7e3] hover:border-[#bfd3cd] bg-white'
                }`}
              >
                <Checkbox
                  checked={isChecked}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelected([...selected, item.id])
                    } else {
                      setSelected(selected.filter((id) => id !== item.id))
                    }
                  }}
                />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#12211d]">{item.name}</div>
                  <div className="text-[10.5px] text-[#5f736e]">{item.category}</div>
                </div>
              </label>
            )
          })}
        </div>
      </div>
    </div>
  )
}
