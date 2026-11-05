import { useState } from 'react'
import {
  ArrowRightOutlined,
  CheckOutlined,
  EnvironmentOutlined,
  FireFilled,
  LeftOutlined,
  RightOutlined,
  StarFilled,
  ThunderboltFilled,
} from '@ant-design/icons'
import { HeartVectorIcon } from './StayVibeIcons'
import type { StayVibeHotelItem } from '../model/discovery'
import { formatCurrencyAmount } from '@/shared/lib/format'

interface HotelCardProps {
  hotel: StayVibeHotelItem
  isWishlisted: boolean
  onToggleWishlist: (hotelId: string) => void
  onInspectHotel: (hotel: StayVibeHotelItem) => void
}

export function HotelCard({
  hotel,
  isWishlisted,
  onToggleWishlist,
  onInspectHotel,
}: HotelCardProps) {
  const [imageIndex, setImageIndex] = useState(0)
  const totalImages = hotel.images.length

  function handlePrevImage(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    setImageIndex((prev) => (prev - 1 + totalImages) % totalImages)
  }

  function handleNextImage(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    setImageIndex((prev) => (prev + 1) % totalImages)
  }

  return (
    <article className="group bg-white rounded-2xl border border-[#E6E1D6] p-3.5 flex flex-col gap-3.5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 w-full" role="listitem">
      {/* Media Carousel */}
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#F3EFE6]">
        <img
          src={hotel.images[imageIndex]}
          alt={`${hotel.name} - Ảnh ${imageIndex + 1}/${totalImages}`}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5 z-10">
          {hotel.badge && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#A67C37] text-white text-[11px] font-bold tracking-wider uppercase shadow-sm">
              {hotel.badge.variant === 'discount' ? (
                <FireFilled aria-hidden="true" />
              ) : (
                <ThunderboltFilled aria-hidden="true" />
              )}{' '}
              {hotel.badge.text}
            </span>
          )}
          {hotel.roomsLeftNote && (
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-black/75 text-white text-[10px] font-semibold tracking-wide backdrop-blur-sm">
              {hotel.roomsLeftNote}
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-sm shadow hover:scale-110 active:scale-95 transition-transform cursor-pointer z-10"
          aria-pressed={isWishlisted}
          aria-label={
            isWishlisted
              ? `Bỏ lưu yêu thích ${hotel.name}`
              : `Lưu yêu thích ${hotel.name}`
          }
          onClick={() => onToggleWishlist(hotel.id)}
        >
          <HeartVectorIcon filled={isWishlisted} />
        </button>

        {/* Carousel controls */}
        {totalImages > 1 && (
          <>
            <button
              type="button"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 text-[#141413] flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white shadow cursor-pointer z-10"
              aria-label={`Ảnh trước của ${hotel.name}`}
              onClick={handlePrevImage}
            >
              <LeftOutlined aria-hidden="true" />
            </button>
            <button
              type="button"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 text-[#141413] flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white shadow cursor-pointer z-10"
              aria-label={`Ảnh tiếp theo của ${hotel.name}`}
              onClick={handleNextImage}
            >
              <RightOutlined aria-hidden="true" />
            </button>
            <div
              className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm z-10"
              role="tablist"
              aria-label="Chọn ảnh khách sạn"
            >
              {hotel.images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  role="tab"
                  aria-selected={idx === imageIndex}
                  aria-label={`Ảnh ${idx + 1}`}
                  className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                    idx === imageIndex ? 'bg-white w-3' : 'bg-white/50'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation()
                    setImageIndex(idx)
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Card Info */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#141413] text-white text-xs font-bold">
              <StarFilled className="text-[#E5C98B]" aria-hidden="true" /> {hotel.rating.toFixed(1)}
            </span>
            <span className="text-xs text-[#7A7468]">
              ({hotel.reviewCount} đánh giá)
            </span>
          </div>
          <span className="text-xs font-semibold text-[#524E46] flex items-center gap-1 truncate" title={hotel.distanceLabel}>
            <EnvironmentOutlined aria-hidden="true" /> {hotel.cityName}
          </span>
        </div>

        <h3 className="text-left font-serif text-lg font-bold text-[#141413] hover:text-[#A67C37] transition cursor-pointer line-clamp-1">
          <button
            type="button"
            className="text-left cursor-pointer w-full !text-[#141413] hover:!text-[#A67C37]"
            onClick={() => onInspectHotel(hotel)}
          >
            {hotel.name}
          </button>
        </h3>

        <p className="text-xs text-[#7A7468] line-clamp-1">
          {hotel.distanceLabel}
        </p>

        {/* Amenities */}
        <ul className="flex flex-wrap gap-1.5 my-1 p-0 list-none" aria-label="Tiện ích nổi bật">
          {hotel.amenities.map((amenity) => (
            <li
              key={amenity}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#F9F5EB] border border-[#DECBA4]/50 text-[#524E46] text-[11px] font-medium"
            >
              <CheckOutlined className="text-[#A67C37]" aria-hidden="true" /> {amenity}
            </li>
          ))}
        </ul>

        {/* Price & Action */}
        <div className="flex items-end justify-between gap-3 pt-2 border-t border-[#E6E1D6]/70 mt-1">
          <div className="flex flex-col">
            {hotel.originalPricePerNight && (
              <span className="text-xs text-[#7A7468] line-through tabular-nums">
                {formatCurrencyAmount(
                  hotel.originalPricePerNight,
                  hotel.currency,
                )}
              </span>
            )}
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-[#141413] tabular-nums font-serif">
                {formatCurrencyAmount(hotel.pricePerNight, hotel.currency)}
              </span>
              <span className="text-xs text-[#7A7468]">/ đêm</span>
            </div>
            <span className="text-[10px] text-[#7A7468]">
              {hotel.taxStatusNote}
            </span>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#CFC7B8] text-xs font-bold !text-[#141413] hover:border-[#A67C37] hover:bg-[#F9F5EB] hover:!text-[#A67C37] transition cursor-pointer shrink-0 whitespace-nowrap"
            onClick={() => onInspectHotel(hotel)}
          >
            <span>Chi tiết</span>
            <ArrowRightOutlined aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  )
}
