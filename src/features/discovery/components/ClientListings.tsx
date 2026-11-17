import { useState } from 'react'
import { Link } from 'react-router'
import { Alert, Modal, Pagination } from 'antd'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useClientListings } from '../hooks/use-client-listings'
import { useClientHomeContext } from '../hooks/use-client-home-context'
import { listingFiltersSchema, type ListingFilters } from '../model/client-listing-search'
import { ClientListingCard, ClientListingSkeleton } from './ClientListingCard'
import { ClientListingSearchBar } from './ClientListingSearchBar'
import { ClientFigmaIcon } from './ClientFigmaIcon'

const CITY_ORDER = ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Đà Lạt', 'Huế', 'Phú Quốc', 'Cần Thơ', 'Hải Phòng', 'Nha Trang', 'Hội An', 'Sa Pa']

export function ClientListings({ showPromotion = true }: { showPromotion?: boolean }) {
  const flow = useClientListings()
  const { savedIds, toggleSaved, filterState } = useClientHomeContext()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const filters = useForm<ListingFilters>({ resolver: zodResolver(listingFiltersSchema), values: flow.parsed?.filters ?? { sort: 'name' } })
  const orderedCities = [...(flow.cities.data ?? [])].sort((a, b) => {
    const ai = CITY_ORDER.indexOf(a.name), bi = CITY_ORDER.indexOf(b.name)
    return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi)
  })
  const hotels = flow.query.data?.content.filter(h => !filterState.savedOnly || savedIds.has(h.id)) ?? []
  const activeFilters = Boolean(flow.params.get('minPrice') || flow.params.get('maxPrice') || flow.params.get('starRating'))
  function applyFilters(value: ListingFilters) {
    const next = new URLSearchParams(flow.params)
    for (const key of ['minPrice', 'maxPrice', 'starRating', 'sort'] as const) { next.delete(key); if (value[key] !== undefined) next.set(key, String(value[key])) }
    next.delete('page'); next.delete('quantity'); flow.setParams(next); setFiltersOpen(false)
  }
  return <div className="cf-listings-page" id="top">
    <h1 className="sr-only">Tìm khách sạn và chỗ nghỉ trên StayHub</h1>
    <ClientListingSearchBar form={flow.form} cities={flow.cities.data ?? []} onSubmit={flow.submit} />
    <section className="cf-city-section" aria-label="Lọc theo thành phố"><div className="cf-city-inner"><div className="cf-city-list"><button type="button" className={!flow.params.get('cityId') && !flow.params.get('citySlug') ? 'is-active' : ''} onClick={() => flow.selectCity('')}>Tất cả</button>{orderedCities.map(city => <button type="button" key={city.id} className={flow.chosenCity?.id === city.id ? 'is-active' : ''} onClick={() => flow.selectCity(city.id)}>{city.name}</button>)}</div><button type="button" className={`cf-filter-button${activeFilters ? ' is-active' : ''}`} onClick={() => setFiltersOpen(true)}><ClientFigmaIcon name="filters" />Bộ lọc{activeFilters && <span className="cf-filter-dot" />}</button></div></section>
    <section className="cf-results" id="stays" aria-label="Danh sách khách sạn">
      {!flow.parsed && <Alert type="warning" showIcon title="Thông tin tìm kiếm chưa hợp lệ" description="Chọn lại ngày lưu trú, số khách hoặc bộ lọc." action={<button onClick={() => flow.setParams({})}>Đặt lại</button>} />}
      {flow.cities.isError && <Alert type="error" title="Không tải được thành phố" action={<button onClick={() => void flow.cities.refetch()}>Thử lại</button>} />}
      {flow.parsed && flow.query.isPending && <div className="cf-listing-grid" role="status" aria-label="Đang tải khách sạn">{Array.from({ length: 8 }, (_, i) => <ClientListingSkeleton key={i} />)}</div>}
      {flow.query.isError && <div className="cf-empty" role="alert"><h2>Không thể tải danh sách chỗ nghỉ</h2><p>Vui lòng kiểm tra kết nối và thử lại.</p><button type="button" onClick={() => void flow.query.refetch()}>Thử lại</button></div>}
      {flow.query.data && !flow.query.isError && flow.parsed && (hotels.length ? <div className="cf-listing-grid" role="list">{hotels.map(hotel => <ClientListingCard key={hotel.id} hotel={hotel} stay={flow.parsed!.stay} saved={savedIds.has(hotel.id)} onToggleSaved={() => toggleSaved(hotel.id)} />)}</div> : <div className="cf-empty"><h2>{filterState.savedOnly ? 'Trang này chưa có chỗ nghỉ đã lưu' : 'Không tìm thấy chỗ nghỉ phù hợp'}</h2><p>Thử đổi điểm đến, ngày lưu trú hoặc bộ lọc.</p><button type="button" onClick={() => flow.setParams({})}>Xóa bộ lọc tìm kiếm</button></div>)}
      {flow.query.data && flow.query.data.totalPages > 1 && <nav className="cf-pagination" aria-label="Phân trang khách sạn"><Pagination current={flow.query.data.page + 1} pageSize={8} total={flow.query.data.totalElements} showSizeChanger={false} onChange={page => { const next = new URLSearchParams(flow.params); next.set('page', String(page - 1)); flow.setParams(next); document.getElementById('stays')?.scrollIntoView({ block: 'start' }) }} /></nav>}
    </section>
    {showPromotion && <section className="cf-host-section" id="partner" aria-label="Dành cho chủ khách sạn"><div className="cf-host-banner"><img className="cf-host-image" src="/assets/client-figma/host-banner.png" alt="" /><div className="cf-host-content"><div><p>Dành cho chủ nhà</p><h2>Gia tăng thu nhập cùng StayHub <br />bằng cách đón tiếp du khách toàn <br />cầu.</h2></div><Link to="/hotels" className="cf-primary">Đăng ký khách sạn</Link></div></div></section>}
    <Modal title="Bộ lọc" open={filtersOpen} onCancel={() => setFiltersOpen(false)} footer={null} className="cf-filters-modal" destroyOnHidden>
      <form className="cf-filters-form" noValidate onSubmit={filters.handleSubmit(applyFilters)}>
        {(['minPrice', 'maxPrice'] as const).map(key => <label key={key}>{key === 'minPrice' ? 'Giá tối thiểu (VND/đêm)' : 'Giá tối đa (VND/đêm)'}<input type="number" min="0" {...filters.register(key, { setValueAs: v => v === '' ? undefined : Number(v) })} />{filters.formState.errors[key] && <span role="alert">{filters.formState.errors[key]?.message}</span>}</label>)}
        <label>Tiêu chuẩn sao<select {...filters.register('starRating', { setValueAs: v => v === '' ? undefined : Number(v) })}><option value="">Tất cả</option>{[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>Từ {n} sao</option>)}</select></label>
        <label>Sắp xếp<select {...filters.register('sort')}><option value="name">Tên khách sạn</option><option value="price">Giá thấp đến cao</option><option value="rating">Tiêu chuẩn sao</option></select></label>
        <div className="cf-filter-actions"><button type="button" onClick={() => filters.reset({ sort: 'name', minPrice: undefined, maxPrice: undefined, starRating: undefined })}>Xóa lựa chọn</button><button className="cf-primary" type="submit">Áp dụng bộ lọc</button></div>
      </form>
    </Modal>
  </div>
}

