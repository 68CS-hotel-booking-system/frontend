import { ArrowRightOutlined, CheckCircleFilled } from '@ant-design/icons'
import { Button, Tag } from 'antd'
import { Link } from 'react-router'
import type { AmenityItem } from '../model/hotel'

interface InheritedAmenitiesSectionProps {
  hotelId: string
  roomTypeId?: string
  roomTypeName?: string
  inheritedAmenities: AmenityItem[]
}

export function InheritedAmenitiesSection({
  hotelId,
  roomTypeId,
  roomTypeName = 'Hạng phòng',
  inheritedAmenities,
}: InheritedAmenitiesSectionProps) {
  return (
    <div className="bg-gradient-to-r from-[#f0f9f6] to-[#f7fbf9] p-4 sm:p-5 rounded-2xl border border-[#cce3dc] shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#dce7e3]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold text-[#12211d] m-0">
              Tiện ích kế thừa từ hạng phòng
            </h3>
            <Tag color="cyan" className="!rounded-md !m-0 font-medium">
              {inheritedAmenities.length} tiện ích
            </Tag>
          </div>
          <p className="text-xs text-[#5f736e] mt-1 mb-0">
            Các tiện ích này được cấu hình chung cho hạng phòng{' '}
            <strong className="text-[#0b5f53]">{roomTypeName}</strong>. Phòng vật lý tự động
            được hưởng các tiện ích này và không thể tháo rời tại cấp phòng.
          </p>
        </div>

        {roomTypeId && <Link to={`/hotels/${hotelId}/rooms/amenities?roomTypeId=${encodeURIComponent(roomTypeId)}`} className="shrink-0">
          <Button
            size="small"
            icon={<ArrowRightOutlined />}
            iconPlacement="end"
            className="text-xs !rounded-lg text-[#0b5f53] border-[#0b5f53]"
          >
            Sửa tiện ích hạng phòng
          </Button>
        </Link>}
      </div>

      {/* Grid of Inherited Items (read-only) */}
      {inheritedAmenities.length === 0 ? (
        <div className="py-4 text-xs text-[#5f736e] italic">
          Hạng phòng này hiện chưa được gắn tiện ích nào trong danh mục.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {inheritedAmenities.map((item) => (
            <div
              key={item.id}
              className="p-2.5 rounded-xl bg-white border border-[#dce7e3] flex flex-wrap items-center gap-2 text-xs text-[#12211d] shadow-2xs select-none"
            >
              <CheckCircleFilled className="text-[#0b5f53] text-sm shrink-0" />
              <span className="font-medium truncate">{item.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
