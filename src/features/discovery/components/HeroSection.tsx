git fetch originimport {
  CheckCircleFilled,
  SafetyCertificateFilled,
  ThunderboltFilled,
} from '@ant-design/icons'
import {
  SmartSearchBar,
  type SmartSearchFormValues,
} from '@/features/discovery/components/SmartSearchBar'

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
    <section
      className="stayvibe-hero-section"
      aria-labelledby="stayvibe-hero-heading"
    >
      <div className="stayvibe-hero-banner">
        <div className="stayvibe-hero-aurora" aria-hidden="true" />
        <div className="stayvibe-hero-content">
          <div className="stayvibe-hero-badges-row">
            <span className="stayvibe-trend-pill">
              <ThunderboltFilled aria-hidden="true" /> Sovereign Sanctuary Collection
            </span>
            <span className="stayvibe-verified-pill">
              <SafetyCertificateFilled aria-hidden="true" /> Bespoke &amp; Transparent Rates
            </span>
          </div>

          <h1 id="stayvibe-hero-heading" className="stayvibe-hero-title">
            Thử nghiệm deploy mới — mang đậm{' '}
            <span className="stayvibe-gradient-text">dấu ấn độc bản</span> của bạn
          </h1>

          <p className="stayvibe-hero-subtitle">
            Bộ sưu tập tuyển chọn hơn <strong>1.240+</strong> dinh thự nghỉ dưỡng,
            Boutique Di Sản, Cliffside Retreat và Glamping thượng lưu khắp Việt Nam —
            cam kết minh bạch tuyệt đối giá niêm yết và tồn phòng từ hệ thống.
          </p>

          <ul className="stayvibe-hero-trust-list" aria-label="Cam kết nền tảng">
            <li>
              <CheckCircleFilled aria-hidden="true" /> Giá &amp; thuế phí minh
              bạch từ hệ thống
            </li>
            <li>
              <CheckCircleFilled aria-hidden="true" /> Xác nhận quỹ phòng thực tế
              tức thì
            </li>
            <li>
              <CheckCircleFilled aria-hidden="true" /> Tuyển chọn kiến trúc nghỉ
              dưỡng đặc sắc
            </li>
          </ul>
        </div>

        <SmartSearchBar
          onSearchSubmit={onSearchSubmit}
          onResetSearch={onResetSearch}
          activeDestinationFilter={activeDestinationFilter}
        />
      </div>
    </section>
  )
}

