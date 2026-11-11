import { Tag } from 'antd'
import type { HotelReviewStatus } from '../api/hotel-review-api'

const hotelReviewStatusLabels: Record<HotelReviewStatus, string> = {
  PENDING: 'Chờ xét duyệt', APPROVED: 'Đã duyệt', REJECTED: 'Cần bổ sung',
}
export function HotelReviewStatusBadge({ status }: { status: HotelReviewStatus }) {
  return <Tag color={status === 'PENDING' ? 'processing' : status === 'APPROVED' ? 'success' : 'warning'}>{hotelReviewStatusLabels[status]}</Tag>
}
