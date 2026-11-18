import { Link, useParams } from 'react-router'
import { useCurrentUser } from '@/features/auth'
import { ClientBookingConfirmation } from '@/features/bookings'
import { useCover, usePublicGallery } from '@/features/discovery'
import '@/shared/styles/hotel-stay-detail.css'
import '@/shared/styles/client-checkout.css'

export function BookingConfirmationPage() {
  const { hotelId = '', bookingId = '' } = useParams()
  const { currentUser } = useCurrentUser()
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  const gallery = usePublicGallery(uuid.test(hotelId) && uuid.test(bookingId) && currentUser ? hotelId : '')
  const cover = useCover((gallery.data?.images.find(image => image.cover) ?? gallery.data?.images[0])?.mediaId)
  if (!uuid.test(hotelId) || !uuid.test(bookingId)) return <div className="client-checkout" role="alert">Không tìm thấy đơn đặt phòng. <Link to="/my-bookings">Xem đơn đặt phòng của tôi</Link></div>
  if (!currentUser) return <div className="client-checkout" role="status">Đang tải tài khoản…</div>
  return <ClientBookingConfirmation key={`${currentUser.id}-${bookingId}`} hotelId={hotelId} bookingId={bookingId} customerId={currentUser.id} coverUrl={cover.data?.url} />
}
