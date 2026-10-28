import { useState } from 'react'
import {
  CompassOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  FileProtectOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  SettingOutlined,
  StarFilled,
} from '@ant-design/icons'
import { Button, Input, Select, Space, Tag } from 'antd'
import { useNavigate } from 'react-router'
import { CreateAdminHotelDrawer } from '@/features/hotels/components/CreateAdminHotelDrawer'
import { HotelStatusBadge } from '@/features/hotels/components/HotelStatusBadge'
import {
  useCitiesQuery,
  useManagementHotelsQuery,
} from '@/features/hotels/hooks/use-hotel-management'
import {
  type HotelStatus,
  hotelStatusValues,
} from '@/features/hotels/types/hotel-management'
import { DataSourceBanner } from '@/shared/ui/DataSourceBanner'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { PageLoading } from '@/shared/ui/PageLoading'

const STATUS_FILTER_LABELS: Record<HotelStatus, string> = {
  ACTIVE: 'Đang hoạt động',
  PENDING_APPROVAL: 'Chờ phê duyệt',
  DRAFT: 'Bản nháp',
  REJECTED: 'Từ chối duyệt',
  SUSPENDED: 'Tạm đình chỉ',
}

const VIBE_CHIPS = [
  'ALL',
  'Glamping',
  'Boutique Art',
  'Pool Party',
  'Pet-friendly',
  'Workation',
  'Sát biển',
  'Eco Retreat',
  'Rooftop Chill',
] as const

export function HotelManagementListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [cityId, setCityId] = useState<string | undefined>(undefined)
  const [status, setStatus] = useState<HotelStatus | 'ALL'>('ALL')
  const [keyword, setKeyword] = useState('')
  const [vibe, setVibe] = useState<string>('ALL')
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false)

  const citiesQuery = useCitiesQuery()
  const hotelsQuery = useManagementHotelsQuery({
    page,
    size: 6,
    cityId,
    status,
    keyword,
    vibe,
  })

  function resetFilters() {
    setPage(0)
    setCityId(undefined)
    setStatus('ALL')
    setKeyword('')
    setVibe('ALL')
  }

  const cities = citiesQuery.data ?? []

  return (
    <div className="management-page rates-management-page">
      <DataSourceBanner />

      <header className="rates-page-header" aria-labelledby="mgmt-hero-title">
        <div className="rates-page-header__content">
          <span className="rates-page-header__kicker">
            <CompassOutlined aria-hidden="true" /> QUẢN LÝ CƠ SỞ LƯU TRÚ
          </span>
          <h1 id="mgmt-hero-title" className="rates-page-header__title">
            Không gian Quản trị &amp; Vận hành Khách sạn
          </h1>
          <p className="rates-page-header__desc">
            Quản lý hồ sơ khách sạn, cấu hình tiện ích, theo dõi bảng giá phòng
            theo ngày và đối soát hợp đồng tài chính.
          </p>
        </div>
        <div className="rates-page-header__actions">
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined aria-hidden="true" />}
            onClick={() => setCreateDrawerOpen(true)}
          >
            Tạo khách sạn mới
          </Button>
          <Button
            size="large"
            icon={<ReloadOutlined aria-hidden="true" />}
            loading={hotelsQuery.isFetching}
            onClick={() => void hotelsQuery.refetch()}
          >
            Làm mới
          </Button>
        </div>
      </header>

      <section
        className="smart-filter-panel"
        aria-label="Bộ lọc tìm kiếm khách sạn vận hành"
      >
        <div className="smart-filter-panel__row">
          <div className="smart-filter-panel__search">
            <label htmlFor="hotel-search-input">Tìm theo tên, địa chỉ hoặc chủ sở hữu</label>
            <Input
              id="hotel-search-input"
              allowClear
              prefix={<SearchOutlined aria-hidden="true" />}
              placeholder="Ví dụ: InterContinental, Đà Lạt, Glamping..."
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value)
                setPage(0)
              }}
            />
          </div>

          <div className="smart-filter-panel__select">
            <label htmlFor="hotel-city-filter">Thành phố</label>
            <Select
              id="hotel-city-filter"
              allowClear
              placeholder="Tất cả thành phố"
              value={cityId}
              onChange={(value) => {
                setCityId(value)
                setPage(0)
              }}
              className="full-width"
              options={cities.map((c) => ({
                label: c.name,
                value: c.id,
              }))}
            />
          </div>

          <div className="smart-filter-panel__select">
            <label htmlFor="hotel-status-filter">Trạng thái hoạt động</label>
            <Select
              id="hotel-status-filter"
              value={status}
              onChange={(value) => {
                setStatus(value)
                setPage(0)
              }}
              className="full-width"
              options={[
                { label: 'Tất cả trạng thái', value: 'ALL' },
                ...hotelStatusValues.map((s) => ({
                  label: STATUS_FILTER_LABELS[s],
                  value: s,
                })),
              ]}
            />
          </div>
        </div>

        <div className="vibe-chips-bar" role="group" aria-label="Lọc nhanh theo phong cách">
          {VIBE_CHIPS.map((chip) => {
            const isSelected = vibe === chip
            return (
              <button
                key={chip}
                type="button"
                className={`vibe-chip ${isSelected ? 'is-active' : ''}`}
                aria-pressed={isSelected}
                onClick={() => {
                  setVibe(chip)
                  setPage(0)
                }}
              >
                {chip === 'ALL' ? 'Tất cả phong cách' : chip}
              </button>
            )
          })}
        </div>
      </section>

      {hotelsQuery.isPending ? (
        <PageLoading />
      ) : hotelsQuery.isError ? (
        <div className="surface-card">
          <ErrorState
            error={hotelsQuery.error}
            retrying={hotelsQuery.isFetching}
            onRetry={() => void hotelsQuery.refetch()}
          />
        </div>
      ) : hotelsQuery.data.content.length === 0 ? (
        <div className="surface-card">
          <EmptyState
            title="Không tìm thấy khách sạn phù hợp"
            description="Thử xóa bộ lọc tìm kiếm hoặc khởi tạo hồ sơ khách sạn mới trong danh mục."
            action={
              <Space>
                <Button onClick={resetFilters}>Xóa bộ lọc</Button>
                <Button type="primary" onClick={() => setCreateDrawerOpen(true)}>
                  Tạo khách sạn mới
                </Button>
              </Space>
            }
          />
        </div>
      ) : (
        <>
          <div className="results-summary-bar">
            <span>
              Hiển thị <strong>{hotelsQuery.data.content.length}</strong> /{' '}
              <strong>{hotelsQuery.data.totalElements}</strong> khách sạn
            </span>
          </div>

          <div className="hotel-cards-grid" role="list">
            {hotelsQuery.data.content.map((hotel) => (
              <article
                key={hotel.id}
                role="listitem"
                className="hotel-vibe-card"
              >
                <div className="hotel-vibe-card__media">
                  {hotel.coverImageUrl ? (
                    <img
                      src={hotel.coverImageUrl}
                      alt={hotel.name}
                      loading="lazy"
                      className="hotel-vibe-card__img"
                    />
                  ) : (
                    <div className="hotel-vibe-card__placeholder" aria-hidden="true">
                      StayVibe
                    </div>
                  )}
                  <div className="hotel-vibe-card__top-badges">
                    <HotelStatusBadge status={hotel.status} />
                    {hotel.starRating && (
                      <span className="star-pill">
                        <StarFilled aria-hidden="true" /> {hotel.starRating} sao
                      </span>
                    )}
                  </div>
                </div>

                <div className="hotel-vibe-card__body">
                  <div className="hotel-vibe-card__location">
                    <EnvironmentOutlined aria-hidden="true" />{' '}
                    <span>{hotel.cityName ?? 'Việt Nam'}</span>
                    <span className="dot-sep" aria-hidden="true">
                      ·
                    </span>
                    <span>
                      Nhận {hotel.checkInTime.slice(0, 5)} / Trả{' '}
                      {hotel.checkOutTime.slice(0, 5)}
                    </span>
                  </div>

                  <h2 className="hotel-vibe-card__title">
                    <button
                      type="button"
                      className="title-link-btn"
                      onClick={() =>
                        void navigate(`/management/hotels/${hotel.id}`)
                      }
                    >
                      {hotel.name}
                    </button>
                  </h2>

                  <p className="hotel-vibe-card__address">{hotel.address}</p>

                  {hotel.vibeTags && hotel.vibeTags.length > 0 && (
                    <div className="hotel-vibe-card__tags">
                      {hotel.vibeTags.map((tag) => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                    </div>
                  )}

                  <div className="hotel-vibe-card__owner">
                    <span className="muted">Chủ sở hữu:</span>{' '}
                    <strong>{hotel.ownerName ?? 'Chủ sở hữu chính'}</strong>
                  </div>

                  <div className="hotel-vibe-card__actions">
                    <Button
                      type="primary"
                      icon={<SettingOutlined aria-hidden="true" />}
                      onClick={() =>
                        void navigate(`/management/hotels/${hotel.id}?tab=general`)
                      }
                    >
                      Quản trị
                    </Button>
                    <Button
                      icon={<DollarOutlined aria-hidden="true" />}
                      onClick={() =>
                        void navigate(`/management/rates?hotelId=${hotel.id}`)
                      }
                    >
                      Bảng giá
                    </Button>
                    <Button
                      icon={<FileProtectOutlined aria-hidden="true" />}
                      onClick={() =>
                        void navigate(`/management/contracts?hotelId=${hotel.id}`)
                      }
                    >
                      Hợp đồng
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div
            className="pagination-bar"
            role="navigation"
            aria-label="Phân trang danh sách khách sạn"
          >
            <span className="muted">
              Trang {hotelsQuery.data.page + 1} /{' '}
              {Math.max(1, hotelsQuery.data.totalPages)}
            </span>
            <Space>
              <Button
                disabled={hotelsQuery.data.first}
                onClick={() => setPage((prev) => Math.max(0, prev - 1))}
              >
                Trang trước
              </Button>
              <Button
                disabled={hotelsQuery.data.last}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Trang tiếp
              </Button>
            </Space>
          </div>
        </>
      )}

      <CreateAdminHotelDrawer
        open={createDrawerOpen}
        onClose={() => setCreateDrawerOpen(false)}
        cities={cities}
        onCreated={(created) => {
          void navigate(`/management/hotels/${created.id}`)
        }}
      />
    </div>
  )
}
