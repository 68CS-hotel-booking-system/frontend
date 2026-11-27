import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { voucherCodeSchema } from '../api/voucher-api'
import '../vouchers.css'
const schema = z.object({ code: voucherCodeSchema })
export function CheckoutVoucher({ appliedCode, disabled, onApply, onRemove }: { appliedCode?: string; disabled: boolean; onApply: (code: string) => void; onRemove: () => void }) {
 const { register, handleSubmit, formState: { errors } } = useForm<{ code: string }>({ resolver: zodResolver(schema), defaultValues: { code: '' } })
 return <section className="checkout-voucher" aria-label="Mã giảm giá"><h2>Mã giảm giá</h2>
  {appliedCode ? <div><p>Mã đã chọn: <strong>{appliedCode}</strong></p><button type="button" disabled={disabled} onClick={onRemove}>Bỏ mã</button></div>
   : <form onSubmit={handleSubmit(v => onApply(v.code))}><label htmlFor="checkout-voucher-code">Mã của khách sạn</label><div className="checkout-voucher-input"><input id="checkout-voucher-code" {...register('code')} autoComplete="off" maxLength={30} disabled={disabled} aria-invalid={Boolean(errors.code)} /><button type="submit" disabled={disabled}>Áp dụng</button></div>{errors.code && <p role="alert" className="voucher-error">{errors.code.message}</p>}</form>}
 </section>
}
