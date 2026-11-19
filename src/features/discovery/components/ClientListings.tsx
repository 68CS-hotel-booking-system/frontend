import { useState } from 'react'
import { useCurrentUser } from '@/features/auth'
import { Link } from 'react-router'
import { Pagination } from 'antd'
import { useClientListings } from '../hooks/use-client-listings'
import { useClientHomeContext } from '../hooks/use-client-home-context'
import { countListingFilters, updateListingFilters, type ListingFilters } from '../model/client-listing-search'
import { ClientListingCard, ClientListingSkeleton } from './ClientListingCard'
import { ClientListingSearchBar } from './ClientListingSearchBar'
import { ClientReferenceIcon } from './ClientReferenceIcon'
import { ClientFilterDrawer } from './ClientFilterDrawer'

const CITY_ORDER = ['Hà Nội', 'TP. Hồ Chí Minh', 'Thành phố Hồ Chí Minh', 'Đà Nẵng', 'Hội An', 'Huế', 'Đà Lạt', 'Phú Quốc', 'Cần Thơ', 'Hải Phòng', 'Nha Trang', 'Sa Pa']

export function ClientListings({ showPromotion = true, home = false }: { showPromotion?: boolean; home?: boolean }) {
  const flow = useClientListings()
  const { isAuthorized } = useCurrentUser()
  const { savedIds, toggleSaved } = useClientHomeContext()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const currentFilters = flow.parsed?.filters ?? { sort: 'name' as const }
  const filterCount = countListingFilters(currentFilters)
  const orderedCities = [...(flow.cities.data ?? [])].sort((a, b) => {
    const ai = CITY_ORDER.indexOf(a.name), bi = CITY_ORDER.indexOf(b.name)
    return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi)
  })
  const hotels = flow.query.data?.content ?? []
  function applyFilters(value: ListingFilters) {
    flow.setParams(updateListingFilters(flow.params, value), { preventScrollReset: true })
    setFiltersOpen(false)
  }
  const title = flow.chosenCity ? `Chỗ nghỉ tại ${flow.chosenCity.name}` : 'Chỗ nghỉ tại Việt Nam'
  const subtitle = !flow.parsed ? 'Kiểm tra lại thông tin tìm kiếm' : flow.query.isPending ? 'Đang tìm chỗ nghỉ…' : flow.query.isError ? 'Chưa tải được kết quả' : `${flow.query.data?.totalElements ?? 0} chỗ nghỉ phù hợp`
  const ResultsHeading = home ? 'h2' : 'h1'
  return <div className="ref-ui ref-listings" id="top">
    {home && <section className="ref-wrap stayhub-welcome" aria-labelledby="stayhub-welcome-title">
      <div className="stayhub-welcome-panel">
        <div className="stayhub-welcome-copy">
          <h1 id="stayhub-welcome-title">Tìm chỗ nghỉ cho<br className="stayhub-wide-break" /> chuyến đi của bạn</h1>
          <p>Chọn điểm đến, xem phòng còn trống và đặt kỳ nghỉ tiếp theo cùng StayHub.</p>
          <Link to="/experiences" viewTransition className="stayhub-inline-link">Khám phá điểm đến <span aria-hidden="true">→</span></Link>
        </div>
        <div className="stayhub-welcome-media"><img src="/assets/resort-warm.jpg" alt="" fetchPriority="high" /></div>
      </div>
    </section>}
    <ClientListingSearchBar form={flow.form} cities={flow.cities.data ?? []} onSubmit={flow.submit} />
    <nav className="ref-city-bar" aria-label="Lọc theo thành phố"><div className="ref-city-rail">
      <button type="button" className="ref-city-chip" aria-pressed={!flow.params.get('cityId') && !flow.params.get('citySlug')} onClick={() => flow.selectCity('')}>Tất cả</button>
      {orderedCities.map(city => <button type="button" key={city.id} className="ref-city-chip" aria-pressed={flow.chosenCity?.id === city.id} onClick={() => flow.selectCity(city.id)}>{city.name}</button>)}
    </div></nav>
    <section className="ref-results ref-wrap" id="stays" aria-labelledby="client-results-title" tabIndex={-1}>
      <div className="ref-toolbar"><div><ResultsHeading className="ref-results-title" id="client-results-title">{title}</ResultsHeading><span className="ref-results-sub" role="status" aria-live="polite">{subtitle}</span></div>
        <div className="ref-toolbar-actions"><div className="ref-sort-wrap"><label htmlFor="client-sort">Sắp xếp</label><select id="client-sort" className="ref-sort-select" value={currentFilters.sort} onChange={event => flow.setParams(updateListingFilters(flow.params, { ...currentFilters, sort: event.target.value as ListingFilters['sort'] }), { preventScrollReset: true })}>
          <option value="name">Tên khách sạn</option><option value="price">Giá thấp đến cao</option><option value="rating">Hạng sao cao nhất</option>
        </select></div><button type="button" className="ref-filter-btn" aria-haspopup="dialog" aria-expanded={filtersOpen} onClick={() => setFiltersOpen(true)}><ClientReferenceIcon name="filters" size={16} />Bộ lọc{filterCount > 0 && <span className="ref-filter-count">{filterCount}</span>}</button></div>
      </div>
      {!flow.parsed && <div className="ref-inline-error" role="alert"><p>Thông tin tìm kiếm chưa hợp lệ. Hãy chọn lại ngày, số khách hoặc bộ lọc.</p><button className="ref-btn ref-btn-secondary" onClick={() => flow.setParams({})}>Đặt lại</button></div>}
      {flow.cities.isError && <div className="ref-inline-error" role="alert"><p>Không tải được thành phố.</p><button className="ref-btn ref-btn-secondary" onClick={() => void flow.cities.refetch()}>Thử lại</button></div>}
      {flow.parsed && flow.query.isPending && <div className="ref-grid" role="status" aria-label="Đang tải khách sạn">{Array.from({ length: 8 }, (_, i) => <ClientListingSkeleton key={i} />)}</div>}
      {flow.query.isError && <div className="ref-empty" role="alert"><h2 className="ref-empty-title">Không thể tải danh sách chỗ nghỉ</h2><p className="ref-empty-text">Vui lòng kiểm tra kết nối và thử lại.</p><button className="ref-btn ref-btn-secondary" type="button" onClick={() => void flow.query.refetch()}>Thử lại</button></div>}
      {flow.query.data && !flow.query.isError && flow.parsed && (hotels.length ? <div className="ref-grid" role="list">{hotels.map(hotel => <ClientListingCard key={hotel.id} hotel={hotel} stay={flow.parsed!.stay} saved={savedIds.has(hotel.id)} onToggleSaved={() => toggleSaved(hotel.id)} />)}</div> : <div className="ref-empty">
        <ClientReferenceIcon name="search" size={48} /><h2 className="ref-empty-title">Không tìm thấy chỗ nghỉ phù hợp</h2><p className="ref-empty-text">Thử đổi điểm đến, ngày lưu trú hoặc bỏ bớt bộ lọc.</p><button className="ref-btn ref-btn-primary" type="button" onClick={() => flow.setParams({}, { preventScrollReset: true })}>Xóa bộ lọc tìm kiếm</button>
      </div>)}
      {flow.query.data && flow.query.data.totalPages > 1 && <nav className="ref-pagination" aria-label="Phân trang khách sạn"><Pagination current={flow.query.data.page + 1} pageSize={8} total={flow.query.data.totalElements} showSizeChanger={false} onChange={page => { const next = new URLSearchParams(flow.params); next.set('page', String(page - 1)); flow.setParams(next); document.getElementById('stays')?.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }) }} /></nav>}
    </section>
    {showPromotion && isAuthorized && <section className="ref-host-section" id="host"><div className="ref-wrap"><div className="ref-host-card">
      <div className="ref-host-copy"><p className="ref-eyebrow">Dành cho chủ khách sạn</p><h2 className="ref-host-title">Quản lý khách sạn của bạn cùng StayHub.</h2><p className="ref-host-text">Cập nhật thông tin khách sạn, quản lý phòng và bảng giá trên cùng một nền tảng.</p><Link to="/admin/overview" className="ref-btn ref-btn-primary">Khách sạn của tôi</Link></div>
      <div className="ref-host-media"><img className="ref-od-media ref-od-media-cover" src="/assets/client/hotel-heritage.jpg" alt="" loading="lazy" decoding="async" /></div>
    </div></div></section>}
    {filtersOpen && <ClientFilterDrawer initial={currentFilters} onApply={applyFilters} onClose={() => setFiltersOpen(false)} />}
  </div>
}
