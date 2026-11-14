import { Alert } from 'antd'
import { useHotelWorkspace } from '@/features/hotels'
import { PageHeader } from '@/shared/ui/PageHeader'
import { EmptyState } from '@/shared/ui/EmptyState'

export function HotelBookingsPage() {
  const { hotel, hotelId, isDraft } = useHotelWorkspace()

  if (!hotel) return null

  const breadcrumbItems = [
    { label: 'Khách sạn', to: '/hotels' },
    { label: hotel.name, to: `/hotels/${hotelId}` },
    { label: 'Đặt phòng' },
  ]

  return (
    <div className="hotel-bookings-page max-w-5xl mx-auto">
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        kicker="VẬN HÀNH &amp; ĐẶT CHỖ"
        title="Danh sách đặt phòng"
        description="Theo dõi các đơn đặt phòng phát sinh của khách sạn này, thời gian lưu trú, trạng thái thanh toán và thông tin khách nhận phòng."

      />

      {isDraft && (
        <Alert
          type="warning"
          showIcon
          className="mb-6 rounded-xl"
          title="Khách sạn chưa mở bán"
          description="Khách sạn hiện đang ở trạng thái Bản nháp (DRAFT). Sau khi được quản trị viên duyệt và kích hoạt mở bán, các đơn đặt phòng từ khách hàng sẽ hiển thị tại đây."
        />
      )}

      <div className="bg-white p-8 rounded-2xl border border-[#dce7e3] text-center">
        <EmptyState
          title="Danh sách đặt phòng chưa khả dụng"
          description={
            isDraft
              ? 'Khách sạn cần được duyệt để mở bán. Bạn chưa thể tra cứu đơn tại màn hình này.'
              : 'Màn hình này chưa hỗ trợ tra cứu đơn. Trạng thái này không phản ánh số đơn thực tế của khách sạn.'
          }
        />
      </div>
    </div>
  )
}
