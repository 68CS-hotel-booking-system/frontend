import { TeamOutlined } from '@ant-design/icons'
import { ManagementPlaceholderPage } from './ManagementPlaceholderPage'

export function HotelStaffPage() {
  return (
    <ManagementPlaceholderPage
      title="Nhân sự khách sạn"
      kicker="QUẢN LÝ NHÂN SỰ"
      description="Tính năng quản lý nhân sự khách sạn đang được hoàn thiện. Vui lòng quay lại sau."
      icon={<TeamOutlined />}
    />
  )
}
