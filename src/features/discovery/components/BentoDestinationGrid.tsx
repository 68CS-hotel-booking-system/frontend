import { ArrowRightOutlined, EnvironmentFilled } from '@ant-design/icons'
import type { BentoDestinationItem } from '@/features/discovery/data/stayvibe-mock-data'

interface BentoDestinationGridProps {
  destinations: BentoDestinationItem[]
  selectedCityId: string | 'ALL'
  onSelectCity: (cityId: string | 'ALL', cityName?: string) => void
}

export function BentoDestinationGrid({
  destinations,
  selectedCityId,
  onSelectCity,
}: BentoDestinationGridProps) {
  return (
    <section
      id="bento-section"
      className="stayvibe-bento-section"
      aria-labelledby="bento-section-heading"
    >
      <div className="stayvibe-section-header">
        <div>
          <span className="stayvibe-section-kicker">ĐIỂM ĐẾN NỔI BẬT</span>
          <h2 id="bento-section-heading" className="stayvibe-section-title">
            Khám phá điểm đến thịnh hành
          </h2>
          <p className="stayvibe-section-desc">
            Những tọa độ du lịch trải nghiệm được yêu thích nhất mùa này.
          </p>
        </div>

        {selectedCityId !== 'ALL' && (
          <button
            type="button"
            className="stayvibe-outline-pill-btn"
            onClick={() => onSelectCity('ALL')}
          >
            Xem tất cả điểm đến
          </button>
        )}
      </div>

      <div className="stayvibe-bento-grid" role="list">
        {destinations.map((item) => {
          const isSelected = selectedCityId === item.id
          return (
            <article
              key={item.id}
              role="listitem"
              className={`stayvibe-bento-card stayvibe-bento-card--${
                item.spanClass
              } ${isSelected ? 'is-selected' : ''}`}
            >
              <img
                src={item.imageUrl}
                alt={`Điểm đến ${item.cityName}`}
                loading="lazy"
                className="stayvibe-bento-card__img"
              />
              <div
                className="stayvibe-bento-card__overlay"
                aria-hidden="true"
              />

              <div className="stayvibe-bento-card__top">
                <span className="stayvibe-bento-glass-badge">
                  <EnvironmentFilled aria-hidden="true" /> {item.badgeText}
                </span>
                <span className="stayvibe-bento-vibe-tag">
                  {item.highlightVibe}
                </span>
              </div>

              <div className="stayvibe-bento-card__bottom">
                <h3 className="stayvibe-bento-card__city">{item.cityName}</h3>
                <p className="stayvibe-bento-card__tagline">{item.tagline}</p>
                {item.spanClass === 'featured' && (
                  <p className="stayvibe-bento-card__desc">{item.description}</p>
                )}

                <button
                  type="button"
                  className="stayvibe-bento-cta"
                  aria-pressed={isSelected}
                  onClick={() =>
                    onSelectCity(isSelected ? 'ALL' : item.id, item.cityName)
                  }
                >
                  <span>
                    {isSelected
                      ? `Đang chọn ${item.cityName}`
                      : `Khám phá ${item.accommodationCount}+ chỗ nghỉ`}
                  </span>
                  <ArrowRightOutlined aria-hidden="true" />
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
