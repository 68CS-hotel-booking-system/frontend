import { useState } from 'react'
import {
  AppstoreOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  SettingOutlined,
  StarFilled,
  UnorderedListOutlined,
} from '@ant-design/icons'
import {
  Button,
  Alert,
  Card,
  Input,
  Pagination,
  Progress,
  Segmented,
  Select,
  Skeleton,
} from 'antd'
import { useNavigate } from 'react-router'
import {
  calculateHotelCompletion,
  HotelStatusBadge,
  useCitiesQuery,
  useManagementHotelsQuery,
  useHotelCoverImage,
  type HotelStatus,
  type ManagementHotelSummary,
} from '@/features/hotels'

function HotelCardCover({ hotel }: { hotel: ManagementHotelSummary }) {
  const { data: coverUrl } = useHotelCoverImage(hotel.id, hotel.coverImageUrl)
  const displayUrl = coverUrl || hotel.coverImageUrl

  if (displayUrl) {
    return (
      <img
        src={displayUrl}
        alt={hotel.name}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
    )
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#e0f1eb] to-[#c7e5dc] text-[#0b5f53]">
      <HomeOutlined className="text-3xl opacity-60 mb-1" />
      <span className="text-[11px] font-semibold opacity-75">Chưa có ảnh bìa</span>
    </div>
  )
}

function HotelCardCompletion({ hotel }: { hotel: ManagementHotelSummary }) {
  const { data: coverUrl } = useHotelCoverImage(hotel.id, hotel.coverImageUrl)
  const displayUrl = coverUrl || hotel.coverImageUrl
  const completion = calculateHotelCompletion(displayUrl ? { ...hotel, coverImageUrl: displayUrl } : hotel)

  return (
    <div className="bg-[#f7fbfa] p-2.5 rounded-xl border border-[#e8f1ee] space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#3b4e49] font-medium">Hoàn thiện hồ sơ</span>
        <span className="font-bold text-[#0b5f53]">{completion.percent}%</span>
      </div>
      <Progress
        percent={completion.percent}
        showInfo={false}
        size={['100%', 4]}
        strokeColor="#0b5f53"
        railColor="#e0e8e6"
        className="!m-0"
      />
    </div>
  )
}

function HotelTableThumbnail({ hotel }: { hotel: ManagementHotelSummary }) {
  const { data: coverUrl } = useHotelCoverImage(hotel.id, hotel.coverImageUrl)
  const displayUrl = coverUrl || hotel.coverImageUrl

  if (displayUrl) {
    return (
      <img
        src={displayUrl}
        alt={hotel.name}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover"
      />
    )
  }

  return <HomeOutlined className="text-[#0b5f53] text-base" />
}

function HotelTableCompletion({ hotel }: { hotel: ManagementHotelSummary }) {
  const { data: coverUrl } = useHotelCoverImage(hotel.id, hotel.coverImageUrl)
  const displayUrl = coverUrl || hotel.coverImageUrl
  const completion = calculateHotelCompletion(displayUrl ? { ...hotel, coverImageUrl: displayUrl } : hotel)

  return (
    <div className="flex items-center gap-2">
      <Progress
        percent={completion.percent}
        showInfo={false}
        size={['100%', 4]}
        strokeColor="#0b5f53"
        railColor="#e0e8e6"
        className="!m-0"
      />
      <span className="text-[11px] font-bold text-[#0b5f53] shrink-0">
        {completion.percent}%
      </span>
    </div>
  )
}
import { PageHeader } from '@/shared/ui/PageHeader'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { useDataMode } from '@/shared/lib/data-mode-context'

type ViewMode = 'card' | 'table'

const STATUS_FILTER_OPTIONS: Array<{ label: string; value: HotelStatus | 'ALL' }> = [
  { label: 'Tất cả trạng thái', value: 'ALL' },
  { label: 'Bản nháp', value: 'DRAFT' },
  { label: 'Chờ duyệt', value: 'PENDING_APPROVAL' },
  { label: 'Đang bán', value: 'ACTIVE' },
  { label: 'Tạm ngưng', value: 'SUSPENDED' },
]

export function HotelManagementListPage() {
  const navigate = useNavigate()
  const { mode } = useDataMode()

  const [page, setPage] = useState(0)
  const [status, setStatus] = useState<HotelStatus | 'ALL'>('ALL')
  const [keyword, setKeyword] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('card')

  const citiesQuery = useCitiesQuery()
  const hotelsQuery = useManagementHotelsQuery({
    page,
    size: 12,
    status,
    keyword,
  })

  const cities = citiesQuery.data ?? []
  const rawHotels = hotelsQuery.data?.content ?? []
  const totalElements = hotelsQuery.data?.totalElements ?? 0
  const totalPages = hotelsQuery.data?.totalPages ?? 1

  // Client-side fallback filter if BE doesn't support keyword/status directly in all modes
  const hotels = mode === 'api' ? rawHotels : rawHotels.filter((h) => {
    if (status !== 'ALL' && h.status !== status) return false
    if (keyword) {
      const q = keyword.toLowerCase().trim()
      const matchName = h.name.toLowerCase().includes(q)
      const matchAddress = h.address?.toLowerCase().includes(q)
      const matchCity = h.cityName?.toLowerCase().includes(q)
      if (!matchName && !matchAddress && !matchCity) return false
    }
    return true
  })

  const resetFilters = () => {
    setPage(0)
    setStatus('ALL')
    setKeyword('')
  }

  const getCityName = (hotel: ManagementHotelSummary) => {
    return (
      hotel.cityName ||
      cities.find((c) => c.id === hotel.cityId)?.name ||
      hotel.address ||
      'Việt Nam'
    )
  }

  return (
    <div className="hotel-management-list-page max-w-7xl mx-auto space-y-6">
      {/* 1. Header */}
      <PageHeader
        breadcrumbItems={[{ label: 'Khách sạn' }]}
        kicker="CƠ SỞ LƯU TRÚ"
        title="Khách sạn"
        description="Theo dõi toàn bộ danh sách khách sạn và khu nghỉ dưỡng trực thuộc đối tác. Quản lý hồ sơ vận hành, loại phòng, giá bán và tiện ích lưu trú."
        extra={
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => navigate('/hotels/new')}
            className="!rounded-xl !bg-[#0b5f53] hover:!bg-[#08473e] !px-6 font-semibold"
          >
            Thêm khách sạn
          </Button>
        }
      />

      {/* 2. Thanh công cụ (Toolbar) */}
      {mode === 'api' && <Alert type="info" showIcon title="Backend hiện hỗ trợ phân trang danh sách quản lý; chưa có tìm kiếm và lọc trạng thái trên toàn bộ khách sạn." />}
      <div className="bg-white p-4 rounded-2xl border border-[#dce7e3] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Ô tìm kiếm theo tên */}
          <Input
            disabled={mode === 'api'}
            placeholder="Tìm kiếm theo tên khách sạn..."
            prefix={<SearchOutlined className="text-[#5f736e]" />}
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value)
              setPage(0)
            }}
            allowClear
            size="large"
            className="w-full sm:max-w-xs rounded-xl"
          />

          {/* Filter trạng thái */}
          <Select
            disabled={mode === 'api'}
            size="large"
            value={status}
            onChange={(val) => {
              setStatus(val)
              setPage(0)
            }}
            className="w-full sm:w-52"
            options={STATUS_FILTER_OPTIONS}
          />

          {(keyword || status !== 'ALL') && (
            <Button
              type="text"
              icon={<ReloadOutlined />}
              onClick={resetFilters}
              className="text-[#0b5f53] text-xs font-semibold self-start sm:self-center"
            >
              Đặt lại
            </Button>
          )}
        </div>

        {/* Chuyển chế độ xem Card / Bảng */}
        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
          <span className="text-xs text-[#5f736e] font-medium mr-1 hidden sm:inline">Chế độ xem:</span>
          <Segmented<ViewMode>
            value={viewMode}
            onChange={setViewMode}
            options={[
              {
                value: 'card',
                icon: <AppstoreOutlined />,
                label: 'Thẻ',
              },
              {
                value: 'table',
                icon: <UnorderedListOutlined />,
                label: 'Bảng',
              },
            ]}
          />
        </div>
      </div>

      {/* 3. Nội dung danh sách theo trạng thái (Loading, Error, Empty, Card/Table) */}
      {hotelsQuery.isPending ? (
        viewMode === 'card' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <Card key={idx} className="rounded-2xl border border-[#dce7e3] overflow-hidden">
                <Skeleton.Image className="!w-full !h-44" active />
                <div className="p-4 space-y-3">
                  <Skeleton active paragraph={{ rows: 2 }} />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="rounded-2xl border border-[#dce7e3] p-6">
            <Skeleton active paragraph={{ rows: 5 }} />
          </Card>
        )
      ) : hotelsQuery.isError ? (
        <Card className="rounded-2xl border border-[#dce7e3] p-6">
          <ErrorState
            error={hotelsQuery.error}
            retrying={hotelsQuery.isFetching}
            onRetry={() => void hotelsQuery.refetch()}
          />
        </Card>
      ) : hotels.length === 0 ? (
        <Card className="rounded-2xl border border-[#dce7e3] p-10 text-center">
          <EmptyState
            title="Chưa có khách sạn nào"
            description="Bạn chưa khởi tạo cơ sở lưu trú nào trên hệ thống hoặc không có khách sạn nào phù hợp với bộ lọc tìm kiếm hiện tại."
            action={
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-5">
                {(keyword || status !== 'ALL') && (
                  <Button size="large" onClick={resetFilters}>
                    Xóa bộ lọc
                  </Button>
                )}
                <Button
                  type="primary"
                  size="large"
                  icon={<PlusOutlined />}
                  onClick={() => navigate('/hotels/new')}
                  className="!bg-[#0b5f53] hover:!bg-[#08473e] !rounded-xl !px-6 font-semibold"
                >
                  Tạo khách sạn đầu tiên
                </Button>
              </div>
            }
          />
        </Card>
      ) : viewMode === 'card' ? (
        /* CHẾ ĐỘ XEM THẺ (CARD GRID) */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {hotels.map((hotel) => {
              const cityName = getCityName(hotel)
              const roomCount = hotel.roomTypeCount ?? 0

              return (
                <div
                  key={hotel.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Quản lý khách sạn ${hotel.name}`}
                  onClick={() => navigate(`/hotels/${hotel.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      navigate(`/hotels/${hotel.id}`)
                    }
                  }}
                  className="group bg-white rounded-2xl border border-[#dce7e3] hover:border-[#0b5f53]/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b5f53] focus-visible:ring-offset-2 transition-all duration-200 overflow-hidden cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    {/* Ảnh bìa & Badges */}
                    <div className="relative h-44 bg-[#eef8f5] overflow-hidden">
                      <HotelCardCover hotel={hotel} />

                      {/* Trạng thái & Hạng sao */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <HotelStatusBadge status={hotel.status} />
                      </div>

                      {hotel.starRating && (
                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-xs text-amber-400 px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 shadow-xs">
                          <StarFilled className="text-[10px]" />
                          <span>{hotel.starRating} sao</span>
                        </div>
                      )}
                    </div>

                    {/* Nội dung chi tiết */}
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="text-base font-bold text-[#12211d] group-hover:text-[#0b5f53] transition-colors truncate m-0">
                          {hotel.name}
                        </h3>
                        <p className="text-xs text-[#5f736e] flex items-center gap-1 mt-1 m-0 truncate">
                          <EnvironmentOutlined className="text-[#0b5f53] shrink-0" />
                          <span>{cityName}</span>
                        </p>
                      </div>

                      {/* Tiến độ hoàn thiện */}
                      <HotelCardCompletion hotel={hotel} />

                      {/* Thông số phòng */}
                      <div className="flex items-center justify-between text-xs text-[#5f736e] pt-1">
                        <span className="flex items-center gap-1.5 font-medium">
                          <HomeOutlined className="text-[#0b5f53]" />
                          <span>{roomCount} loại phòng</span>
                        </span>
                        <span className="text-[11px]">
                          {hotel.checkInTime ? `Check-in ${hotel.checkInTime.slice(0, 5)}` : '14:00'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions chân card */}
                  <div
                    className="p-3 bg-[#fafcfb] border-t border-[#eef4f2] flex items-center justify-between gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      type="text"
                      size="small"
                      icon={<SettingOutlined />}
                      onClick={() => navigate(`/hotels/${hotel.id}`)}
                      className="text-[#0b5f53] font-semibold text-xs hover:!bg-[#eef8f5]"
                    >
                      Quản lý
                    </Button>

                    <Button
                      type="default"
                      size="small"
                      icon={hotel.status === 'ACTIVE' ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                      onClick={() => {
                        navigate(`/hotels/${hotel.id}/info`)
                      }}
                      className="text-xs rounded-lg"
                    >
                      {hotel.status === 'ACTIVE' ? 'Tạm ngưng' : 'Cập nhật'}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Phân trang */}
          {totalPages > 1 && (
            <div className="flex justify-center sm:justify-end pt-4">
              <Pagination
                current={page + 1}
                total={totalElements}
                pageSize={12}
                onChange={(p) => setPage(p - 1)}
                showSizeChanger={false}
              />
            </div>
          )}
        </div>
      ) : (
        /* CHẾ ĐỘ XEM BẢNG (TABLE VIEW) */
        <Card className="rounded-2xl border border-[#dce7e3] overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#f7fbfa] border-b border-[#dce7e3] text-[#5f736e] uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4">Khách sạn / Cơ sở</th>
                  <th className="py-3.5 px-4">Tỉnh / Thành</th>
                  <th className="py-3.5 px-4">Tiêu chuẩn sao</th>
                  <th className="py-3.5 px-4">Trạng thái</th>
                  <th className="py-3.5 px-4">Hoàn thiện</th>
                  <th className="py-3.5 px-4">Loại phòng</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dce7e3]">
                {hotels.map((hotel) => {
                  const cityName = getCityName(hotel)
                  const roomCount = hotel.roomTypeCount ?? 0

                  return (
                    <tr
                      key={hotel.id}
                      tabIndex={0}
                      role="row"
                      aria-label={`Khách sạn ${hotel.name}`}
                      onClick={() => navigate(`/hotels/${hotel.id}`)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          navigate(`/hotels/${hotel.id}`)
                        }
                      }}
                      className="hover:bg-[#f7fbfa] focus-visible:bg-[#eef8f5] focus-visible:outline-none transition-colors cursor-pointer"
                    >
                      {/* Tên & Địa chỉ */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#eef8f5] border border-[#dce7e3] overflow-hidden shrink-0 flex items-center justify-center">
                            <HotelTableThumbnail hotel={hotel} />
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <div className="font-bold text-[#12211d] hover:text-[#0b5f53] truncate">
                              {hotel.name}
                            </div>
                            <div className="text-[11px] text-[#5f736e] truncate">{hotel.address}</div>
                          </div>
                        </div>
                      </td>

                      {/* Tỉnh / Thành */}
                      <td className="py-3 px-4 text-[#12211d] font-medium">{cityName}</td>

                      {/* Tiêu chuẩn sao */}
                      <td className="py-3 px-4">
                        {hotel.starRating ? (
                          <span className="inline-flex items-center gap-1 text-amber-500 font-bold">
                            <StarFilled className="text-[10px]" />
                            <span>{hotel.starRating}</span>
                          </span>
                        ) : (
                          <span className="text-[#5f736e]">Chưa xếp hạng</span>
                        )}
                      </td>

                      {/* Trạng thái */}
                      <td className="py-3 px-4">
                        <HotelStatusBadge status={hotel.status} />
                      </td>

                      {/* % Hoàn thiện */}
                      <td className="py-3 px-4 min-w-[120px]">
                        <HotelTableCompletion hotel={hotel} />
                      </td>

                      {/* Loại phòng */}
                      <td className="py-3 px-4 font-semibold text-[#12211d]">
                        {roomCount} phòng
                      </td>

                      {/* Thao tác */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            type="text"
                            size="small"
                            onClick={() => navigate(`/hotels/${hotel.id}`)}
                            className="text-[#0b5f53] font-semibold text-xs hover:!bg-[#eef8f5]"
                          >
                            Quản lý
                          </Button>
                          <Button
                            type="text"
                            size="small"
                            onClick={() => navigate(`/hotels/${hotel.id}/pricing`)}
                            className="text-[#5f736e] text-xs"
                          >
                            Bảng giá
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
          {totalPages > 1 && (
            <div className="flex justify-end p-4 border-t border-[#dce7e3]">
              <Pagination
                current={page + 1}
                total={totalElements}
                pageSize={12}
                onChange={(p) => setPage(p - 1)}
                showSizeChanger={false}
              />
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
