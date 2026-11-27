import { afterEach, beforeEach, expect, it, vi } from 'vitest'
const fetcher = vi.fn<typeof fetch>()
const id = '11111111-1111-4111-8111-111111111111'
const values = { code: ' save10 ', name: ' Kỳ nghỉ ', discountType: 'PERCENT' as const, discountValue: 10, maxDiscountAmount: 100000, minOrderAmount: 500000, startsAt: '2030-01-01T07:00', endsAt: '2030-02-01T07:00', usageLimit: 100 }
const voucher = { ...values, id, hotelId: id, code: 'SAVE10', startsAt: '2030-01-01T00:00:00Z', endsAt: '2030-02-01T00:00:00Z', occupiedUses: 1, enabled: true, status: 'ACTIVE', version: 3 }
const response = (data: unknown) => fetcher.mockResolvedValue(new Response(JSON.stringify({ message: 'ok', data })))
beforeEach(() => { vi.resetModules(); fetcher.mockReset(); vi.stubGlobal('fetch', fetcher) })
afterEach(() => vi.unstubAllGlobals())
it('creates a hotel voucher with normalized code, integer money and explicit Vietnam time', async () => {
 response(voucher)
 const { createVoucher } = await import('./voucher-api')
 await createVoucher(id, values)
 expect(fetcher.mock.calls[0][0]).toBe('/api/v1/management/hotels/' + id + '/vouchers')
 expect(JSON.parse(fetcher.mock.calls[0][1]?.body as string)).toEqual({ ...values, code: 'SAVE10', name: 'Kỳ nghỉ', startsAt: '2030-01-01T00:00:00.000Z', endsAt: '2030-02-01T00:00:00.000Z' })
})
it('lists server usage and pauses using the expected version', async () => {
 response({ content: [voucher], page: 1, size: 10, totalElements: 11, totalPages: 2, first: false, last: true })
 const { listVouchers, toggleVoucher } = await import('./voucher-api')
 const page = await listVouchers(id, 1)
 expect(page.content[0].occupiedUses).toBe(1)
 expect(fetcher.mock.calls[0][0]).toContain('?page=1&size=10')
 response({ ...voucher, enabled: false, status: 'PAUSED', version: 4 })
 await toggleVoucher(id, page.content[0])
 expect(JSON.parse(fetcher.mock.calls[1][1]?.body as string)).toEqual({ enabled: false, expectedVersion: 3 })
})
it('rejects invalid codes, fractional money, oversized percentages and reversed dates', async () => {
 const { voucherFormSchema } = await import('./voucher-api')
 for (const change of [{ code: 'a b' }, { discountValue: 1.5 }, { discountValue: 100 }, { endsAt: '2020-01-01T00:00' }, { usageLimit: 0 }, { discountType: 'FIXED', maxDiscountAmount: 1 }]) expect(voucherFormSchema.safeParse({ ...values, ...change }).success).toBe(false)
 expect(fetcher).not.toHaveBeenCalled()
})
it('preserves conflicts and does not automatically repeat mutations', async () => {
 fetcher.mockResolvedValue(new Response(JSON.stringify({ code: 'VOUCHER_VERSION_CONFLICT', detail: 'Tải lại.' }), { status: 409 }))
 const { toggleVoucher, voucherSchema } = await import('./voucher-api')
 await expect(toggleVoucher(id, voucherSchema.parse(voucher))).rejects.toMatchObject({ status: 409, code: 'VOUCHER_VERSION_CONFLICT' })
 expect(fetcher).toHaveBeenCalledTimes(1)
})
