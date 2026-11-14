import {
  Button,
  Progress,
  Tag,
} from 'antd'
import {
  ArrowRightOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  PictureOutlined,
  PlusOutlined,
  LoadingOutlined,
  ProfileOutlined,
  ShopOutlined,
  TagOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router'
import { useHotelReviewRequests } from '@/features/hotel-review-requests'
import { useCurrentUser } from '@/features/auth'
import type { HotelCompletionStatus } from '../context/hotel-workspace-context'
import type { ManagementHotelDetail } from '../model/hotel'
import { HotelStatusBadge } from './HotelStatusBadge'

export interface CompletionChecklistProps {
  hotel: ManagementHotelDetail
  completion: HotelCompletionStatus
  onRetry?: () => void
}

interface ChecklistItemConfig {
  id: keyof HotelCompletionStatus['sections']
  title: string
  description: string
  actionLabel: string
  to: string
  icon: typeof ProfileOutlined
}

export function CompletionChecklist({ hotel, completion, onRetry }: CompletionChecklistProps) {
  const navigate = useNavigate()
  const { isAdmin } = useCurrentUser()
  const latestReview = useHotelReviewRequests(hotel.id, 0, 1)
  const reviewStatus = latestReview.data?.content[0]?.status

  const items: ChecklistItemConfig[] = [
    {
      id: 'info',
      title: 'Thông tin cơ bản',
      description: 'Tên khách sạn, địa chỉ, thành phố và mô tả giới thiệu.',
      actionLabel: 'Cập nhật',
      to: `/hotels/${hotel.id}/info`,
      icon: ProfileOutlined,
    },
    {
      id: 'photos',
      title: 'Ảnh đại diện khách sạn',
      description: 'Ảnh đại diện bìa và album không gian nghỉ dưỡng.',
      actionLabel: 'Thêm ảnh',
      to: `/hotels/${hotel.id}/photos`,
      icon: PictureOutlined,
    },
    {
      id: 'amenities',
      title: 'Chọn tiện ích khách sạn',
      description: 'Hồ bơi, wifi tốc độ cao, bãi đỗ xe, bữa sáng...',
      actionLabel: 'Chọn tiện ích',
      to: `/hotels/${hotel.id}/amenities`,
      icon: TagOutlined,
    },
    {
      id: 'rooms',
      title: 'Có ít nhất 1 loại phòng',
      description: 'Thiết lập loại phòng, diện tích, số lượng và sức chứa.',
      actionLabel: 'Tạo phòng',
      to: `/hotels/${hotel.id}/rooms`,
      icon: ShopOutlined,
    },
    {
      id: 'pricing',
      title: 'Thiết lập giá cơ bản',
      description: 'Các hạng phòng đang mở bán cần có giá cơ bản lớn hơn 0. Giá riêng theo ngày được quản lý tại Giá & Tồn kho.',
      actionLabel: 'Cập nhật giá gốc',
      to: `/hotels/${hotel.id}/rooms`,
      icon: PlusOutlined,
    },
    {
      id: 'policies',
      title: 'Giờ nhận và trả phòng',
      description: 'Thiết lập giờ nhận phòng và trả phòng của khách sạn.',
      actionLabel: 'Cập nhật giờ',
      to: `/hotels/${hotel.id}/policies`,
      icon: ClockCircleOutlined,
    },
  ]

  // Checklist completion check
  const states = completion.resourceStates ?? {}
  const missingItems = items.filter((item) => !completion.sections[item.id] && !states[item.id as keyof typeof states])
  const isLoading = Object.values(states).includes('loading')
  const hasError = Object.values(states).includes('error')
  const isComplete = missingItems.length === 0 && !isLoading && !hasError
  const incompleteLabels: Record<string, string> = {
    info: 'Chưa đủ thông tin', photos: 'Chưa có ảnh', amenities: 'Chưa chọn tiện ích',
    rooms: 'Chưa có hạng phòng', pricing: 'Chưa đủ giá cơ bản', policies: 'Chưa đủ giờ nhận/trả',
  }
  const isDraft = hotel.status === 'DRAFT'
  const isPendingApproval = reviewStatus === 'PENDING' || hotel.status === 'PENDING_APPROVAL'
  const isActive = hotel.status === 'ACTIVE'

  return (
    <div className="bg-white rounded-2xl border border-[#dce7e3] overflow-hidden shadow-xs">
      {/* Top Banner */}
      <div className="p-5 md:p-6 border-b border-[#eef4f2] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-white via-white to-[#f4faf8]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-base font-bold text-[#12211d] m-0">
              Checklist hoàn thiện hồ sơ
            </h2>
            <HotelStatusBadge status={hotel.status} />
          </div>
          <p className="text-xs text-[#5f736e] m-0 leading-relaxed">
            Theo dõi tiến độ hoàn thiện hồ sơ. Khách sạn cần được phê duyệt trước khi mở bán.
          </p>
        </div>

        {/* Progress & Quick Stats */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div className="text-xs font-bold text-[#0b5f53]">
              {completion.percent}% hoàn tất
            </div>
            <div className="text-[11px] text-[#5f736e]">
              {isLoading ? 'Đang tải hồ sơ…' : hasError ? 'Chưa tải đủ hồ sơ' : isComplete ? 'Đã hoàn thiện các mục kiểm tra' : `Còn ${missingItems.length} mục cần hoàn thiện`}
            </div>
          </div>
          <Progress
            type="circle"
            percent={completion.percent}
            size={48}
            strokeColor="#0b5f53"
            railColor="#e0e8e6"
          />
        </div>
      </div>

      {/* Checklist items list */}
      <div className="divide-y divide-[#eef4f2]">
        {items.map((item, index) => {
          const state = states[item.id as keyof typeof states]
          const done = !state && completion.sections[item.id]
          const Icon = item.icon

          return (
            <div
              key={item.id}
              className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 hover:bg-[#fafcfb] transition-colors"
            >
              <div className="flex items-start sm:items-center gap-3 min-w-0">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 ${
                    done
                      ? 'bg-[#d9f0ea] text-[#0b5f53]'
                      : 'bg-[#f0f4f2] text-[#8c9e99]'
                  }`}
                  aria-hidden="true"
                >
                  {state === 'loading' ? <LoadingOutlined /> : done ? (
                    <CheckCircleFilled className="text-sm" />
                  ) : (
                    <span className="text-xs font-semibold">{index + 1}</span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-[#12211d] flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className="inline-flex items-center gap-1.5">
                      <Icon className="text-[#5f736e] text-xs" />
                      <span>{item.title}</span>
                    </span>
                    {done && (
                      <Tag color="success" className="!text-xs !leading-4 !px-1.5 !m-0 !rounded-lg">
                        Đã xong
                      </Tag>
                    )}
                    {!done && (
                      <Tag color={state === 'error' ? 'error' : 'default'} className="!text-xs !leading-4 !px-1.5 !m-0 !rounded-lg">
                        {state === 'loading' ? 'Đang tải…' : state === 'error' ? 'Không thể tải dữ liệu' : incompleteLabels[item.id]}
                      </Tag>
                    )}
                  </div>
                  <div className="text-[11px] text-[#5f736e] mt-0.5">
                    {item.description}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 sm:shrink-0 w-full sm:w-auto pl-10 sm:pl-0">
                {state === 'error' && onRetry && <Button size="small" onClick={onRetry}>Thử lại</Button>}
                <Button
                  disabled={isAdmin || isPendingApproval}
                  size="small"
                  type={done ? 'default' : 'primary'}
                  onClick={() => navigate(item.to)}
                  icon={<ArrowRightOutlined />}
                  className={`w-full sm:w-auto !rounded-lg text-xs font-semibold ${
                    done
                      ? '!text-[#344a44] hover:!text-[#0b5f53]'
                      : '!bg-[#0b5f53] hover:!bg-[#08473e]'
                  }`}
                >
                  {item.actionLabel}
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Action Footer */}
      <div className="p-4 sm:px-6 bg-[#f7fbfa] border-t border-[#eef4f2] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-xs text-[#5f736e]">
          {isDraft && !isPendingApproval && (
            <span className="text-amber-700 font-medium">
              {isAdmin ? 'Xem hồ sơ Owner đã gửi để xét duyệt. Quản trị viên không chỉnh sửa nội dung hồ sơ.' : 'Gửi hồ sơ để quản trị viên xét duyệt. Kết quả và lý do từ chối được lưu trong lịch sử hồ sơ.'}
            </span>
          )}
          {isPendingApproval && (
            <span className="text-blue-700 font-medium flex items-center gap-1.5">
              <ClockCircleOutlined /> Hồ sơ đã được gửi và đang trong hàng đợi phê duyệt của StayHub.
            </span>
          )}
          {isActive && (
            <span className="text-[#0b5f53] font-medium flex items-center gap-1.5">
              <CheckCircleFilled /> Cơ sở lưu trú đang mở bán công khai trên StayHub.
            </span>
          )}
        </div>

        <Button type="primary" onClick={() => navigate(`/hotels/${hotel.id}/review-requests`)}>
          {isAdmin ? 'Xem hồ sơ xét duyệt' : isPendingApproval ? 'Theo dõi xét duyệt' : reviewStatus === 'REJECTED' ? 'Gửi lại hồ sơ' : isDraft ? 'Gửi kiểm duyệt' : 'Theo dõi xét duyệt'}
        </Button>
      </div>
    </div>
  )
}
