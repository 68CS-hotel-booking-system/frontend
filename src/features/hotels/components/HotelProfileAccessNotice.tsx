import { Alert, Button, Space } from 'antd'
import { Link } from 'react-router'
import type { ManagementHotelDetail } from '../model/hotel'
import { useHotelProfileAccess } from '../hooks/use-hotel-profile-access'

export function HotelProfileAccessNotice({ hotel }: { hotel: ManagementHotelDetail }) {
  const { canEditProfile, isAdmin, readOnlyReason, latestReview, reviewQuery } = useHotelProfileAccess(hotel)
  if (canEditProfile || (!isAdmin && reviewQuery.isLoading)) return null
  return <Alert type={reviewQuery.isError ? 'warning' : 'info'} showIcon className="!mb-5"
    title={isAdmin ? 'Quyền xét duyệt · Không sửa nội dung hồ sơ' : 'Nội dung hồ sơ đang chỉ đọc'}
    description={<div className="space-y-2"><p className="m-0">{readOnlyReason}</p><Space wrap>
      {latestReview && <Link to={`/hotel-review-requests/${latestReview.id}`}>Xem bản hồ sơ đã gửi</Link>}
      {reviewQuery.isError && <Button size="small" onClick={() => void reviewQuery.refetch()}>Tải lại trạng thái</Button>}
    </Space></div>} />
}
