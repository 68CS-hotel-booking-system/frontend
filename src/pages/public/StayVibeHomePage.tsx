import { useMemo, useState } from 'react'
import {
  CloseCircleOutlined,
  FilterOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { Button, Select, Space, Tag } from 'antd'
import { useNavigate } from 'react-router'
import { BentoDestinationGrid } from '@/features/discovery/components/BentoDestinationGrid'
import { HeroSection } from '@/features/discovery/components/HeroSection'
import { HotelCard } from '@/features/discovery/components/HotelCard'
import type { SmartSearchFormValues } from '@/features/discovery/components/SmartSearchBar'
import { VibeFilterBar } from '@/features/discovery/components/VibeFilterBar'
import {
  BENTO_DESTINATIONS,
  STAYVIBE_FEATURED_HOTELS,
  VIBE_CATEGORIES,
  type StayVibeHotelItem,
  type VibeIconKey,
} from '@/features/discovery/data/stayvibe-mock-data'
import { EmptyState } from '@/shared/ui/EmptyState'

type SortOrder = 'POPULAR' | 'PRICE_ASC' | 'RATING_DESC'

export function StayVibeHomePage() {
  const navigate = useNavigate()

  const [selectedVibe, setSelectedVibe] = useState<VibeIconKey | 'ALL'>('ALL')
  const [selectedCityId, setSelectedCityId] = useState<string | 'ALL'>('ALL')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [petFriendlyOnly, setPetFriendlyOnly] = useState(false)
  const [sortOrder, setSortOrder] = useState<SortOrder>('POPULAR')
  const [wishlistedIds, setWishlistedIds] = useState<string[]>([
    '11111111-1111-4111-8111-111111111101',
  ])

  const filteredHotels = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase()

    const matched = STAYVIBE_FEATURED_HOTELS.filter((hotel) => {
      if (selectedVibe !== 'ALL' && !hotel.vibeIds.includes(selectedVibe)) {
        return false
      }
      if (selectedCityId !== 'ALL' && hotel.cityId !== selectedCityId) {
        return false
      }
      if (petFriendlyOnly && !hotel.vibeIds.includes('pet-friendly')) {
        return false
      }
      if (keyword) {
        const inName = hotel.name.toLowerCase().includes(keyword)
        const inCity = hotel.cityName.toLowerCase().includes(keyword)
        const inDistance = hotel.distanceLabel.toLowerCase().includes(keyword)
        if (!inName && !inCity && !inDistance) {
          return false
        }
      }
      return true
    })

    if (sortOrder === 'PRICE_ASC') {
      return [...matched].sort((a, b) => a.pricePerNight - b.pricePerNight)
    }
    if (sortOrder === 'RATING_DESC') {
      return [...matched].sort((a, b) => b.rating - a.rating)
    }
    return matched
  }, [petFriendlyOnly, searchKeyword, selectedCityId, selectedVibe, sortOrder])

  function handleSearchSubmit(values: SmartSearchFormValues) {
    setSearchKeyword(values.destination)
    setPetFriendlyOnly(values.petFriendly)
    setSelectedCityId('ALL')

    const hotelsEl = document.getElementById('hotels-section')
    hotelsEl?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function handleResetFilters() {
    setSelectedVibe('ALL')
    setSelectedCityId('ALL')
    setSearchKeyword('')
    setPetFriendlyOnly(false)
    setSortOrder('POPULAR')
  }

  function handleToggleWishlist(hotelId: string) {
    setWishlistedIds((prev) =>
      prev.includes(hotelId)
        ? prev.filter((id) => id !== hotelId)
        : [...prev, hotelId],
    )
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

  const selectedVibeLabel =
    selectedVibe === 'ALL'
      ? ''
      : (VIBE_CATEGORIES.find((c) => c.icon === selectedVibe)?.label ??
        selectedVibe)
  const selectedCityName =
    selectedCityId === 'ALL'
      ? ''
      : (BENTO_DESTINATIONS.find((d) => d.id === selectedCityId)?.cityName ??
        selectedCityId)

  const hasActiveFilters =
    selectedVibe !== 'ALL' ||
    selectedCityId !== 'ALL' ||
    searchKeyword.trim().length > 0 ||
    petFriendlyOnly

  return (
    <div className="stayvibe-discovery-page">
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
        className="stayvibe-hotels-section"
        aria-labelledby="hotels-section-heading"
      >
        <div className="stayvibe-section-header">
          <div>
            <span className="stayvibe-section-kicker">BỘ SƯU TẬP TUYỂN CHỌN</span>
            <h2 id="hotels-section-heading" className="stayvibe-section-title">
              Khu nghỉ dưỡng &amp; Khách sạn tiêu biểu
            </h2>
            <p className="stayvibe-section-desc">
              Tuyển tập các khu Glamping thượng lưu, Boutique Di Sản và Biệt thự
              biển có điểm đánh giá xuất sắc nhất.
            </p>
          </div>

          <div className="stayvibe-hotels-toolbar">
            {hasActiveFilters && (
              <Button
                icon={<CloseCircleOutlined aria-hidden="true" />}
                onClick={handleResetFilters}
              >
                Xóa bộ lọc ({filteredHotels.length})
              </Button>
            )}

            <div className="stayvibe-sort-box">
              <label htmlFor="stayvibe-sort-select">
                <FilterOutlined aria-hidden="true" /> Sắp xếp:
              </label>
              <Select<SortOrder>
                id="stayvibe-sort-select"
                value={sortOrder}
                onChange={(val) => setSortOrder(val)}
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
            className="stayvibe-active-filters-bar"
            role="status"
            aria-live="polite"
          >
            <span className="muted">Đang lọc theo:</span>
            {selectedVibe !== 'ALL' && (
              <Tag
                closable
                color="gold"
                onClose={() => setSelectedVibe('ALL')}
              >
                Phong cách: {selectedVibeLabel}
              </Tag>
            )}
            {selectedCityId !== 'ALL' && (
              <Tag
                closable
                color="blue"
                onClose={() => setSelectedCityId('ALL')}
              >
                Điểm đến: {selectedCityName}
              </Tag>
            )}
            {searchKeyword.trim() && (
              <Tag
                closable
                color="purple"
                onClose={() => setSearchKeyword('')}
              >
                Từ khóa: &ldquo;{searchKeyword}&rdquo;
              </Tag>
            )}
            {petFriendlyOnly && (
              <Tag
                closable
                color="green"
                onClose={() => setPetFriendlyOnly(false)}
              >
                Thân thiện thú cưng
              </Tag>
            )}
          </div>
        )}

        {filteredHotels.length === 0 ? (
          <div className="surface-card">
            <EmptyState
              title="Không tìm thấy chỗ nghỉ phù hợp"
              description="Thử chọn một phong cách khác, đổi địa điểm hoặc xóa bộ lọc để xem toàn bộ danh sách."
              action={
                <Space>
                  <Button
                    type="primary"
                    icon={<ReloadOutlined aria-hidden="true" />}
                    onClick={handleResetFilters}
                  >
                    Xem tất cả chỗ nghỉ
                  </Button>
                </Space>
              }
            />
          </div>
        ) : (
          <div className="stayvibe-hotels-grid" role="list">
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
