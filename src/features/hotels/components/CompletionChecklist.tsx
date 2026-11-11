import {
  Button,
  Progress,
  Tag,
} from 'antd'
import {
  ArrowRightOutlined,
  CheckCircleFilled,
  PictureOutlined,
  PlusOutlined,
  ProfileOutlined,
  ShopOutlined,
  TagOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router'
import type { HotelCompletionStatus } from '../context/hotel-workspace-context'
import type { ManagementHotelDetail } from '../model/hotel'
import { HotelStatusBadge } from './HotelStatusBadge'
import { HotelReviewSubmission } from './HotelReviewSubmission'
import { useHotelProfileAccess } from '../hooks/use-hotel-profile-access'

export interface CompletionChecklistProps {
  hotel: ManagementHotelDetail
  completion: HotelCompletionStatus
}

interface ChecklistItemConfig {
  id: keyof HotelCompletionStatus['sections']
  title: string
  description: string
  actionLabel: string
  to: string
  icon: typeof ProfileOutlined
}

export function CompletionChecklist({ hotel, completion }: CompletionChecklistProps) {
  const navigate = useNavigate()
  const { canEditProfile } = useHotelProfileAccess(hotel)

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
      title: 'Thiết lập giá bán theo đêm',
      description: 'Cấu hình bảng giá chuẩn cho các hạng phòng mở bán.',
      actionLabel: 'Đặt giá',
      to: `/hotels/${hotel.id}/pricing`,
      icon: PlusOutlined,
    },
  ]

  // Checklist completion check
  const missingItems = items.filter((item) => !completion.sections[item.id])
  const isComplete = missingItems.length === 0
  const unknownSections = new Set<string>([
    ...(hotel.imageCount === undefined && hotel.coverImageUrl === undefined ? ['photos'] : []),
    ...(hotel.amenityIds === undefined ? ['amenities'] : []),
    ...(hotel.roomTypes === undefined ? ['rooms'] : []),
    ...(hotel.hasConfiguredRates === undefined ? ['pricing'] : []),
  ])
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
            Theo dõi dữ liệu hồ sơ. Quyền phê duyệt và trạng thái mở bán do backend quyết định.
          </p>
        </div>

        {/* Progress & Quick Stats */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div className="text-xs font-bold text-[#0b5f53]">
              {completion.percent}% hoàn tất
            </div>
            <div className="text-[11px] text-[#5f736e]">
              {isComplete ? 'Đã hoàn thiện các mục kiểm tra' : `Còn ${missingItems.length} mục chưa xác minh hoặc hoàn tất`}
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
          const done = completion.sections[item.id]
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
                  {done ? (
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
                      <Tag color="success" className="!text-[10px] !leading-4 !px-1.5 !m-0 !rounded-md">
                        Đã xong
                      </Tag>
                    )}
                    {!done && unknownSections.has(item.id) && (
                      <Tag className="!text-[10px] !leading-4 !px-1.5 !m-0 !rounded-md text-[#5f736e]">
                        Chưa xác minh từ API
                      </Tag>
                    )}
                  </div>
                  <div className="text-[11px] text-[#5f736e] mt-0.5">
                    {item.description}
                  </div>
                </div>
              </div>

              <div className="flex justify-end sm:shrink-0 w-full sm:w-auto pl-10 sm:pl-0">
                <Button
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
                  {canEditProfile ? item.actionLabel : 'Xem nội dung'}
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="p-4 sm:px-6 bg-[#f7fbfa] border-t border-[#eef4f2]">
        <HotelReviewSubmission hotel={hotel} />
      </div>
    </div>
  )
}
