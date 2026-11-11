import { useHotelWorkspace } from '@/features/hotels'
import { BookingList } from '@/features/bookings'
import { PageHeader } from '@/shared/ui/PageHeader'
export function HotelBookingsPage() {
  const { hotel, hotelId } = useHotelWorkspace()
  if (!hotel) return null
  return <div><PageHeader title="Danh sách đặt phòng" description={`Theo dõi và xử lý đơn tại ${hotel.name}.`} /><BookingList hotelId={hotelId} /></div>
}
