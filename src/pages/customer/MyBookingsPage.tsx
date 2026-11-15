import { BookingList } from '@/features/bookings'
import { PageHeader } from '@/shared/ui/PageHeader'
export function MyBookingsPage() {
  return <div className="management-page"><PageHeader title="Đặt phòng của tôi" description="Theo dõi đơn, thanh toán và gửi yêu cầu hỗ trợ." /><BookingList /></div>
}
