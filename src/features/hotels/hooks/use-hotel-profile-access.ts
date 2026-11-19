import { useCurrentUser } from '@/features/auth'
import type { ManagementHotelDetail } from '../model/hotel'
import { useLatestHotelReview } from './use-hotel-reviews'

export function useHotelProfileAccess(hotel?: ManagementHotelDetail) {
  const { currentUser, isAdmin, isOwner } = useCurrentUser()
  const reviewQuery = useLatestHotelReview(hotel?.id ?? '', Boolean(currentUser))
  const latestReview = reviewQuery.data?.content[0]
  const isPendingReview = latestReview?.status === 'PENDING'
  const ownsHotel = isOwner && currentUser?.id === hotel?.ownerUserId
  const canEditProfile = Boolean(!isAdmin && ownsHotel && reviewQuery.isSuccess && !isPendingReview)
  const readOnlyReason = isAdmin
    ? 'Quản trị viên chỉ xem và xét duyệt hồ sơ. Nội dung khách sạn do chủ sở hữu cập nhật.'
    : isPendingReview
      ? 'Hồ sơ đang chờ xét duyệt. Thông tin, ảnh, tiện ích và cấu hình phòng được tạm khóa chỉnh sửa.'
      : reviewQuery.isError
        ? 'Chưa xác minh được trạng thái xét duyệt. Hãy tải lại trước khi chỉnh sửa.'
        : 'Đang xác minh quyền chỉnh sửa và trạng thái hồ sơ.'
  return { isAdmin, ownsHotel, canEditProfile, isPendingReview, latestReview, reviewQuery, readOnlyReason }
}
