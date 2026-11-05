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
    <div className="w-full flex flex-col gap-10 sm:gap-14">
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
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#A67C37]">
              BỘ SƯU TẬP TUYỂN CHỌN
            </span>
            <h2 id="hotels-section-heading" className="font-editorial text-2xl sm:text-3xl font-semibold text-[#141413] mt-1">
              Khu nghỉ dưỡng &amp; Khách sạn tiêu biểu
            </h2>
            <p className="text-xs sm:text-sm text-[#7A7468] mt-1">
              Tuyển tập các khu Glamping thượng lưu, Boutique Di Sản và Biệt thự
              biển có điểm đánh giá xuất sắc nhất.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {hasActiveFilters && (
              <Button
                icon={<CloseCircleOutlined aria-hidden="true" />}
                onClick={handleResetFilters}
                className="!text-xs !rounded-md"
              >
                Xóa bộ lọc ({filteredHotels.length})
              </Button>
            )}

            <div className="flex items-center gap-2 text-xs font-semibold text-[#524E46]">
              <label htmlFor="stayvibe-sort-select" className="flex items-center gap-1 cursor-pointer">
                <FilterOutlined aria-hidden="true" /> Sắp xếp:
              </label>
              <Select<SortOrder>
                id="stayvibe-sort-select"
                value={sortOrder}
                onChange={(val) => setSortOrder(val)}
                className="w-44"
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
            className="flex items-center gap-2 flex-wrap p-3 rounded-xl bg-white border border-[#E6E1D6] mb-6 text-xs text-[#524E46]"
            role="status"
            aria-live="polite"
          >
            <span className="text-[#7A7468] font-medium">Đang lọc theo:</span>
            {selectedVibe !== 'ALL' && (
              <Tag
                closable
                className="!bg-[#F9F5EB] !text-[#785718] !border-[#DECBA4] !font-medium !text-xs !rounded-md"
                onClose={() => setSelectedVibe('ALL')}
              >
                Phong cách: {selectedVibeLabel}
              </Tag>
            )}
            {selectedCityId !== 'ALL' && (
              <Tag
                closable
                className="!bg-[#F9F5EB] !text-[#785718] !border-[#DECBA4] !font-medium !text-xs !rounded-md"
                onClose={() => setSelectedCityId('ALL')}
              >
                Điểm đến: {selectedCityName}
              </Tag>
            )}
            {searchKeyword.trim() && (
              <Tag
                closable
                className="!bg-[#F9F5EB] !text-[#785718] !border-[#DECBA4] !font-medium !text-xs !rounded-md"
                onClose={() => setSearchKeyword('')}
              >
                Từ khóa: &ldquo;{searchKeyword}&rdquo;
              </Tag>
            )}
            {petFriendlyOnly && (
              <Tag
                closable
                className="!bg-[#F9F5EB] !text-[#785718] !border-[#DECBA4] !font-medium !text-xs !rounded-md"
                onClose={() => setPetFriendlyOnly(false)}
              >
                Thân thiện thú cưng
              </Tag>
            )}
          </div>
        )}

        {filteredHotels.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E6E1D6] p-10 text-center shadow-sm">
            <EmptyState
              title="Không tìm thấy chỗ nghỉ phù hợp"
              description="Thử chọn một phong cách khác, đổi địa điểm hoặc xóa bộ lọc để xem toàn bộ danh sách."
              action={
                <Space>
                  <Button
                    type="primary"
                    icon={<ReloadOutlined aria-hidden="true" />}
                    onClick={handleResetFilters}
                    className="!bg-[#141413] hover:!bg-[#A67C37]"
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
