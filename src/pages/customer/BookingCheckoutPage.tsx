import { Alert } from 'antd'
import { Link, useLocation, useParams, useSearchParams } from 'react-router'
import { useCurrentUser } from '@/features/auth'
import { usePublicHotelDetailQuery } from '@/features/hotels'
import { ClientBookingCheckout, parseCheckoutSelection } from '@/features/bookings'
import '@/shared/styles/hotel-stay-detail.css'
import '@/shared/styles/client-checkout.css'

export function BookingCheckoutPage() {
  const { hotelId = '' } = useParams()
  const [params] = useSearchParams()
  const selection = parseCheckoutSelection(hotelId, params)
  const detail = usePublicHotelDetailQuery(selection?.hotelId)
  const user = useCurrentUser()
  const state: unknown = useLocation().state
  const initialPrice = state && typeof state === 'object' && 'totalAmount' in state && typeof state.totalAmount === 'number' && 'currency' in state && typeof state.currency === 'string' ? { totalAmount: state.totalAmount, currency: state.currency } : undefined
  if (!selection) return <div className="client-checkout"><Alert type="warning" title="Lựa chọn đặt phòng chưa hợp lệ" description={<Link to="/">Chọn lại khách sạn, phòng và ngày lưu trú</Link>} /></div>
  if (detail.isLoading || user.isChecking) return <div className="client-checkout" role="status">Đang tải thông tin đặt phòng…</div>
  if (detail.isError || !detail.hotel) return <div className="client-checkout"><Alert type="error" title="Không tải được thông tin khách sạn" action={<button onClick={detail.refetch}>Thử lại</button>} /></div>
  if (!user.currentUser) return <div className="client-checkout"><Alert type="error" title="Không tải được thông tin tài khoản" action={<button onClick={() => void user.refetch()}>Thử lại</button>} /></div>
  const room = detail.roomTypes.find(room => room.id === selection.roomTypeId)
  if (!room) return <div className="client-checkout"><Alert type="warning" title="Hạng phòng không còn được công bố" description={<Link to={`/stays/${hotelId}`}>Quay lại chọn phòng</Link>} /></div>
  return <ClientBookingCheckout key={`${user.currentUser.id}-${JSON.stringify(selection)}`} selection={selection} user={user.currentUser} hotelName={detail.hotel.name} roomName={room.name} initialPrice={initialPrice} />
}
