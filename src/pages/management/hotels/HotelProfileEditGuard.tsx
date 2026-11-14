import type { ReactNode } from 'react'
import { Button, Result } from 'antd'
import { Link } from 'react-router'
import { useCurrentUser } from '@/features/auth'
import { useHotelWorkspace } from '@/features/hotels'
import { useHotelReviewRequests } from '@/features/hotel-review-requests'
import { PageLoading } from '@/shared/ui/PageLoading'
import { ErrorState } from '@/shared/ui/ErrorState'

/** Presentation guard only; backend remains authoritative for every write. */
export function HotelProfileEditGuard({ children, operational = false }: { children: ReactNode; operational?: boolean }) {
  const { hotelId } = useHotelWorkspace()
  const { isAdmin } = useCurrentUser()
  const latest = useHotelReviewRequests(hotelId, 0, 1, !isAdmin && !operational)
  if (isAdmin) return <Result status="info" title="Quản trị viên chỉ xem và xét duyệt hồ sơ" subTitle="Thông tin cơ sở do Owner quản lý. Mở hồ sơ đã gửi để xem nội dung và ra quyết định." extra={<Link to={`/hotels/${hotelId}/review-requests`}><Button type="primary">Xem hồ sơ xét duyệt</Button></Link>} />
  if (operational) return children
  if (latest.isPending) return <PageLoading />
  if (latest.isError) return <ErrorState error={latest.error} onRetry={() => void latest.refetch()} />
  if (latest.data.content[0]?.status === 'PENDING') return <Result status="info" title="Hồ sơ đang chờ xét duyệt" subTitle="Thông tin đã gửi được khóa chỉnh sửa cho đến khi Admin ra quyết định. Giá theo ngày và nghiệp vụ vận hành vẫn được quản lý riêng." extra={<Link to={`/hotels/${hotelId}/review-requests`}><Button type="primary">Theo dõi xét duyệt</Button></Link>} />
  return children
}
