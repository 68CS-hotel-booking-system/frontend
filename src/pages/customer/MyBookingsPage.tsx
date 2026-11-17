import { BookingList } from '@/features/bookings'
import { CustomerAccountLayout } from './CustomerAccountLayout'
export function MyBookingsPage() {
  return <CustomerAccountLayout section="bookings" title="Đặt phòng của tôi" description="Theo dõi kỳ lưu trú, thanh toán và yêu cầu hỗ trợ của bạn."><BookingList /></CustomerAccountLayout>
}
