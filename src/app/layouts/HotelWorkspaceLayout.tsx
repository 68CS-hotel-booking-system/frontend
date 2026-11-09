import { Button, Result } from 'antd'
import { Link, Outlet, useLocation, useNavigate, useParams } from 'react-router'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { PageLoading } from '@/shared/ui/PageLoading'
import {
  HotelSubNav,
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
      <div className="hotel-workspace-shell flex flex-col md:flex-row flex-1 min-w-0 -m-4 lg:-m-6">
        {/* CẤP 2: Panel điều hướng bên trái (Desktop & Tablet) */}
        <aside
          className="hidden md:flex w-[230px] shrink-0 bg-white border-r border-[#dce7e3] flex-col h-[calc(100vh-65px)] sticky top-[65px] z-20"
          aria-label="Thanh điều hướng chi tiết khách sạn"
        >
          <HotelSwitcher />
          <HotelSubNav />
        </aside>

        {/* CẤP 2: Thanh Tab cuộn ngang trên Mobile (< 768px) */}
        <div className="md:hidden bg-white border-b border-[#dce7e3] p-2 overflow-x-auto whitespace-nowrap flex items-center gap-1.5 sticky top-[65px] z-20">
          {HOTEL_WORKSPACE_NAV_ITEMS.map((item) => {
            const targetPath = item.path ? `/hotels/${hotelId}/${item.path}` : `/hotels/${hotelId}`
            const isActive = !item.path
              ? location.pathname === `/hotels/${hotelId}` || location.pathname === `/hotels/${hotelId}/`
              : location.pathname.startsWith(targetPath)

            return (
              <Link
                key={item.key}
                to={targetPath}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium no-underline transition-colors shrink-0 ${
                  isActive
                    ? 'bg-[#0b5f53] text-white'
                    : 'bg-[#f4f8f7] text-[#5f736e] hover:text-[#12211d]'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Viewport nội dung trang con */}
        <div className="flex-1 min-w-0 p-4 lg:p-6 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </HotelWorkspaceProvider>
  )
}
