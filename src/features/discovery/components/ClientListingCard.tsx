import { useState } from 'react'
import { Link } from 'react-router'
import type { SearchHotel } from '../api/search-api'
import { useCover } from '../hooks/use-public-discovery'
import { listingDetailHref, type ListingStay } from '../model/client-listing-search'
import { formatCurrencyAmount } from '@/shared/lib/format'
import { ClientReferenceIcon } from './ClientReferenceIcon'

export function ClientListingCard({ hotel, stay, saved, onToggleSaved }: { hotel: SearchHotel; stay: ListingStay; saved: boolean; onToggleSaved: () => void }) {
  const cover = useCover(hotel.coverImage?.mediaId)
  const [failed, setFailed] = useState<string | null>(null)
  const url = cover.data?.url
  const loading = Boolean(hotel.coverImage) && cover.isPending
  const href = listingDetailHref(hotel.id, stay)
  const currency = hotel.currency || 'VND'
  const total = stay.checkIn && stay.checkOut ? hotel.totalPrice : null
  const nights = (Date.parse(stay.checkOut) - Date.parse(stay.checkIn)) / 86400000
  return <article className="ref-stay" role="listitem">
    <div className="ref-stay-photo"><Link className="ref-stay-photo-link" to={href} aria-label={`Xem ${hotel.name}`}>
      {url && url !== failed ? <img className="ref-stay-image" src={url} alt={hotel.name} width={1200} height={900} loading="lazy" decoding="async" onError={() => setFailed(url)} /> : <div className={`ref-photo-fallback${loading ? ' ref-skeleton' : ''}`}>{!loading && <><ClientReferenceIcon name="home" size={32} /><span>{hotel.coverImage ? 'Không thể tải ảnh' : 'Chưa có ảnh'}</span></>}</div>}
    </Link>
      {!loading && (!url || url === failed) && hotel.coverImage && <button type="button" className="ref-image-retry" onClick={() => { setFailed(null); void cover.refetch() }}>Thử lại</button>}
      <button type="button" className={`ref-heart${saved ? ' ref-is-on' : ''}`} aria-label={`${saved ? 'Bỏ lưu' : 'Lưu'} ${hotel.name}`} aria-pressed={saved} onClick={onToggleSaved}><ClientReferenceIcon name="heart" /></button>
    </div>
    <div className="ref-stay-body">
      <div className="ref-stay-name-row"><h2 className="ref-stay-name"><Link to={href}>{hotel.name}</Link></h2>{hotel.starRating != null && hotel.starRating > 0 && <span className="ref-stay-rating" aria-label={`Tiêu chuẩn ${hotel.starRating} sao`}><ClientReferenceIcon name="star" size={13} />{hotel.starRating} sao</span>}</div>
      <p className="ref-stay-meta">{hotel.address || hotel.city.name}</p>
      {hotel.address && <p className="ref-stay-meta">{hotel.city.name}</p>}
      <p className="ref-stay-price">{hotel.minNightlyPrice != null ? <><strong>{formatCurrencyAmount(hotel.minNightlyPrice, currency)}</strong><span className="ref-stay-per"> / đêm</span></> : total != null ? <><strong>{formatCurrencyAmount(total, currency)}</strong><span className="ref-stay-per"> / kỳ ở</span></> : <span className="ref-stay-per">Chọn ngày để xem giá</span>}</p>
      {total != null && <p className="ref-stay-meta">Tổng {formatCurrencyAmount(total, currency)} cho {nights} đêm</p>}
    </div>
  </article>
}

export function ClientListingSkeleton() {
  return <div className="ref-stay" aria-hidden="true"><div className="ref-stay-photo ref-skeleton ref-skeleton-media" /><div className="ref-skeleton ref-skeleton-line" /><div className="ref-skeleton ref-skeleton-line ref-skeleton-short" /></div>
}
