import { useState } from 'react'
import { Link } from 'react-router'
import type { SearchHotel } from '../api/search-api'
import { useCover } from '../hooks/use-public-discovery'
import { listingDetailHref, type ListingStay } from '../model/client-listing-search'
import { formatCurrencyAmount } from '@/shared/lib/format'
import { ClientFigmaIcon } from './ClientFigmaIcon'

export function ClientListingCard({ hotel, stay, saved, onToggleSaved }: { hotel: SearchHotel; stay: ListingStay; saved: boolean; onToggleSaved: () => void }) {
  const cover = useCover(hotel.coverImage?.mediaId)
  const [failed, setFailed] = useState<string | null>(null)
  const url = cover.data?.url
  const loading = Boolean(hotel.coverImage) && cover.isPending
  const href = listingDetailHref(hotel.id, stay)
  const currency = hotel.currency || 'VND'
  const total = stay.checkIn && stay.checkOut ? hotel.totalPrice : null
  const nights = (Date.parse(stay.checkOut) - Date.parse(stay.checkIn)) / 86400000
  return <article className="cf-listing-card" role="listitem">
    <div className="cf-card-media"><Link className="cf-card-photo" to={href} aria-label={`Xem ${hotel.name}`}>
      {url && url !== failed ? <img src={url} alt={hotel.name} loading="lazy" onError={() => setFailed(url)} /> : <div className={`cf-card-fallback${loading ? ' cf-skeleton' : ''}`}>{!loading && <><ClientFigmaIcon name="image-error" /><span>{hotel.coverImage ? 'Không thể tải ảnh' : 'Chưa có ảnh'}</span></>}</div>}
    </Link>{!loading && (!url || url === failed) && hotel.coverImage && <button type="button" className="cf-image-retry" onClick={() => { setFailed(null); void cover.refetch() }}>Thử lại</button>}
    <button type="button" className={`cf-save${saved ? ' is-saved' : ''}`} aria-label={`${saved ? 'Bỏ lưu' : 'Lưu'} ${hotel.name}`} aria-pressed={saved} onClick={onToggleSaved}><ClientFigmaIcon name="heart" /></button></div>
    <div className="cf-card-heading"><h3><Link to={href}>{hotel.name}</Link></h3>{hotel.starRating != null && hotel.starRating > 0 && <span className="cf-hotel-stars" aria-label={`Tiêu chuẩn ${hotel.starRating} sao`}><ClientFigmaIcon name="star" />{hotel.starRating} sao</span>}</div>
    <p className="cf-card-location">{hotel.address || hotel.city.name}</p>
    <p className="cf-card-price">{hotel.minNightlyPrice != null ? <><strong>{formatCurrencyAmount(hotel.minNightlyPrice, currency)}</strong><span> / đêm</span></> : total != null ? <><strong>{formatCurrencyAmount(total, currency)}</strong><span> / kỳ ở</span></> : <span>Chọn ngày để xem giá</span>}</p>
    {total != null && <p className="cf-card-total">Tổng {formatCurrencyAmount(total, currency)} cho {nights} đêm</p>}
  </article>
}

export function ClientListingSkeleton() {
  return <div className="cf-listing-card" aria-hidden="true"><div className="cf-card-media cf-skeleton" /><div className="cf-skeleton cf-skeleton-line" /><div className="cf-skeleton cf-skeleton-line cf-skeleton-short" /></div>
}
