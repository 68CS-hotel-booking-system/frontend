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
import { HeartVectorIcon } from '@/features/discovery/components/StayVibeIcons'
import type { StayVibeHotelItem } from '@/features/discovery/data/stayvibe-mock-data'
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
    <article className="stayvibe-hotel-card" role="listitem">
      {/* Khung ảnh 4:3 kèm Carousel, Badge và Nút Yêu thích */}
      <div className="stayvibe-hotel-card__media">
        <img
          src={hotel.images[imageIndex]}
          alt={`${hotel.name} - Ảnh ${imageIndex + 1}/${totalImages}`}
          loading="lazy"
          className="stayvibe-hotel-card__img"
        />

        {/* Góc trên bên trái: Nhãn giảm giá hoặc xu hướng */}
        <div className="stayvibe-hotel-card__top-left">
          {hotel.badge && (
            <span
              className={`stayvibe-card-badge stayvibe-card-badge--${hotel.badge.variant}`}
            >
              {hotel.badge.variant === 'discount' ? (
                <FireFilled aria-hidden="true" />
              ) : (
                <ThunderboltFilled aria-hidden="true" />
              )}{' '}
              {hotel.badge.text}
            </span>
          )}
          {hotel.roomsLeftNote && (
            <span className="stayvibe-scarcity-badge">
              {hotel.roomsLeftNote}
            </span>
          )}
        </div>

        {/* Góc trên bên phải: Nút Yêu thích (Heart Pop) */}
        <button
          type="button"
          className={`stayvibe-wishlist-btn ${isWishlisted ? 'is-liked' : ''}`}
          aria-pressed={isWishlisted}
          aria-label={
            isWishlisted
              ? `Bỏ lưu yêu thích ${hotel.name}`
              : `Lưu yêu thích ${hotel.name}`
          }
          onClick={() => onToggleWishlist(hotel.id)}
        >
          <span className="stayvibe-wishlist-btn__circle">
            <HeartVectorIcon filled={isWishlisted} />
          </span>
        </button>

        {/* Điều hướng Carousel khi có từ 2 ảnh trở lên */}
        {totalImages > 1 && (
          <>
            <button
              type="button"
              className="stayvibe-carousel-arrow stayvibe-carousel-arrow--prev"
              aria-label={`Ảnh trước của ${hotel.name}`}
              onClick={handlePrevImage}
            >
              <LeftOutlined aria-hidden="true" />
            </button>
            <button
              type="button"
              className="stayvibe-carousel-arrow stayvibe-carousel-arrow--next"
              aria-label={`Ảnh tiếp theo của ${hotel.name}`}
              onClick={handleNextImage}
            >
              <RightOutlined aria-hidden="true" />
            </button>
            <div
              className="stayvibe-carousel-dots"
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
                  className={`stayvibe-carousel-dot ${
                    idx === imageIndex ? 'is-active' : ''
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

      {/* Khối thông tin (Card Body) */}
      <div className="stayvibe-hotel-card__body">
        {/* Hàng 1: Điểm đánh giá + Tag khu vực */}
        <div className="stayvibe-hotel-card__row1">
          <div className="stayvibe-rating-cluster">
            <span className="stayvibe-rating-pill">
              <StarFilled aria-hidden="true" /> {hotel.rating.toFixed(1)}
            </span>
            <span className="stayvibe-review-count">
              ({hotel.reviewCount} đánh giá)
            </span>
          </div>
          <span className="stayvibe-distance-tag" title={hotel.distanceLabel}>
            <EnvironmentOutlined aria-hidden="true" /> {hotel.cityName}
          </span>
        </div>

        {/* Hàng 2: Tên khách sạn (H3 - 20px Bold) */}
        <h3 className="stayvibe-hotel-card__title">
          <button
            type="button"
            className="stayvibe-card-title-btn"
            onClick={() => onInspectHotel(hotel)}
          >
            {hotel.name}
          </button>
        </h3>

        <p className="stayvibe-hotel-card__location-sub">
          {hotel.distanceLabel}
        </p>

        {/* Hàng 3: Tối đa 3 chip tiện ích nổi bật */}
        <ul
          className="stayvibe-hotel-card__amenities"
          aria-label="Tiện ích nổi bật"
        >
          {hotel.amenities.map((amenity) => (
            <li key={amenity} className="stayvibe-amenity-chip">
              <CheckOutlined aria-hidden="true" /> {amenity}
            </li>
          ))}
        </ul>

        {/* Hàng 4: Khu vực giá (tabular-nums) + Nút hành động */}
        <div className="stayvibe-hotel-card__footer">
          <div className="stayvibe-price-column">
            {hotel.originalPricePerNight && (
              <span className="stayvibe-price-original">
                {formatCurrencyAmount(
                  hotel.originalPricePerNight,
                  hotel.currency,
                )}
              </span>
            )}
            <div className="stayvibe-price-main-row">
              <span className="stayvibe-price-current">
                {formatCurrencyAmount(hotel.pricePerNight, hotel.currency)}
              </span>
              <span className="stayvibe-price-unit">/ đêm</span>
            </div>
            <span className="stayvibe-price-tax-note">
              {hotel.taxStatusNote}
            </span>
          </div>

          <button
            type="button"
            className="stayvibe-card-cta-btn"
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

