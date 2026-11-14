import { useHotelWorkspace } from '@/features/hotels'
import { BookingList } from '@/features/bookings'
import { PageHeader } from '@/shared/ui/PageHeader'
export function HotelBookingsPage() {
  const { hotel, hotelId } = useHotelWorkspace()
  if (!hotel) return null
  return <div><PageHeader title="Danh s├ích ─æß║╖t ph├▓ng" description={`Theo d├╡i v├á xß╗¡ l├╜ ─æ╞ín tß║íi ${hotel.name}.`} /><BookingList hotelId={hotelId} /></div>
}
