import { useRef } from 'react'
import {
  AppstoreOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons'
import { VibeSvgIcon } from '@/features/discovery/components/StayVibeIcons'
import type {
  VibeCategoryItem,
  VibeIconKey,
} from '@/features/discovery/data/stayvibe-mock-data'

interface VibeFilterBarProps {
  categories: VibeCategoryItem[]
  selectedVibe: VibeIconKey | 'ALL'
  onSelectVibe: (vibeId: VibeIconKey | 'ALL') => void
  totalMatchingCount: number
}

export function VibeFilterBar({
  categories,
  selectedVibe,
  onSelectVibe,
  totalMatchingCount,
}: VibeFilterBarProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)

  function handleScroll(direction: 'left' | 'right') {
    if (!scrollContainerRef.current) return
    const offset = direction === 'left' ? -280 : 280
    scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' })
  }

  return (
    <section
      id="vibe-section"
      className="stayvibe-vibe-section"
      aria-label="Lọc nhanh theo phong cách lưu trú"
    >
      <div className="stayvibe-vibe-bar-header">
        <div>
          <h2 className="stayvibe-section-eyebrow">PHONG CÁCH LƯU TRÚ</h2>
          <p className="stayvibe-vibe-subtext">
            Chọn đúng chất kỳ nghỉ của bạn — đang có{' '}
            <strong>{totalMatchingCount}</strong> chỗ nghỉ phù hợp
          </p>
        </div>

        <div className="stayvibe-scroll-controls">
          <button
            type="button"
            className="vibe-scroll-arrow"
            aria-label="Cuộn danh sách phong cách sang trái"
            onClick={() => handleScroll('left')}
          >
            <LeftOutlined aria-hidden="true" />
          </button>
          <button
            type="button"
            className="vibe-scroll-arrow"
            aria-label="Cuộn danh sách phong cách sang phải"
            onClick={() => handleScroll('right')}
          >
            <RightOutlined aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="stayvibe-vibe-track"
        role="group"
        aria-label="Chọn phong cách lưu trú"
      >
        <button
          type="button"
          className={`stayvibe-style-chip ${
            selectedVibe === 'ALL' ? 'is-selected' : ''
          }`}
          aria-pressed={selectedVibe === 'ALL'}
          onClick={() => onSelectVibe('ALL')}
        >
          <span className="stayvibe-style-chip__icon" aria-hidden="true">
            <AppstoreOutlined />
          </span>
          <span className="stayvibe-style-chip__content">
            <span className="stayvibe-style-chip__label">Tất cả</span>
            <span className="stayvibe-style-chip__meta">Mọi phong cách</span>
          </span>
        </button>

        {categories.map((category) => {
          const isSelected = selectedVibe === category.icon
          return (
            <button
              key={category.id}
              type="button"
              className={`stayvibe-style-chip ${
                isSelected ? 'is-selected' : ''
              }`}
              aria-pressed={isSelected}
              onClick={() =>
                onSelectVibe(isSelected ? 'ALL' : category.icon)
              }
            >
              <span className="stayvibe-style-chip__icon">
                <VibeSvgIcon icon={category.icon} />
              </span>
              <span className="stayvibe-style-chip__content">
                <span className="stayvibe-style-chip__label">
                  {category.label}
                </span>
                <span className="stayvibe-style-chip__meta">
                  {category.subLabel}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
