import { ArrowRightOutlined, EnvironmentFilled } from '@ant-design/icons'
import type { BentoDestinationItem } from '../model/discovery'

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
      className="w-full my-6 sm:my-8"
      aria-labelledby="bento-section-heading"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 mb-6">
        <div>
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#A67C37]">
            ĐIỂM ĐẾN NỔI BẬT
          </span>
          <h2 id="bento-section-heading" className="font-editorial text-2xl sm:text-3xl font-semibold text-[#141413] mt-1">
            Khám phá điểm đến thịnh hành
          </h2>
          <p className="text-xs sm:text-sm text-[#7A7468] mt-1">
            Những tọa độ du lịch trải nghiệm được yêu thích nhất mùa này.
          </p>
        </div>

        {selectedCityId !== 'ALL' && (
          <button
            type="button"
            className="text-xs font-semibold px-3.5 py-1.5 rounded-full border border-[#CFC7B8] text-[#524E46] hover:border-[#A67C37] hover:text-[#A67C37] transition cursor-pointer"
            onClick={() => onSelectCity('ALL')}
          >
            Xem tất cả điểm đến
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6" role="list">
        {destinations.map((item) => {
          const isSelected = selectedCityId === item.id
          const isSingle = destinations.length === 1

          return (
            <article
              key={item.id}
              role="listitem"
              className={`group relative overflow-hidden rounded-2xl bg-[#141413] text-white flex flex-col justify-between p-6 sm:p-8 min-h-[300px] sm:min-h-[350px] border border-[#DECBA4]/30 shadow-lg hover:shadow-xl transition-all duration-300 ${
                isSingle ? 'col-span-full min-h-[340px] sm:min-h-[380px]' : ''
              } ${isSelected ? 'ring-2 ring-[#A67C37]' : ''}`}
            >
              <img
                src={item.imageUrl}
                alt={`Điểm đến ${item.cityName}`}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 pointer-events-none"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/20 group-hover:from-black/95 transition-colors duration-300 pointer-events-none"
                aria-hidden="true"
              />

              <div className="relative z-10 flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-xs font-medium">
                  <EnvironmentFilled className="text-[#E5C98B]" aria-hidden="true" /> {item.badgeText}
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-sm bg-[#A67C37] text-white text-[10px] font-bold tracking-wider uppercase">
                  {item.highlightVibe}
                </span>
              </div>

              <div className="relative z-10 flex flex-col items-start gap-1">
                <h3 className="font-editorial text-2xl sm:text-3xl font-semibold !text-white">
                  {item.cityName}
                </h3>
                <p className="text-xs sm:text-sm text-white/90">
                  {item.tagline}
                </p>
                {item.description && (
                  <p className="text-xs text-white/80 line-clamp-2 max-w-xl my-1">
                    {item.description}
                  </p>
                )}

                <button
                  type="button"
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-black/60 backdrop-blur-md border border-white/25 text-xs font-bold !text-white hover:bg-[#A67C37] hover:border-[#E5C98B] transition-all duration-200 cursor-pointer"
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
