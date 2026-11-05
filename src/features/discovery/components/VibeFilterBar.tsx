import { useRef } from 'react'
import {
  AppstoreOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons'
import { VibeSvgIcon } from './StayVibeIcons'
import type { VibeCategoryItem, VibeIconKey } from '../model/discovery'

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
      className="w-full my-6"
      aria-label="Lọc nhanh theo phong cách lưu trú"
    >
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#A67C37]">
            PHONG CÁCH LƯU TRÚ
          </h2>
          <p className="text-xs sm:text-sm text-[#7A7468] mt-0.5">
            Chọn đúng chất kỳ nghỉ của bạn — đang có{' '}
            <strong className="text-[#141413]">{totalMatchingCount}</strong> chỗ nghỉ phù hợp
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-1.5">
          <button
            type="button"
            className="w-8 h-8 rounded-lg border border-[#E6E1D6] bg-white text-[#524E46] flex items-center justify-center text-xs hover:border-[#A67C37] hover:text-[#A67C37] transition cursor-pointer"
            aria-label="Cuộn danh sách phong cách sang trái"
            onClick={() => handleScroll('left')}
          >
            <LeftOutlined aria-hidden="true" />
          </button>
          <button
            type="button"
            className="w-8 h-8 rounded-lg border border-[#E6E1D6] bg-white text-[#524E46] flex items-center justify-center text-xs hover:border-[#A67C37] hover:text-[#A67C37] transition cursor-pointer"
            aria-label="Cuộn danh sách phong cách sang phải"
            onClick={() => handleScroll('right')}
          >
            <RightOutlined aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex items-center gap-3 overflow-x-auto pb-2 scroll-smooth"
        role="group"
        aria-label="Chọn phong cách lưu trú"
      >
        <button
          type="button"
          className={`inline-flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all duration-200 shrink-0 cursor-pointer ${
            selectedVibe === 'ALL'
              ? 'bg-[#F9F5EB] border-[#A67C37] ring-1 ring-[#A67C37] shadow-sm'
              : 'bg-white border-[#E6E1D6] hover:border-[#A67C37]/50 hover:bg-[#F3EFE6]/50 hover:-translate-y-0.5'
          }`}
          aria-pressed={selectedVibe === 'ALL'}
          onClick={() => onSelectVibe('ALL')}
        >
          <span
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 transition-colors ${
              selectedVibe === 'ALL'
                ? 'bg-[#141413] text-[#E5C98B] border border-[#A67C37]'
                : 'bg-[#FAF8F5] text-[#524E46] border border-[#E6E1D6]'
            }`}
            aria-hidden="true"
          >
            <AppstoreOutlined />
          </span>
          <span className="flex flex-col text-left">
            <span className="text-xs sm:text-sm font-bold text-[#141413]">Tất cả</span>
            <span className="text-[11px] text-[#7A7468]">Mọi phong cách</span>
          </span>
        </button>

        {categories.map((category) => {
          const isSelected = selectedVibe === category.icon
          return (
            <button
              key={category.id}
              type="button"
              className={`inline-flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all duration-200 shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-[#F9F5EB] border-[#A67C37] ring-1 ring-[#A67C37] shadow-sm'
                  : 'bg-white border-[#E6E1D6] hover:border-[#A67C37]/50 hover:bg-[#F3EFE6]/50 hover:-translate-y-0.5'
              }`}
              aria-pressed={isSelected}
              onClick={() =>
                onSelectVibe(isSelected ? 'ALL' : category.icon)
              }
            >
              <span
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-[#141413] text-[#E5C98B] border border-[#A67C37]'
                    : 'bg-[#FAF8F5] text-[#524E46] border border-[#E6E1D6]'
                }`}
                aria-hidden="true"
              >
                <VibeSvgIcon icon={category.icon} />
              </span>
              <span className="flex flex-col text-left">
                <span className="text-xs sm:text-sm font-bold text-[#141413]">
                  {category.label}
                </span>
                <span className="text-[11px] text-[#7A7468]">
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
