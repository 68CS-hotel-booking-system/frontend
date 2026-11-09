import { useHotelWorkspace, HotelAmenitiesManager } from '@/features/hotels'
import { PageHeader } from '@/shared/ui/PageHeader'

export function HotelAmenitiesPage() {
  const { hotel, hotelId } = useHotelWorkspace()

  if (!hotel) return null

  const breadcrumbItems = [
    { label: 'Khách sạn', to: '/hotels' },
    { label: hotel.name, to: `/hotels/${hotelId}` },
    { label: 'Tiện ích khách sạn' },
  ]

  return (
    <div className="hotel-amenities-page max-w-5xl">
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        kicker="TIỆN NGHI &amp; DỊCH VỤ"
        title="Tiện ích khách sạn"
        description="Đánh dấu các tiện ích chung mà cơ sở lưu trú của bạn cung cấp (Hồ bơi, Nhà hàng, Phòng tập gym, Wi-Fi...). Tiện ích đầy đủ sẽ giúp khách tìm kiếm dễ dàng hơn."
      />

      <HotelAmenitiesManager
        hotelId={hotelId}
        initialAmenityIds={hotel.amenityIds}
      />
    </div>
  )
}
