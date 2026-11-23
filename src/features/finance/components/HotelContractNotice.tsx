import { Alert, Button } from 'antd'
import { Link } from 'react-router'
import { useFinanceDashboard } from '../hooks/use-finance-dashboard'
import { contractSalesLabels, isContractEndingSoon } from '../model/contract-status'

export function HotelContractNotice({ hotelId }: { hotelId: string }) {
  const { query, canView, isAdmin } = useFinanceDashboard()
  if (!canView) return null
  if (query.isPending) return <p role="status" className="muted">Đang tải trạng thái hợp đồng…</p>
  if (query.isError) return <Alert type="warning" showIcon title="Chưa tải được trạng thái hợp đồng"
    action={<Button loading={query.isFetching} onClick={() => void query.refetch()}>Thử lại</Button>} />
  const hotel = query.data.hotels.find(item => item.hotelId === hotelId)
  if (!hotel) return null
  const soon = hotel.contractStatus === 'EFFECTIVE' && isContractEndingSoon(hotel.endsAt, query.dataUpdatedAt)
  const title = hotel.acceptingBookings
    ? soon ? 'Hợp đồng sắp hết hạn' : 'Hợp đồng còn hiệu lực · Đang mở bán'
    : `${contractSalesLabels[hotel.contractStatus] ?? 'Chưa xác định hợp đồng'} · Đã ngừng bán`
  const nextStep = isAdmin
    ? 'Chuẩn bị và kích hoạt hợp đồng kế tiếp để tiếp tục nhận đặt phòng.'
    : 'Liên hệ quản trị viên để cập nhật hợp đồng sau khi hai bên thống nhất gia hạn.'
  const description = hotel.contractStatus === 'EFFECTIVE' && !hotel.acceptingBookings
    ? 'Hợp đồng còn hiệu lực. Kiểm tra hồ sơ và trạng thái khách sạn để mở bán.'
    : hotel.acceptingBookings && !soon
      ? 'Khách sạn được nhận đặt phòng mới. Các đơn đã tạo giữ điều khoản tại thời điểm đặt.'
      : `${nextStep} Các đơn đã tạo vẫn được phục vụ theo điều kiện của đơn.`
  return <Alert type={hotel.acceptingBookings && !soon ? 'success' : 'warning'} showIcon title={title}
    description={<div className="space-y-2"><p className="m-0">{description}</p>
      {hotel.endsAt && <p className="m-0">Thời điểm kết thúc: {new Date(hotel.endsAt).toLocaleString('vi-VN')}</p>}
      <Link to={`/contracts?hotelId=${hotelId}`}>{isAdmin ? 'Quản lý hợp đồng' : 'Xem hợp đồng'}</Link>
    </div>} />
}
