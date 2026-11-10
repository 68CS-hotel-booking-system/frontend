import { Button, Result } from 'antd'
import { Link, Outlet, useLocation, useNavigate, useParams } from 'react-router'
import { ArrowLeftOutlined, EyeOutlined } from '@ant-design/icons'
import { PageLoading } from '@/shared/ui/PageLoading'
import {
  HotelStatusBadge,
  HotelSwitcher,
  HotelWorkspaceProvider,
  useManagementHotelDetailQuery,
  useHotelImagesQuery,
} from '@/features/hotels'
import { useManagementRoomTypesQuery } from '@/features/rooms'
import { useDataMode } from '@/shared/lib/data-mode-context'
import { HOTEL_WORKSPACE_NAV_ITEMS } from '@/config/navigation.config'

export function HotelWorkspaceLayout() {
  const { hotelId = '' } = useParams<{ hotelId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const detailQuery = useManagementHotelDetailQuery(hotelId)
  const { mode } = useDataMode()
  const roomTypesQuery = useManagementRoomTypesQuery(hotelId, mode === 'api' && detailQuery.isSuccess)
  const imagesQuery = useHotelImagesQuery(hotelId, mode === 'api' && detailQuery.isSuccess)

  if (detailQuery.isPending) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <PageLoading />
      </div>
    )
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <div className="p-8 max-w-xl mx-auto my-12 bg-white rounded-2xl border border-[#dce7e3] shadow-sm">
        <Result
          status="404"
          title="Không tìm thấy khách sạn"
          subTitle="Cơ sở lưu trú này không tồn tại hoặc tài khoản của bạn không có quyền truy cập quản lý."
          extra={
            <Button
              type="primary"
              icon={<ArrowLeftOutlined />}
              onClick={() => void navigate('/hotels')}
              className="!bg-[#0b5f53] !rounded-lg"
            >
              Về danh sách khách sạn
            </Button>
          }
        />
      </div>
    )
  }

  const hotel = {
    ...detailQuery.data,
    ...(mode === 'api' && roomTypesQuery.isSuccess ? {
      roomTypes: roomTypesQuery.data.map((type) => ({ ...type, hotelId, isActive: type.active })),
    } : {}),
    ...(mode === 'api' && imagesQuery.isSuccess ? {
      imageCount: imagesQuery.data.length,
      coverImageUrl: imagesQuery.data.find((image) => image.cover)?.url ?? imagesQuery.data[0]?.url ?? null,
    } : {}),
  }

  return (
    <HotelWorkspaceProvider
      hotel={hotel}
      hotelId={hotelId}
      isLoading={detailQuery.isPending}
      isError={detailQuery.isError}
      error={detailQuery.error}
      refetch={() => void detailQuery.refetch()}
    >
      <div className="hotel-workspace-shell flex flex-col flex-1 min-w-0 -m-4 lg:-m-6">
        {/* HEADER QUẢN LÝ CƠ SỞ & DÀN HÀNG NGANG CÁC HẠNG MỤC */}
        <header
          className="bg-white/95 backdrop-blur-xs border-b border-[#dce7e3] sticky top-[64px] z-30 shadow-xs"
          aria-label="Thanh điều hướng chi tiết khách sạn"
        >
          {/* Hàng 1: Nút đổi khách sạn & Trạng thái hồ sơ & Xem trước web khách */}
          <div className="max-w-6xl mx-auto px-4 lg:px-6 py-2.5 flex items-center justify-between gap-3 border-b border-[#f2f6f5]">
            <div className="flex items-center gap-3 min-w-0">
              <HotelSwitcher />
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              {hotel.status === 'ACTIVE' && (
                <Button
                  type="text"
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => window.open(`/stays/${hotelId}`, '_blank')}
                  className="!text-xs !text-[#0b5f53] !bg-[#eef8f5] hover:!bg-[#e1f2ed] !hidden sm:!inline-flex items-center !rounded-lg !border-0 font-medium"
                >
                  Xem trang khách
                </Button>
              )}
              <HotelStatusBadge status={hotel.status} />
            </div>
          </div>

          {/* Hàng 2: Dàn hàng ngang các hạng mục quản lý */}
          <div className="max-w-6xl mx-auto px-4 lg:px-6">
            <nav
              className="flex items-center gap-1 overflow-x-auto whitespace-nowrap scrollbar-none"
              aria-label="Các hạng mục quản lý khách sạn"
            >
              {HOTEL_WORKSPACE_NAV_ITEMS.map((item) => {
                const targetPath = item.path ? `/hotels/${hotelId}/${item.path}` : `/hotels/${hotelId}`
                const isOverview = !item.path
                const isActive = isOverview
                  ? location.pathname === `/hotels/${hotelId}` || location.pathname === `/hotels/${hotelId}/`
                  : location.pathname.startsWith(targetPath)

                const Icon = item.icon

                // Dynamic badges for operator feedback
                let badgeCount: number | null = null
                if (item.key === 'photos' && typeof hotel.imageCount === 'number') {
                  badgeCount = hotel.imageCount
                } else if (item.key === 'rooms' && Array.isArray(hotel.roomTypes)) {
                  badgeCount = hotel.roomTypes.length
                }

                return (
                  <Link
                    key={item.key}
                    to={targetPath}
                    className={`inline-flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-[13px] font-medium border-b-2 transition-all shrink-0 no-underline rounded-t-lg ${
                      isActive
                        ? 'border-[#0b5f53] text-[#0b5f53] font-semibold bg-[#eef8f5]/70'
                        : 'border-transparent text-[#5f736e] hover:text-[#12211d] hover:bg-[#f7fbfa]'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="text-sm shrink-0" aria-hidden="true" />
                    <span>{item.label}</span>
                    {badgeCount !== null && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                          isActive
                            ? 'bg-[#0b5f53] text-white'
                            : 'bg-[#eef4f2] text-[#55655f]'
                        }`}
                      >
                        {badgeCount}
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>
        </header>

        {/* Viewport nội dung trang con - Luôn căn giữa màn hình */}
        <div className="flex-1 min-w-0 p-4 lg:p-6">
          <div className="max-w-6xl mx-auto w-full">
            <Outlet />
          </div>
        </div>
      </div>
    </HotelWorkspaceProvider>
  )
}
