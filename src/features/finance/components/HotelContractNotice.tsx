import { Alert, Button } from 'antd'
import {
  ArrowRightOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import { Link } from 'react-router'
import { useFinanceDashboard } from '../hooks/use-finance-dashboard'
import { contractSalesLabels, isContractEndingSoon } from '../model/contract-status'

export function HotelContractNotice({
  hotelId,
  hideActionLink = false,
}: {
  hotelId: string
  hideActionLink?: boolean
}) {
  const { query, canView, isAdmin } = useFinanceDashboard()
  if (!canView) return null
  if (query.isPending) return <p role="status" className="muted">Đang tải trạng thái hợp đồng…</p>
  if (query.isError) {
    return (
      <Alert
        type="warning"
        showIcon
        title="Chưa tải được trạng thái hợp đồng"
        action={
          <Button loading={query.isFetching} onClick={() => void query.refetch()}>
            Thử lại
          </Button>
        }
      />
    )
  }
  const hotel = query.data.hotels.find((item) => item.hotelId === hotelId)
  if (!hotel) return null
  const soon = hotel.contractStatus === 'EFFECTIVE' && isContractEndingSoon(hotel.endsAt, query.dataUpdatedAt)
  const title = hotel.acceptingBookings
    ? soon
      ? 'Hợp đồng sắp hết hạn'
      : 'Hợp đồng còn hiệu lực · Đang mở bán'
    : `${contractSalesLabels[hotel.contractStatus] ?? 'Chưa xác định hợp đồng'} · Đã ngừng bán`
  const nextStep = isAdmin
    ? 'Chuẩn bị và kích hoạt hợp đồng kế tiếp để tiếp tục nhận đặt phòng.'
    : 'Liên hệ quản trị viên để cập nhật hợp đồng sau khi hai bên thống nhất gia hạn.'
  const description =
    hotel.contractStatus === 'EFFECTIVE' && !hotel.acceptingBookings
      ? 'Hợp đồng còn hiệu lực. Kiểm tra hồ sơ và trạng thái khách sạn để mở bán.'
      : hotel.acceptingBookings && !soon
        ? 'Khách sạn được nhận đặt phòng mới. Các đơn đã tạo giữ điều khoản tại thời điểm đặt.'
        : `${nextStep} Các đơn đã tạo vẫn được phục vụ theo điều kiện của đơn.`

  const isHealthy = hotel.acceptingBookings && !soon

  return (
    <div
      role="alert"
      className={
        isHealthy
          ? 'rounded-2xl border border-[#cde9dc] border-l-4 border-l-[#0f7a5f] bg-[#f7fbf9] px-5 py-4 shadow-2xs'
          : 'rounded-2xl border border-[#f2dec0] border-l-4 border-l-[#b45309] bg-[#fffdf8] px-5 py-4 shadow-2xs'
      }
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <span
            className={
              isHealthy
                ? 'w-9 h-9 rounded-xl bg-[#eaf6f1] text-[#0f7a5f] flex items-center justify-center text-base shrink-0 mt-0.5'
                : 'w-9 h-9 rounded-xl bg-[#fef3c7] text-[#b45309] flex items-center justify-center text-base shrink-0 mt-0.5'
            }
            aria-hidden="true"
          >
            {isHealthy ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
          </span>
          <div className="min-w-0">
            <p className="m-0 text-sm font-bold text-[#12211d]">{title}</p>
            <p className="m-0 mt-1 text-xs sm:text-[13px] text-[#5f736e] leading-relaxed">{description}</p>
            {hotel.endsAt && (
              <p className="m-0 mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-[#344a44] tabular-nums">
                <ClockCircleOutlined aria-hidden="true" />
                <span>Thời điểm kết thúc: {new Date(hotel.endsAt).toLocaleString('vi-VN')}</span>
              </p>
            )}
          </div>
        </div>
        {!hideActionLink && (
          <Link
            to={`/contracts?hotelId=${hotelId}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0b5f53] hover:text-[#08473e] bg-[#eef8f5] hover:bg-[#d9f0ea] border border-[#cde5dd] px-3.5 py-2 rounded-xl no-underline shrink-0 transition-colors self-start sm:self-center"
          >
            <span>{isAdmin ? 'Quản lý hợp đồng' : 'Xem hợp đồng'}</span>
            <ArrowRightOutlined className="text-[10px]" aria-hidden="true" />
          </Link>
        )}
      </div>
    </div>
  )
}
