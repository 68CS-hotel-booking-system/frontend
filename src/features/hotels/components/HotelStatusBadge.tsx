import { Tag } from 'antd'
import type { HotelStatus } from '../types/hotel-management'

const STATUS_META: Record<
  HotelStatus,
  { label: string; color: 'success' | 'processing' | 'default' | 'error' | 'warning' }
> = {
  ACTIVE: { label: 'Đang hoạt động', color: 'success' },
  PENDING_APPROVAL: { label: 'Chờ phê duyệt', color: 'warning' },
  DRAFT: { label: 'Bản nháp', color: 'default' },
  REJECTED: { label: 'Từ chối duyệt', color: 'error' },
  SUSPENDED: { label: 'Tạm đình chỉ', color: 'error' },
}

export function HotelStatusBadge({ status }: { status: HotelStatus }) {
  const meta = STATUS_META[status] ?? { label: status, color: 'default' }
  return <Tag color={meta.color}>{meta.label}</Tag>
}
