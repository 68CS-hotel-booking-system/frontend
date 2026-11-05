import {
  useDiscoveryHotels,
  type SortOrder,
  BentoDestinationGrid,
  HeroSection,
  HotelCard,
  VibeFilterBar,
  BENTO_DESTINATIONS,
  VIBE_CATEGORIES,
  type StayVibeHotelItem,
} from '@/features/discovery'
import {
  CloseCircleOutlined,
  FilterOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { Button, Select, Space, Tag } from 'antd'
import { useNavigate } from 'react-router'
import type { SmartSearchFormValues } from '@/features/discovery'
import { EmptyState } from '@/shared/ui/EmptyState'

export function StayVibeHomePage() {
  const navigate = useNavigate()

  const {
    selectedVibe, setSelectedVibe, selectedCityId, setSelectedCityId,
    searchKeyword, setSearchKeyword, petFriendlyOnly, setPetFriendlyOnly,
    sortOrder, setSortOrder, wishlistedIds, filteredHotels, selectedVibeLabel,
    selectedCityName, hasActiveFilters, handleResetFilters, handleToggleWishlist,
  } = useDiscoveryHotels()

  function handleSearchSubmit(values: SmartSearchFormValues) {
    setSearchKeyword(values.destination)
    setPetFriendlyOnly(values.petFriendly)
    setSelectedCityId('ALL')

    const hotelsEl = document.getElementById('hotels-section')
    hotelsEl?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function handleInspectHotel(hotel: StayVibeHotelItem) {
    const hasManagementRecord = [
      '11111111-1111-4111-8111-111111111101',
      '22222222-2222-4222-8222-222222222202',
      '33333333-3333-4333-8333-333333333303',
    ].includes(hotel.id)

    if (hasManagementRecord) {
      void navigate(`/management/hotels/${hotel.id}?tab=rates`)
    } else {
      void navigate('/management/rates')
    }
  }

  return (
    <div className="w-full flex flex-col gap-8 sm:gap-12">
      {/* 1. Hero Banner + Thanh tìm kiếm thông minh */}
      <HeroSection
        onSearchSubmit={handleSearchSubmit}
        onResetSearch={handleResetFilters}
        activeDestinationFilter={searchKeyword}
      />

      {/* 2. Lưới Bento khám phá điểm đến thịnh hành */}
      <BentoDestinationGrid
        destinations={BENTO_DESTINATIONS}
        selectedCityId={selectedCityId}
        onSelectCity={(cityId) => {
          setSelectedCityId(cityId)
          setSearchKeyword('')
        }}
      />

      {/* 3. Danh sách chỗ nghỉ nổi bật + Thanh lọc nhanh theo phong cách lưu trú */}
      <section
        id="hotels-section"
        className="w-full scroll-mt-24"
        aria-labelledby="hotels-section-heading"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-bold tracking-wider uppercase text-[var(--md-sys-color-primary)]">
              Bộ sưu tập chỗ nghỉ
            </span>
            <h2 id="hotels-section-heading" className="text-xl sm:text-2xl font-bold text-[var(--md-sys-color-on-surface)] mt-1">
              Khu nghỉ dưỡng &amp; Khách sạn tiêu biểu
            </h2>
            <p className="text-xs sm:text-sm text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
              Khám phá danh sách chỗ nghỉ được tuyển chọn với đánh giá cao và tiện nghi đầy đủ.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="m3-btn-tonal !h-9 !px-3.5 !rounded-full !text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <CloseCircleOutlined aria-hidden="true" />
                <span>Xóa bộ lọc ({filteredHotels.length})</span>
              </button>
            )}

            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)]">
              <label htmlFor="stayhub-sort-select" className="flex items-center gap-1 cursor-pointer">
                <FilterOutlined aria-hidden="true" /> Sắp xếp:
              </label>
              <Select<SortOrder>
                id="stayhub-sort-select"
                value={sortOrder}
                onChange={(val) => setSortOrder(val)}
                className="w-48"
                options={[
                  { label: 'Phổ biến nhất', value: 'POPULAR' },
                  { label: 'Giá thấp đến cao', value: 'PRICE_ASC' },
                  { label: 'Điểm đánh giá cao nhất', value: 'RATING_DESC' },
                ]}
              />
            </div>
          </div>
        </div>

        <VibeFilterBar
          categories={VIBE_CATEGORIES}
          selectedVibe={selectedVibe}
          onSelectVibe={(vibe) => setSelectedVibe(vibe)}
          totalMatchingCount={filteredHotels.length}
        />

        {hasActiveFilters && (
          <div
            className="flex items-center gap-2 flex-wrap p-3 rounded-2xl bg-white border border-[var(--md-sys-color-outline-subtle)] mb-6 text-xs text-[var(--md-sys-color-on-surface)]"
            role="status"
            aria-live="polite"
          >
            <span className="text-[var(--md-sys-color-on-surface-variant)] font-medium">Đang lọc theo:</span>
            {selectedVibe !== 'ALL' && (
              <Tag
                closable
                className="!bg-[var(--md-sys-color-secondary-container)] !text-[var(--md-sys-color-on-secondary-container)] !border-transparent !font-semibold !text-xs !rounded-full !px-3 !py-0.5"
                onClose={() => setSelectedVibe('ALL')}
              >
                Phong cách: {selectedVibeLabel}
              </Tag>
            )}
            {selectedCityId !== 'ALL' && (
              <Tag
                closable
                className="!bg-[var(--md-sys-color-secondary-container)] !text-[var(--md-sys-color-on-secondary-container)] !border-transparent !font-semibold !text-xs !rounded-full !px-3 !py-0.5"
                onClose={() => setSelectedCityId('ALL')}
              >
                Điểm đến: {selectedCityName}
              </Tag>
            )}
            {searchKeyword.trim() && (
              <Tag
                closable
                className="!bg-[var(--md-sys-color-secondary-container)] !text-[var(--md-sys-color-on-secondary-container)] !border-transparent !font-semibold !text-xs !rounded-full !px-3 !py-0.5"
                onClose={() => setSearchKeyword('')}
              >
                Từ khóa: &ldquo;{searchKeyword}&rdquo;
              </Tag>
            )}
            {petFriendlyOnly && (
              <Tag
                closable
                className="!bg-[var(--md-sys-color-secondary-container)] !text-[var(--md-sys-color-on-secondary-container)] !border-transparent !font-semibold !text-xs !rounded-full !px-3 !py-0.5"
                onClose={() => setPetFriendlyOnly(false)}
              >
                Thân thiện thú cưng
              </Tag>
            )}
          </div>
        )}

        {filteredHotels.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[var(--md-sys-color-outline-subtle)] p-10 text-center shadow-xs">
            <EmptyState
              title="Không tìm thấy chỗ nghỉ phù hợp"
              description="Thử chọn một phong cách khác, đổi địa điểm hoặc xóa bộ lọc để xem toàn bộ danh sách."
              action={
                <Space>
                  <Button
                    type="primary"
                    icon={<ReloadOutlined aria-hidden="true" />}
                    onClick={handleResetFilters}
                    className="!rounded-full font-semibold"
                  >
                    Xem tất cả chỗ nghỉ
                  </Button>
                </Space>
              }
            />
          </div>
        ) : (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full"
            role="list"
          >
            {filteredHotels.map((hotel) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                isWishlisted={wishlistedIds.includes(hotel.id)}
                onToggleWishlist={handleToggleWishlist}
                onInspectHotel={handleInspectHotel}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
