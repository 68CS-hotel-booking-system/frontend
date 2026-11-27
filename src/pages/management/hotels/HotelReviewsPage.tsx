import { ManagedGuestReviews } from '@/features/guest-reviews'
import { useHotelWorkspace } from '@/features/hotels'
import { PageHeader } from '@/shared/ui/PageHeader'

export function HotelReviewsPage() {
  const { hotel, hotelId } = useHotelWorkspace()

  if (!hotel) return null

  const breadcrumbItems = [
    { label: 'Khách sạn', to: '/hotels' },
    { label: hotel.name, to: `/hotels/${hotelId}` },
    { label: 'Đánh giá' },
  ]

  return (
    <div className="hotel-reviews-page max-w-5xl mx-auto">
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title="Đánh giá &amp; Nhận xét"
        description="Lắng nghe phản hồi từ khách lưu trú, điểm đánh giá chất lượng dịch vụ và phản hồi khách hàng để nâng cao trải nghiệm."
      />

      <ManagedGuestReviews hotelId={hotelId} />
    </div>
  )
}
