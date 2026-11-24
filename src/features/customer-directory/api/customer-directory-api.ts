import { z } from 'zod'
import { http } from '@/shared/api/http'

const count = z.number().int().nonnegative().safe()
const contact = z.object({ id: z.uuid(), fullName: z.string().nullable(), email: z.string().nullable(), phone: z.string().nullable(), hotelCount: count })
const hotelCustomerSchema = contact.extend({ bookingCount: count, completedBookingCount: count, lastBookedAt: z.iso.datetime({ offset: true }) })
const partnerCustomerSchema = contact.extend({ contractCount: count, activeContractCount: count, lastContractCreatedAt: z.iso.datetime({ offset: true }) })
const pageFields = { page: count, size: z.number().int().positive(), totalElements: count, totalPages: count, first: z.boolean(), last: z.boolean() }
const hotelPageSchema = z.object({ ...pageFields, content: z.array(hotelCustomerSchema) })
const partnerPageSchema = z.object({ ...pageFields, content: z.array(partnerCustomerSchema) })
export type HotelCustomer = z.infer<typeof hotelCustomerSchema>
export type PartnerCustomer = z.infer<typeof partnerCustomerSchema>
export type CustomerRow = HotelCustomer | PartnerCustomer
export interface CustomerPage { content: CustomerRow[]; page: number; size: number; totalElements: number; totalPages: number; first: boolean; last: boolean }
export type CustomerScope = 'partners' | 'hotel-guests'
export interface CustomerParams { page: number; size: number; keyword: string }

export function getCustomers(scope: CustomerScope, params: CustomerParams, signal?: AbortSignal): Promise<CustomerPage> {
  const search = new URLSearchParams({ page: String(params.page), size: String(params.size) })
  if (params.keyword.trim()) search.set('keyword', params.keyword.trim())
  const base = scope === 'partners' ? '/admin/customers' : '/management/customers'
  return scope === 'partners'
    ? http.request(`${base}?${search}`, { signal, schema: partnerPageSchema })
    : http.request(`${base}?${search}`, { signal, schema: hotelPageSchema })
}
