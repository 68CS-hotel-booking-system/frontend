import { useState } from 'react'
import { Link } from 'react-router'
import {
  ClientIcon,
  ClientJournalSection,
  formatHotelLocation,
  formatHotelPrice,
  useCities,
  useCover,
  useHotelSearch,
  type SearchHotel,
  type SearchParams,
} from '@/features/discovery'
import { formatCurrencyAmount } from '@/shared/lib/format'

const EMPTY_SEARCH: SearchParams = { cityId: '', checkIn: '', checkOut: '', guests: 1, page: 0 }

function HotelCard({ hotel, search }: { hotel: SearchHotel; search: SearchParams }) {
  const cover = useCover(hotel.coverImage?.mediaId)
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const query = new URLSearchParams({ adults: String(search.guests) })
  if (search.checkIn && search.checkOut) {
    query.set('checkIn', search.checkIn)
    query.set('checkOut', search.checkOut)
  }
  const href = `/stays/${hotel.id}?${query}`
  const state = { hotelId: hotel.id, coverMediaId: hotel.coverImage?.mediaId }
  const location = formatHotelLocation(hotel.city.name, hotel.address)
  const price = formatHotelPrice(hotel)
  const coverUrl = cover.data?.url
  const coverFailed = Boolean(coverUrl && failedUrl === coverUrl)
  const coverLoading = Boolean(hotel.coverImage) && cover.isPending

  return (
    <article className="stay-card" role="listitem">
      <Link to={href} state={state} className="stay-media" aria-label={`Xem ${hotel.name}`}>
        {coverUrl && !coverFailed ? (
          <img src={coverUrl} alt={hotel.name} loading="lazy" onError={() => setFailedUrl(coverUrl)} />
        ) : (
          <div className={`stay-media-fallback${coverLoading ? ' is-loading' : ''}`}>
            <ClientIcon name="compass" />
            <span>{coverLoading ? 'Đang tải ảnh bìa…' : hotel.coverImage ? 'Không tải được ảnh bìa' : 'Chưa có ảnh bìa'}</span>
          </div>
        )}
      </Link>
      <div className="stay-body">
        <div className="stay-location">
          <ClientIcon name="pin" /> {location.city}
          {location.detail && <><span /> {location.detail}</>}
        </div>
        <h3><Link to={href} state={state}>{hotel.name}</Link></h3>
        {hotel.starRating != null && hotel.starRating > 0 && (
          <div className="stay-rating">
            <ClientIcon name="star" />
            <strong>{hotel.starRating}</strong>
            <span>sao</span>
          </div>
        )}
        {hotel.amenities.length > 0 && (
          <ul className="amenities" aria-label="Tiện ích nổi bật">
            {hotel.amenities.slice(0, 3).map((amenity) => (
              <li key={amenity.id}><ClientIcon name="check" /> {amenity.name}</li>
            ))}
          </ul>
        )}
        <div className="stay-footer">
          <div className="stay-price">
            {price ? (
              <>
                <div className="price-header"><span className="price-label">{price.label}</span></div>
                <div className="price-main">
                  <strong>{formatCurrencyAmount(price.amount, price.currency)}</strong>
                  {price.unit && <span className="price-unit">{price.unit}</span>}
                </div>
              </>
            ) : (
              <div className="price-main"><span className="price-empty">Chọn ngày để xem giá</span></div>
            )}
          </div>
          <Link className="stay-link" to={href} state={state}>
            <span>Xem chi tiết</span>
            <ClientIcon name="arrow" />
          </Link>
        </div>
      </div>
    </article>
  )
}

function HotelCardSkeleton() {
  return (
    <div className="stay-card stay-card--skeleton" aria-hidden="true">
      <div className="stay-media skeleton-block" />
      <div className="stay-body">
        <div className="skeleton-block skeleton-line" style={{ width: '55%' }} />
        <div className="skeleton-block skeleton-line skeleton-line--title" />
        <div className="skeleton-block skeleton-line" style={{ width: '75%' }} />
        <div className="skeleton-block skeleton-line" style={{ width: '40%' }} />
      </div>
    </div>
  )
}

export function StayVibeHomePage() {
  const [draft, setDraft] = useState<SearchParams>(EMPTY_SEARCH)
  const [params, setParams] = useState<SearchParams>(draft)
  const cities = useCities()
  const hotels = useHotelSearch(params)
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date())
  const invalidDates = Boolean(draft.checkIn || draft.checkOut) && (!draft.checkIn || !draft.checkOut || draft.checkIn < today || draft.checkOut <= draft.checkIn || (Date.parse(draft.checkOut) - Date.parse(draft.checkIn)) / 86400000 > 30)
  const showStays = () => document.getElementById('stays')?.scrollIntoView({ behavior: 'smooth' })
  const hasSearchFilters = Boolean(params.cityId || params.checkIn || params.checkOut)
  const resetSearch = () => {
    const next = { ...EMPTY_SEARCH }
    setDraft(next)
    setParams(next)
    showStays()
  }
  return <div className="w-full flex flex-col">
    <section className="hero" id="top" aria-labelledby="hero-title"><div className="container"><div className="hero-grid"><div className="hero-copy">
      <p className="eyebrow">Bộ sưu tập lưu trú StayHub</p><h1 id="hero-title">Ở nơi <em>câu chuyện</em><br />bắt đầu.</h1><p className="hero-lede">Tìm một nơi phù hợp cho chuyến đi của bạn, từ những khách sạn đang mở đón khách trên StayHub.</p>
    </div><div className="hero-visual"><figure className="hero-media"><img src="/assets/client/phuquoc.jpg" alt="Khung cảnh biển Phú Quốc" fetchPriority="high" width="1400" height="1400" /><span className="hero-location"><ClientIcon name="pin" /> Phú Quốc · Việt Nam</span></figure></div></div>
      <div className="search-wrap"><form className="search-panel" aria-label="Tìm kiếm chỗ nghỉ" onSubmit={e => { e.preventDefault(); if (!invalidDates) { setParams({ ...draft, page: 0 }); showStays() } }}>
        <div className="search-field"><ClientIcon name="pin" /><div className="search-field-content"><label htmlFor="destination">Điểm đến</label><select id="destination" value={draft.cityId} onChange={e => setDraft({ ...draft, cityId: e.target.value })}><option value="">Tất cả thành phố</option>{cities.data?.map(c => <option value={c.id} key={c.id}>{c.name}</option>)}</select></div></div>
        <div className="search-field"><ClientIcon name="calendar" /><div className="search-field-content"><label htmlFor="check-in">Nhận phòng</label><input id="check-in" type="date" value={draft.checkIn} onChange={e => setDraft({ ...draft, checkIn: e.target.value })} /></div></div>
        <div className="search-field"><ClientIcon name="calendar" /><div className="search-field-content"><label htmlFor="check-out">Trả phòng</label><input id="check-out" type="date" value={draft.checkOut} onChange={e => setDraft({ ...draft, checkOut: e.target.value })} /></div></div>
        <div className="search-field"><ClientIcon name="users" /><div className="search-field-content"><label htmlFor="guests">Khách / phòng</label><input id="guests" type="number" min="1" max="50" value={draft.guests} onChange={e => setDraft({ ...draft, guests: Number(e.target.value) })} /></div></div>
        <button className="search-submit" disabled={invalidDates || !Number.isInteger(draft.guests) || draft.guests < 1 || draft.guests > 50}><ClientIcon name="search" /><span>Tìm chỗ nghỉ</span></button>
      </form>{invalidDates && <p role="alert">Chọn ngày hợp lệ, từ hôm nay và tối đa 30 đêm.</p>}{cities.isError && <p role="alert">Không tải được thành phố. <button onClick={() => void cities.refetch()}>Thử lại</button></p>}</div>
    </div></section>
    {Boolean(cities.data?.length) && <section className="section" id="destinations"><div className="container"><div className="section-head"><div><p className="eyebrow">Điểm đến</p><h2 className="section-title">Bạn muốn <em>đi đâu?</em></h2></div><div className="section-aside"><p>Chọn thành phố để khám phá các khách sạn đang mở đón khách.</p></div></div><div className="quick-row">{cities.data?.map(city => <button key={city.id} type="button" onClick={() => { const next = { ...draft, cityId: city.id, page: 0 }; setDraft(next); setParams(next); showStays() }}>{city.name}</button>)}</div></div></section>}
    <section className="section stays-section" id="stays" aria-labelledby="stays-title"><div className="container"><div className="section-head stays-head"><div><p className="eyebrow">Bộ sưu tập chỗ nghỉ</p><h2 className="section-title" id="stays-title">Những nơi <em>đáng để lưu lại.</em></h2></div><div className="section-aside"><p>Khám phá những khách sạn đang mở đón khách và tìm lựa chọn phù hợp với chuyến đi của bạn.</p></div></div>
      {!hotels.isError && <div className="stays-controls"><div className="stays-count" aria-live="polite" aria-atomic="true">{hotels.data ? <>Tìm thấy <strong>{hotels.data.totalElements}</strong> khách sạn{hasSearchFilters ? ' phù hợp' : ''}</> : hotels.isPending ? 'Đang tải danh sách chỗ nghỉ…' : ''}</div></div>}
      {hotels.isPending && <div className="stays-grid" aria-hidden="true">{Array.from({ length: 3 }, (_, index) => <HotelCardSkeleton key={index} />)}</div>}
      {hotels.isError && !hotels.data && <div className="empty-state" role="alert"><h3>Không thể tải danh sách chỗ nghỉ</h3><p>Kết nối tới máy chủ đang gặp sự cố. Vui lòng thử lại.</p><button className="btn btn--primary" type="button" onClick={() => void hotels.refetch()}>Thử lại</button></div>}
      {hotels.data && (hotels.data.content.length === 0
        ? <div className="empty-state"><ClientIcon name="compass" /><h3>Không tìm thấy chỗ nghỉ phù hợp</h3><p>{hasSearchFilters ? 'Hãy thử bỏ bớt điểm đến hoặc ngày lưu trú.' : 'Hiện chưa có chỗ nghỉ nào đang mở đón khách. Vui lòng quay lại sau.'}</p>{hasSearchFilters && <button className="btn btn--primary" type="button" onClick={resetSearch}>Xóa bộ lọc</button>}</div>
        : <div className="stays-grid" role="list">{hotels.data.content.map(hotel => <HotelCard key={hotel.id} hotel={hotel} search={params} />)}</div>)}
      {hotels.data && hotels.data.totalPages > 1 && <nav className="collection-foot" aria-label="Phân trang chỗ nghỉ"><button className="text-link" type="button" disabled={hotels.data.first} onClick={() => { setParams({ ...params, page: params.page - 1 }); showStays() }}>← Trang trước</button><span>Trang {hotels.data.page + 1} / {hotels.data.totalPages}</span><button className="text-link" type="button" disabled={hotels.data.last} onClick={() => { setParams({ ...params, page: params.page + 1 }); showStays() }}>Trang sau →</button></nav>}
    </div></section>
    <ClientJournalSection onJournalCta={showStays} />
    <section className="section partner" id="partner"><div className="container"><div className="partner-card"><div className="partner-media"><img src="/assets/client/experience.jpg" alt="Không gian nghỉ dưỡng bên hồ bơi" loading="lazy" /><span className="partner-badge">Dành cho đối tác lưu trú</span></div><div className="partner-copy"><p className="eyebrow">Hợp tác cùng StayHub</p><h2>Bạn có một nơi <em>đáng để ở?</em></h2><p>Đưa chỗ nghỉ của bạn đến những vị khách đang tìm đúng điều mình muốn.</p><div className="partner-actions"><Link className="btn btn--dark" to="/hotels">Quản lý khách sạn <ClientIcon name="arrow" /></Link></div></div></div></div></section>
  </div>
}
