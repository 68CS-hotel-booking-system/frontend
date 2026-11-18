import { CustomerBookingList } from '@/features/bookings'
import { ClientTripCover } from '@/features/discovery'
import { CustomerAccountLayout } from './CustomerAccountLayout'
export function MyBookingsPage() {
  return <CustomerAccountLayout section="bookings" title="Đặt phòng của tôi" description="Theo dõi kỳ lưu trú, thanh toán và yêu cầu hỗ trợ của bạn.">
    <CustomerBookingList CoverImage={ClientTripCover} />
  </CustomerAccountLayout>
}
