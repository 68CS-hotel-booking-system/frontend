import { z } from 'zod'
import { http } from '@/shared/api/http'
const pageSchema = <T extends z.ZodType>(item: T) => z.object({ content: z.array(item), page: z.number().int(), size: z.number().int(), totalElements: z.number().int(), totalPages: z.number().int(), first: z.boolean(), last: z.boolean() })
const money = z.number().int().safe().nonnegative()
export const voucherSchema = z.object({
 id: z.uuid(), hotelId: z.uuid(), code: z.string(), name: z.string(), discountType: z.enum(['PERCENT', 'FIXED']),
 discountValue: money, maxDiscountAmount: money.nullable(), minOrderAmount: money,
 startsAt: z.iso.datetime({ offset: true }), endsAt: z.iso.datetime({ offset: true }),
 usageLimit: z.number().int().positive(), occupiedUses: money, enabled: z.boolean(),
 status: z.enum(['ACTIVE', 'SCHEDULED', 'PAUSED', 'EXPIRED', 'EXHAUSTED']), version: money,
})
export const voucherCodeSchema = z.string().trim().toUpperCase().regex(/^[A-Z0-9][A-Z0-9_-]{2,29}$/, 'Mã gồm 3–30 chữ cái, số, dấu gạch ngang hoặc gạch dưới.')
const amount = z.number().int('Nhập số nguyên.').safe().min(1).max(1_000_000_000_000)
export const voucherFormSchema = z.object({
 code: voucherCodeSchema, name: z.string().trim().min(1, 'Nhập tên chương trình.').max(100),
 discountType: z.enum(['PERCENT', 'FIXED']), discountValue: amount,
 maxDiscountAmount: amount.nullable(), minOrderAmount: z.number().int().min(0).max(1_000_000_000_000),
 startsAt: z.string().min(1, 'Chọn thời gian bắt đầu.'), endsAt: z.string().min(1, 'Chọn thời gian kết thúc.'),
 usageLimit: z.number().int().min(1).max(1_000_000),
}).superRefine((v, ctx) => {
 if (v.discountType === 'PERCENT' && v.discountValue > 99) ctx.addIssue({ code: 'custom', path: ['discountValue'], message: 'Phần trăm giảm từ 1 đến 99.' })
 if (v.discountType === 'FIXED' && v.maxDiscountAmount !== null) ctx.addIssue({ code: 'custom', path: ['maxDiscountAmount'], message: 'Mức giảm cố định không dùng giới hạn giảm thêm.' })
 const start = Date.parse(v.startsAt + '+07:00'), end = Date.parse(v.endsAt + '+07:00')
 if (!Number.isFinite(start)) ctx.addIssue({ code: 'custom', path: ['startsAt'], message: 'Thời gian chưa hợp lệ.' })
 if (!Number.isFinite(end) || end <= start || end <= Date.now()) ctx.addIssue({ code: 'custom', path: ['endsAt'], message: 'Thời gian kết thúc phải sau bắt đầu và sau hiện tại.' })
})
export type Voucher = z.infer<typeof voucherSchema>
export type VoucherValues = z.infer<typeof voucherFormSchema>
export function voucherPayload(v: VoucherValues) {
 const valid = voucherFormSchema.parse(v)
 return { ...valid, startsAt: new Date(valid.startsAt + '+07:00').toISOString(), endsAt: new Date(valid.endsAt + '+07:00').toISOString() }
}
const base = (hotelId: string) => `/management/hotels/${encodeURIComponent(hotelId)}/vouchers`
export const listVouchers = (hotelId: string, page: number, signal?: AbortSignal) => http.request(`${base(hotelId)}?page=${page}&size=10`, { signal, schema: pageSchema(voucherSchema) })
export const createVoucher = (hotelId: string, values: VoucherValues) => http.request(base(hotelId), { method: 'POST', body: voucherPayload(values), schema: voucherSchema })
export const toggleVoucher = (hotelId: string, voucher: Voucher) => http.request(`${base(hotelId)}/${encodeURIComponent(voucher.id)}`, { method: 'PATCH', body: { enabled: !voucher.enabled, expectedVersion: voucher.version }, schema: voucherSchema })
