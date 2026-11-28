import { useState } from 'react'
import { Alert, Button, Modal, Pagination } from 'antd'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ApiError, errorMessage } from '@/shared/api/api-error'
import { PageLoading } from '@/shared/ui/PageLoading'
import { voucherFormSchema, type VoucherValues } from '../api/voucher-api'
import { useVoucherActions, useVouchers } from '../hooks/use-vouchers'
import '../vouchers.css'
const money = (v: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v)
const date = (v: string) => new Date(v).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', dateStyle: 'short', timeStyle: 'short' })
const statuses = { ACTIVE: 'Đang áp dụng', SCHEDULED: 'Chưa bắt đầu', PAUSED: 'Tạm dừng', EXPIRED: 'Hết hạn', EXHAUSTED: 'Hết lượt' }
export function VoucherPanel({ hotelId }: { hotelId: string }) {
 const [page, setPage] = useState(0), [open, setOpen] = useState(false), [creating, setCreating] = useState(false)
 const query = useVouchers(hotelId, page), { toggle } = useVoucherActions(hotelId)
 const conflict = toggle.error instanceof ApiError && toggle.error.status === 409
 return <section className="voucher-panel" aria-label="Voucher của khách sạn">
  <div className="voucher-toolbar"><div><h2>Mã giảm giá</h2><p>Mỗi đơn dùng một mã. Khách sạn chịu phần giảm trên tiền phòng.</p></div>
   <Button type="primary" onClick={() => setOpen(true)}>Tạo voucher</Button><Button aria-label="Làm mới" loading={query.isFetching} onClick={() => { toggle.reset(); void query.refetch() }}>Làm mới</Button></div>
  <p className="voucher-note">Lượt đã giữ / dùng gồm đơn đang chờ thanh toán còn hạn và đơn đã thanh toán. Đơn chưa thanh toán bị hủy hoặc hết hạn sẽ trả lượt; đơn đã thanh toán bị hủy vẫn tính lượt dùng.</p>
  {toggle.isError && <Alert type="error" showIcon title="Chưa cập nhật được voucher" description={errorMessage(toggle.error)} action={conflict ? <Button onClick={() => { toggle.reset(); void query.refetch() }}>Tải phiên bản mới</Button> : undefined} />}
  {query.isPending ? <PageLoading /> : query.isError ? <Alert type="error" showIcon title="Chưa tải được voucher" description={errorMessage(query.error)} action={<Button onClick={() => void query.refetch()}>Thử lại</Button>} />
   : query.data.content.length === 0 ? <div className="voucher-empty"><h3>{page ? 'Không có voucher ở trang này' : 'Chưa có mã giảm giá'}</h3><p>Tạo mã và chia sẻ với khách để áp dụng khi đặt phòng.</p></div>
    : <ul className="voucher-list">{query.data.content.map(v => <li key={v.id}>
      <div className="voucher-row-title"><div><h3>{v.name}</h3><code>{v.code}</code></div><span className="voucher-status">{statuses[v.status]}</span></div>
      <dl><div><dt>Mức giảm</dt><dd>{v.discountType === 'PERCENT' ? `${v.discountValue}%${v.maxDiscountAmount ? ' · tối đa ' + money(v.maxDiscountAmount) : ''}` : money(v.discountValue)}</dd></div>
       <div><dt>Tiền phòng tối thiểu</dt><dd>{money(v.minOrderAmount)}</dd></div>
       <div><dt>Thời gian áp dụng (giờ Việt Nam)</dt><dd>{date(v.startsAt)} → {date(v.endsAt)}</dd></div>
       <div><dt>Lượt đã giữ / dùng</dt><dd>{v.occupiedUses} / {v.usageLimit}</dd></div></dl>
      <Button aria-label={v.enabled ? 'Tạm dừng' : 'Bật lại'} loading={toggle.isPending && toggle.variables?.id === v.id} disabled={toggle.isPending || conflict || v.status === 'EXPIRED'} onClick={() => toggle.mutate(v)}>{v.enabled ? 'Tạm dừng' : 'Bật lại'}</Button>
     </li>)}</ul>}
  {query.data && query.data.totalPages > 1 && <Pagination current={page + 1} total={query.data.totalElements} pageSize={10} showSizeChanger={false} onChange={v => { toggle.reset(); setPage(v - 1) }} />}
  <Modal title="Tạo voucher" open={open} footer={null} width={640} onCancel={() => { if (!creating) setOpen(false) }} closable={!creating} keyboard={!creating} maskClosable={false} destroyOnHidden>
   {open && <VoucherForm hotelId={hotelId} onBusy={setCreating} onDone={() => { setOpen(false); setPage(0) }} />}</Modal>
 </section>
}
function VoucherForm({ hotelId, onDone, onBusy }: { hotelId: string; onDone: () => void; onBusy: (value: boolean) => void }) {
 const { create } = useVoucherActions(hotelId)
 const { register, control, setValue, handleSubmit, formState: { errors } } = useForm<VoucherValues>({ resolver: zodResolver(voucherFormSchema), defaultValues: { code: '', name: '', discountType: 'PERCENT', discountValue: 10, maxDiscountAmount: null, minOrderAmount: 0, startsAt: '', endsAt: '', usageLimit: 100 } })
 const type = useWatch({ control, name: 'discountType' })
 const fields = [['code', 'Mã giảm giá'], ['name', 'Tên chương trình'], ['discountValue', type === 'PERCENT' ? 'Phần trăm giảm' : 'Số tiền giảm (VND)'], ['minOrderAmount', 'Tiền phòng tối thiểu (VND)'], ['usageLimit', 'Tổng lượt sử dụng'], ['startsAt', 'Bắt đầu (giờ Việt Nam)'], ['endsAt', 'Kết thúc (giờ Việt Nam)']] as const
 return <form className="voucher-form" onSubmit={handleSubmit(async v => { onBusy(true); try { await create.mutateAsync(v); onDone() } catch { /* Retain the draft. */ } finally { onBusy(false) } })}>
  <p>Thông tin chương trình được giữ cố định sau khi tạo. Bạn có thể tạm dừng mã và tạo mã mới khi muốn thay đổi ưu đãi.</p>
  <fieldset disabled={create.isPending}><label htmlFor="voucher-type">Kiểu giảm giá</label>
   <Controller name="discountType" control={control} render={({ field }) => <select id="voucher-type" {...field} onChange={e => { field.onChange(e); if (e.target.value === 'FIXED') setValue('maxDiscountAmount', null) }}><option value="PERCENT">Theo phần trăm</option><option value="FIXED">Số tiền cố định</option></select>} />
   <div className="voucher-fields">{fields.map(([name, label]) => <div key={name}><label htmlFor={'voucher-' + name}>{label}</label>
    <input id={'voucher-' + name} type={name.endsWith('At') ? 'datetime-local' : 'text'} inputMode={['discountValue', 'minOrderAmount', 'usageLimit'].includes(name) ? 'numeric' : undefined} maxLength={name === 'code' ? 30 : name === 'name' ? 100 : undefined}
     {...register(name, ['discountValue', 'minOrderAmount', 'usageLimit'].includes(name) ? { setValueAs: v => v === '' ? NaN : Number(v) } : {})} aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? 'voucher-error-' + name : undefined} />
    {errors[name] && <p role="alert" className="voucher-error" id={'voucher-error-' + name}>{errors[name]?.message}</p>}</div>)}</div>
   {type === 'PERCENT' && <div><label htmlFor="voucher-cap">Giảm tối đa (VND, có thể bỏ trống)</label><input id="voucher-cap" type="text" inputMode="numeric" {...register('maxDiscountAmount', { setValueAs: v => v === '' ? null : Number(v) })} aria-invalid={Boolean(errors.maxDiscountAmount)} />{errors.maxDiscountAmount && <p role="alert" className="voucher-error">{errors.maxDiscountAmount.message}</p>}</div>}
  </fieldset><p className="voucher-note">Giảm theo tiền phòng, làm tròn xuống đến đồng; không giảm hết tiền phòng. Thời hạn áp dụng là lúc khách tạo đơn.</p>
  {create.isError && <Alert type="error" showIcon title="Chưa tạo được voucher" description={errorMessage(create.error)} />}
  <Button type="primary" htmlType="submit" loading={create.isPending}>Tạo mã giảm giá</Button>
 </form>
}
