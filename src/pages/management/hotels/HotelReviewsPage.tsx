import { Alert } from 'antd'
import { useHotelWorkspace } from '@/features/hotels'
import { PageHeader } from '@/shared/ui/PageHeader'
import { EmptyState } from '@/shared/ui/EmptyState'

export function HotelReviewsPage() {
  const { hotel, hotelId, isDraft } = useHotelWorkspace()

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
        kicker="Ý KIẾN KHÁCH HÀNG"
        title="Đánh giá &amp; Nhận xét"
        description="Lắng nghe phản hồi từ khách lưu trú, điểm đánh giá chất lượng dịch vụ và phản hồi khách hàng để nâng cao trải nghiệm."
      />

      {isDraft && (
        <Alert
          type="warning"
          showIcon
          className="mb-6 rounded-xl"
          message="Khả dụng sau khi mở bán"
          description="Khách sạn đang ở trạng thái Bản nháp (DRAFT). Mục đánh giá sẽ kích hoạt sau khi khách sạn hoạt động và có khách hoàn thành lượt lưu trú."
        />
      )}

      <div className="bg-white p-8 rounded-2xl border border-[#dce7e3] text-center">
        <EmptyState
          title="Danh sách đánh giá chưa khả dụng"
          description="Bạn chưa thể xem đánh giá tại màn hình này. Trạng thái này không có nghĩa là khách sạn chưa nhận được đánh giá."
        />
      </div>
    </div>
  )
}
