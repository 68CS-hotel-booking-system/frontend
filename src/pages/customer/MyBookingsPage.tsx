import { useSearchParams } from 'react-router'
import { CustomerBookingList } from '@/features/bookings'
import { ClientSavedStays, ClientTripCover, useClientHomeContext } from '@/features/discovery'
import { CustomerAccountLayout } from './CustomerAccountLayout'

export function MyBookingsPage() {
  const [params] = useSearchParams()
  const showSaved = params.get('section') === 'saved'
  const { savedIds } = useClientHomeContext()
  const savedDescription = savedIds.size
    ? `${savedIds.size} chỗ nghỉ đã lưu trên trình duyệt này.`
    : 'Bấm trái tim khi xem một chỗ nghỉ để lưu vào danh sách này.'

  return <CustomerAccountLayout
    section={showSaved ? 'saved' : 'bookings'}
    title={showSaved ? 'Chỗ nghỉ đã lưu' : 'Đặt phòng của tôi'}
    description={showSaved ? savedDescription : 'Theo dõi kỳ lưu trú, thanh toán và yêu cầu hỗ trợ của bạn.'}
  >
    {showSaved ? <ClientSavedStays inAccount /> : <CustomerBookingList CoverImage={ClientTripCover} />}
  </CustomerAccountLayout>
}
