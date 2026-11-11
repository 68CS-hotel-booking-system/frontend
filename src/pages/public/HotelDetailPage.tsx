import { Link, useParams } from 'react-router'
import { Result } from 'antd'
import { HOTEL_DETAIL_DATABASE, HotelDetailView } from '@/features/discovery'
import { PublicHotelPage } from './PublicHotelPage'

export function HotelDetailPage() {
  const { hotelId } = useParams<{ hotelId: string }>()
  if (hotelId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(hotelId)) return <PublicHotelPage key={hotelId} hotelId={hotelId} />
  const preview = hotelId ? HOTEL_DETAIL_DATABASE[hotelId] : undefined
  if (!preview) return <Result status="404" title="Không tìm thấy chỗ nghỉ" extra={<Link to="/explore">Tìm chỗ nghỉ</Link>} />
  return <><div className="container" style={{ paddingBlock: 16 }}><strong>Chỗ nghỉ minh họa — chưa nhận đặt phòng.</strong> <Link to="/explore">Tìm khách sạn đang mở bán</Link></div><HotelDetailView key={preview.id} hotel={preview} /></>
}
