import { z } from 'zod'
import type { HotelSearchParams } from '../api/search-api'

export const listingFiltersSchema = z.object({
  minPrice: z.number().int().nonnegative().safe().optional(),
  maxPrice: z.number().int().nonnegative().safe().optional(),
  starRating: z.number().int().min(1).max(5).optional(),
  sort: z.enum(['name', 'price', 'rating']),
}).refine(v => v.minPrice === undefined || v.maxPrice === undefined || v.maxPrice >= v.minPrice, { path: ['maxPrice'], message: 'Giá tối đa phải từ giá tối thiểu trở lên.' })

export const listingStaySchema = z.object({
  cityId: z.string(),
  checkIn: z.union([z.literal(''), z.iso.date()]),
  checkOut: z.union([z.literal(''), z.iso.date()]),
  adults: z.number().int().min(1).max(50),
  children: z.number().int().min(0).max(49),
}).superRefine((v, ctx) => {
  if (v.adults + v.children > 50) ctx.addIssue({ code: 'custom', path: ['adults'], message: 'Mỗi phòng hỗ trợ tối đa 50 khách khi tìm kiếm.' })
  if (!v.checkIn && !v.checkOut) return
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date())
  const nights = (Date.parse(v.checkOut) - Date.parse(v.checkIn)) / 86400000
  if (!v.checkIn || !v.checkOut || v.checkIn < today || !Number.isFinite(nights) || nights <= 0 || nights > 30) {
    ctx.addIssue({ code: 'custom', path: ['checkOut'], message: 'Chọn ngày từ hôm nay, trả phòng sau nhận phòng và tối đa 30 đêm.' })
  }
})
export type ListingStay = z.infer<typeof listingStaySchema>
export type ListingFilters = z.infer<typeof listingFiltersSchema>

// Empty editable prices use a string so controlled inputs reset without falling
// back to a previous numeric default. Only validated numbers reach the API.
export const listingFilterDraftSchema = z.object({
  minPrice: z.union([z.number(), z.literal('')]),
  maxPrice: z.union([z.number(), z.literal('')]),
  starRating: z.number().optional(),
  sort: z.enum(['name', 'price', 'rating']),
}).transform((value): ListingFilters => ({
  ...value,
  minPrice: value.minPrice === '' ? undefined : value.minPrice,
  maxPrice: value.maxPrice === '' ? undefined : value.maxPrice,
})).pipe(listingFiltersSchema)
export type ListingFilterDraft = z.input<typeof listingFilterDraftSchema>

export function countListingFilters(value: ListingFilters) {
  return Number(value.minPrice !== undefined || value.maxPrice !== undefined) + Number(value.starRating !== undefined)
}

export function updateListingFilters(params: URLSearchParams, value: ListingFilters) {
  const next = new URLSearchParams(params)
  next.delete('page')
  next.delete('quantity')
  for (const key of ['minPrice', 'maxPrice', 'starRating', 'sort'] as const) {
    next.delete(key)
    if (value[key] !== undefined) next.set(key, String(value[key]))
  }
  return next
}

export function parseListingSearch(params: URLSearchParams) {
  const stay = listingStaySchema.safeParse({ cityId: params.get('cityId') ?? '', checkIn: params.get('checkIn') ?? '', checkOut: params.get('checkOut') ?? '', adults: Number(params.get('adults') ?? 2), children: Number(params.get('children') ?? 0) })
  const filters = listingFiltersSchema.safeParse({ minPrice: params.has('minPrice') ? Number(params.get('minPrice')) : undefined, maxPrice: params.has('maxPrice') ? Number(params.get('maxPrice')) : undefined, starRating: params.has('starRating') ? Number(params.get('starRating')) : undefined, sort: params.get('sort') ?? 'name' })
  const page = z.coerce.number().int().nonnegative().safeParse(params.get('page') ?? 0)
  if (!stay.success || !filters.success || !page.success) return null
  const search: HotelSearchParams = { ...filters.data, cityId: stay.data.cityId || undefined, citySlug: stay.data.cityId ? undefined : params.get('citySlug') || undefined, checkIn: stay.data.checkIn || undefined, checkOut: stay.data.checkOut || undefined, guests: stay.data.adults + stay.data.children, page: page.data, size: 8 }
  return { stay: stay.data, filters: filters.data, search }
}

export function updateListingStay(params: URLSearchParams, value: ListingStay) {
  const next = new URLSearchParams(params)
  next.delete('page'); next.delete('quantity'); next.delete('citySlug')
  for (const [key, item] of Object.entries(value)) {
    if (item === '') next.delete(key)
    else next.set(key, String(item))
  }
  return next
}

export function listingDetailHref(hotelId: string, stay: ListingStay) {
  const params = new URLSearchParams({ adults: String(stay.adults), children: String(stay.children) })
  if (stay.checkIn && stay.checkOut) { params.set('checkIn', stay.checkIn); params.set('checkOut', stay.checkOut) }
  return `/stays/${hotelId}?${params}`
}
