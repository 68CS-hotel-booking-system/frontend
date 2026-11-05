import {
  CheckCircleFilled,
  SafetyCertificateFilled,
  ThunderboltFilled,
} from '@ant-design/icons'
import { SmartSearchBar } from './SmartSearchBar'
import type { SmartSearchFormValues } from '../model/search-form-schema'

interface HeroSectionProps {
  onSearchSubmit: (values: SmartSearchFormValues) => void
  onResetSearch: () => void
  activeDestinationFilter: string
}

export function HeroSection({
  onSearchSubmit,
  onResetSearch,
  activeDestinationFilter,
}: HeroSectionProps) {
  return (
    <section aria-labelledby="stayvibe-hero-heading" className="w-full">
      <div className="relative overflow-hidden rounded-2xl bg-[#141413] text-white p-5 sm:p-10 lg:p-12 border border-[#DECBA4]/30 shadow-xl">
        {/* Background Image & Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-[url('https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1800&q=85')] opacity-35"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#141413] via-[#141413]/90 to-[#141413]/60 pointer-events-none"
          aria-hidden="true"
        />

        {/* Content Box */}
        <div className="relative z-10 max-w-3xl mb-8 sm:mb-10">
          <div className="flex flex-wrap items-center gap-2.5 mb-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#A67C37]/25 border border-[#E5C98B]/40 text-[#E5C98B] text-[11px] font-bold tracking-wider uppercase">
              <ThunderboltFilled aria-hidden="true" /> Sovereign Sanctuary Collection
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-white/10 border border-white/20 text-white text-[11px] font-semibold tracking-wider uppercase">
              <SafetyCertificateFilled aria-hidden="true" /> Bespoke &amp; Transparent Rates
            </span>
          </div>

          <h1 id="stayvibe-hero-heading" className="font-editorial text-2xl sm:text-4xl lg:text-5xl font-semibold leading-[1.15] !text-[#FAF8F5] mb-4 tracking-tight">
            Tuyệt tác nghỉ dưỡng mang đậm{' '}
            <span className="text-[#E5C98B] italic font-normal">dấu ấn độc bản</span> của bạn
          </h1>

          <p className="text-sm sm:text-base text-white/85 max-w-2xl leading-relaxed mb-6 font-normal">
            Bộ sưu tập tuyển chọn hơn <strong>1.240+</strong> dinh thự nghỉ dưỡng,
            Boutique Di Sản, Cliffside Retreat và Glamping thượng lưu khắp Việt Nam —
            cam kết minh bạch tuyệt đối giá niêm yết và tồn phòng từ hệ thống.
          </p>

          <ul className="flex flex-col sm:flex-row flex-wrap gap-2.5 sm:gap-6 text-xs sm:text-sm text-white/90 list-none p-0 m-0">
            <li className="inline-flex items-center gap-2">
              <CheckCircleFilled className="text-[#E5C98B]" aria-hidden="true" />
              <span>Giá &amp; thuế phí minh bạch từ hệ thống</span>
            </li>
            <li className="inline-flex items-center gap-2">
              <CheckCircleFilled className="text-[#E5C98B]" aria-hidden="true" />
              <span>Xác nhận quỹ phòng thực tế tức thì</span>
            </li>
            <li className="inline-flex items-center gap-2">
              <CheckCircleFilled className="text-[#E5C98B]" aria-hidden="true" />
              <span>Tuyển chọn kiến trúc nghỉ dưỡng đặc sắc</span>
            </li>
          </ul>
        </div>

        {/* Smart Search Bar */}
        <div className="relative z-10 w-full">
          <SmartSearchBar
            onSearchSubmit={onSearchSubmit}
            onResetSearch={onResetSearch}
            activeDestinationFilter={activeDestinationFilter}
          />
        </div>
      </div>
    </section>
  )
}
