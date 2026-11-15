import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { useQueries, useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Alert, Pagination } from 'antd'
import { useCitiesQuery } from '@/features/hotels'
import { localDate, stayFormSchema } from '@/features/bookings'
import { searchHotels, resolveCover, type HotelSearchParams } from '../api/search-api'
import { toClientStay } from '../api/client-home-api'
import { normalizeText, parseDateInput } from '../hooks/use-client-home'
import { useClientHomeContext } from '../hooks/use-client-home-context'
import type { ClientSearchFormValues } from '../model/client-search-schema'
import { ClientHeroSection } from './ClientHeroSection'
import { ClientStaysSection } from './ClientStaysSection'

const filterSchema = z.object({ minPrice: z.number().int().nonnegative().safe().optional(), maxPrice: z.number().int().nonnegative().safe().optional(), starRating: z.number().int().min(1).max(5).optional() })
  .refine((value) => value.minPrice === undefined || value.maxPrice === undefined || value.maxPrice >= value.minPrice, { path: ['maxPrice'], message: 'Giá tối đa phải từ giá tối thiểu trở lên.' })
const iso = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

export function HotelSearchResults() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const cities = useCitiesQuery()
  const { savedIds, toggleSaved, showToast } = useClientHomeContext()
  const [page, setPage] = useState(0)
  const stay = { checkIn: params.get('checkIn') || localDate(), checkOut: params.get('checkOut') || localDate(1), adults: Number(params.get('adults') ?? 2), children: 0, quantity: Number(params.get('quantity') ?? 1) }
  const validStay = stayFormSchema.safeParse(stay)
  const rawFilters = { minPrice: params.has('minPrice') ? Number(params.get('minPrice')) : undefined, maxPrice: params.has('maxPrice') ? Number(params.get('maxPrice')) : undefined, starRating: params.has('starRating') ? Number(params.get('starRating')) : undefined }
  const filters = filterSchema.safeParse(rawFilters)
  const sort = params.get('sort') ?? 'price'
  const validSort = sort === 'price' || sort === 'rating' || sort === 'name'
  const city = cities.data?.find((item) => item.id === params.get('cityId') || item.slug === params.get('citySlug'))
  const form = useForm({ resolver: zodResolver(filterSchema), defaultValues: filters.success ? filters.data : {} })
  const applied: HotelSearchParams = { cityId: params.get('cityId') || undefined, citySlug: params.has('cityId') ? undefined : params.get('citySlug') || undefined,
    checkIn: stay.checkIn, checkOut: stay.checkOut, guests: Math.ceil(stay.adults / stay.quantity), ...(filters.success ? filters.data : {}), sort: validSort ? sort : 'price', page, size: 12 }
  const query = useQuery({ queryKey: ['discovery', 'search', applied], queryFn: ({ signal }) => searchHotels(applied, signal), enabled: validStay.success && filters.success && validSort, retry: false })
  const hotels = query.data?.content ?? []
  const covers = useQueries({ queries: hotels.map((hotel) => ({ queryKey: ['discovery', 'cover', hotel.coverImage?.mediaId], queryFn: ({ signal }: { signal: AbortSignal }) => resolveCover(hotel.coverImage?.mediaId, signal), staleTime: 60000 })) })
  const stays = hotels.map((hotel, index) => toClientStay(hotel, covers[index]?.data ?? '/assets/hotel-placeholder.svg'))
  function search(value: ClientSearchFormValues) {
    const start = parseDateInput(value.checkIn), end = parseDateInput(value.checkOut)
    if (!start || !end) { showToast('Nhập ngày hợp lệ theo định dạng DD/MM/YYYY.'); return }
    const counts = value.guests.match(/\d+/g)?.map(Number) ?? [1, 1]
    const nextStay = { checkIn: iso(start), checkOut: iso(end), adults: counts[0], quantity: counts[1] ?? 1, children: 0 }
    const result = stayFormSchema.safeParse(nextStay)
    if (!result.success) { showToast(result.error.issues[0].message); return }
    const chosenCity = cities.data?.find((item) => normalizeText(item.name) === normalizeText(value.destination.trim()))
    const next = new URLSearchParams(params)
    next.delete('citySlug'); next.delete('cityId')
    if (value.destination.trim()) { if (chosenCity) next.set('cityId', chosenCity.id); else next.set('citySlug', normalizeText(value.destination).trim().replace(/\s+/g, '-')) }
    for (const [key, item] of Object.entries(nextStay)) if (key !== 'children') next.set(key, String(item))
    setParams(next); setPage(0)
  }
  const invalid = !validStay.success || !filters.success || !validSort
  return <>
    <ClientHeroSection compact cities={cities.data?.map((item) => item.name) ?? []} initialValues={{ destination: city?.name ?? params.get('citySlug')?.replace(/-/g, ' ') ?? '', checkIn: stay.checkIn.split('-').reverse().join('/'), checkOut: stay.checkOut.split('-').reverse().join('/'), guests: `${stay.adults} khách · ${stay.quantity} phòng` }}
      onSearchSubmit={search} onQuickCity={(name) => { const next = new URLSearchParams(params); next.delete('cityId'); next.set('citySlug', normalizeText(name).replace(/\s+/g, '-')); setParams(next) }} onOpenStay={(id) => navigate(`/stays/${id}`)} />
    <div className="container">
      {invalid && <Alert type="warning" title="Bộ lọc trong đường dẫn chưa hợp lệ. Chọn lại kỳ nghỉ hoặc đặt lại bộ lọc." action={<button className="text-link" onClick={() => setParams({})}>Đặt lại</button>} />}
      {cities.isError && <Alert type="error" title="Chưa tải được điểm đến" action={<button onClick={() => void cities.refetch()}>Thử lại</button>} />}
      <details className="stay-search-filters"><summary>Khoảng giá &amp; tiêu chuẩn sao</summary>
        <form onSubmit={form.handleSubmit((value) => { const next = new URLSearchParams(params); for (const key of ['minPrice', 'maxPrice', 'starRating'] as const) { next.delete(key); if (value[key] !== undefined) next.set(key, String(value[key])) } setParams(next); setPage(0) })} noValidate>
          {(['minPrice', 'maxPrice', 'starRating'] as const).map((key) => <label key={key}><span>{{ minPrice: 'Giá từ (VND/đêm)', maxPrice: 'Giá đến (VND/đêm)', starRating: 'Số sao tối thiểu' }[key]}</span><input type="number" min={key === 'starRating' ? 1 : 0} max={key === 'starRating' ? 5 : undefined} {...form.register(key, { setValueAs: (value: string) => value === '' ? undefined : Number(value) })} />{form.formState.errors[key] && <span className="stay-field-error">{form.formState.errors[key]?.message}</span>}</label>)}
          <button className="btn btn--dark" type="submit">Áp dụng bộ lọc</button>
        </form>
      </details>
    </div>
    <ClientStaysSection stays={stays} totalStaysCount={query.data?.totalElements ?? 0} selectedVibe="all" selectedSort={sort === 'rating' ? 'rating' : sort === 'name' ? 'featured' : 'price-asc'}
      sortOptions={[{ value: 'price-asc', label: 'Giá: thấp đến cao' }, { value: 'rating', label: 'Tiêu chuẩn sao' }, { value: 'featured', label: 'Tên khách sạn' }]}
      filterLabel={city ? `tại ${city.name}` : 'cho kỳ nghỉ của bạn'} hasActiveFilters={params.size > 0} savedIds={savedIds} isLoading={query.isPending && !invalid} isError={query.isError}
      onSelectVibe={() => undefined} onSelectSort={(value) => { const next = new URLSearchParams(params); next.set('sort', value === 'rating' ? 'rating' : value === 'featured' ? 'name' : 'price'); setParams(next); setPage(0) }} onToggleSaved={toggleSaved}
      onOpenStay={(id) => { const next = new URLSearchParams({ checkIn: stay.checkIn, checkOut: stay.checkOut, adults: String(stay.adults), quantity: String(stay.quantity) }); navigate(`/stays/${id}?${next}`) }}
      onResetAll={() => { if (query.isError) void query.refetch(); else setParams({}) }} />
    {query.data && query.data.totalElements > 12 && <div className="container stay-search-pagination"><Pagination current={page + 1} pageSize={12} total={query.data.totalElements} showSizeChanger={false} onChange={(value) => { setPage(value - 1); document.getElementById('stays')?.scrollIntoView({ behavior: 'smooth' }) }} /></div>}
  </>
}
