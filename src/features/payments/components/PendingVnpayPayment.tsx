import { useEffect, useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Alert, QRCode } from 'antd'
import { ApiError, errorMessage } from '@/shared/api/api-error'
import { formatCurrencyAmount } from '@/shared/lib/format'
import { createVnpayPayment, createVnpayQrPayment, paymentRedirectUrl, type Payment } from '../api/payment-api'
import { usePayment } from '../hooks/use-payment'

const dateTime = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'Asia/Ho_Chi_Minh',
})

type Props = {
  bookingId: string
  expiresAt: string | null
  amount: number
  currency: string
  roomAmount: number
  surcharge: number
  discount: number
}

export function PendingVnpayPayment({ bookingId, expiresAt, amount, currency, roomAmount, surcharge, discount }: Props) {
  const requestedQr = useRef<string>(null)
  const [now, setNow] = useState(Date.now)
  const [lastPayment, setLastPayment] = useState<Payment>()
  const client = useQueryClient()
  const mutation = useMutation({
    mutationFn: async (method: 'qr' | 'portal') => {
      const payment = await (method === 'qr' ? createVnpayQrPayment(bookingId) : createVnpayPayment(bookingId))
      if (payment.bookingId !== bookingId) throw new ApiError('Dữ liệu giao dịch không khớp với đơn.', { kind: 'invalid-response' })
      if (method === 'portal' && payment.status === 'PENDING' && !payment.expired && Date.parse(payment.expiresAt) > Date.now()) {
        if (!payment.paymentUrl) throw new ApiError('Chưa có đường dẫn tới cổng VNPay.', { kind: 'invalid-response' })
        window.location.assign(paymentRedirectUrl(payment.paymentUrl))
      }
      return payment
    },
    onSuccess: setLastPayment,
    retry: false,
  })
  const query = usePayment(lastPayment?.id ?? null)
  const payment = query.data ?? lastPayment
  const deadline = Math.min(Date.parse(expiresAt ?? ''), payment ? Date.parse(payment.expiresAt) : Infinity)
  const seconds = Number.isFinite(deadline) ? Math.max(0, Math.ceil((deadline - now) / 1000)) : 0
  const expired = seconds === 0 || Boolean(payment?.expired && payment.status === 'PENDING')
  const paid = payment?.status === 'SUCCEEDED'
  const confirmed = paid && payment.bookingConfirmed
  const locked = expired || paid || mutation.isPending
  const { mutate } = mutation

  useEffect(() => {
    if (expired || paid || Date.now() >= deadline || requestedQr.current === bookingId) return
    requestedQr.current = bookingId
    mutate('qr')
  }, [bookingId, deadline, expired, mutate, paid])

  useEffect(() => {
    if (expired || paid) return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [expired, paid])

  useEffect(() => {
    if (confirmed) void client.invalidateQueries({ queryKey: ['bookings'] })
  }, [confirmed, client])

  const countdown = [Math.floor(seconds / 60), seconds % 60].map(value => String(value).padStart(2, '0')).join(':')
  const money = (value: number) => formatCurrencyAmount(value, currency)
  const qr = payment?.status === 'PENDING' && !expired ? payment.qrContent : null

  function start(method: 'qr' | 'portal') {
    if (locked || Date.now() >= deadline) return
    mutate(method)
  }

  return <aside className="pending-pay-card" aria-label="Thanh toán đặt phòng">
    {!paid && <div className="pending-pay-timer" data-state={expired ? 'expired' : seconds < 120 ? 'urgent' : 'active'}>
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" strokeLinecap="round" /></svg>
      <div>
        <span>{expired ? 'Đã hết thời gian giữ phòng' : 'Giữ phòng còn'}</span>
        <strong role="timer" aria-label="Thời gian giữ phòng còn lại">{expired ? '00:00' : countdown}</strong>
        {Number.isFinite(deadline) && <p>Hạn thanh toán {dateTime.format(deadline)}</p>}
      </div>
    </div>}
    <dl className="pending-pay-cost">
      <div><dt>Tiền phòng</dt><dd>{money(roomAmount)}</dd></div>
      {surcharge > 0 && <div><dt>Phụ thu</dt><dd>{money(surcharge)}</dd></div>}
      {discount > 0 && <div><dt>Giảm giá</dt><dd>−{money(discount)}</dd></div>}
      <div className="pending-pay-total"><dt>Tổng tiền</dt><dd>{money(amount)}</dd></div>
    </dl>
    {paid ? <Alert showIcon type={confirmed ? 'success' : 'warning'}
      title={confirmed ? 'Đã ghi nhận thanh toán' : 'Đã nhận thanh toán, cần kiểm tra đặt phòng'}
      description={confirmed ? 'Đơn đặt phòng đã được xác nhận.' : 'Vui lòng liên hệ hỗ trợ kèm mã giao dịch. Không cần thanh toán lại.'} />
      : expired ? <p className="pending-pay-note" role="status">Giao dịch đã hết thời gian thanh toán. Nếu bạn vừa trả tiền, hãy kiểm tra lại trạng thái giao dịch.</p>
        : <fieldset className="pending-pay-methods">
          <legend>Phương thức thanh toán</legend>
          <div className="pending-pay-qr">
            <strong>Quét mã VNPay QR</strong>
            {qr ? <>
              <div aria-label="Mã QR thanh toán VNPay"><QRCode value={qr} size={208} type="svg" /></div>
              <p>{payment?.paymentUrl?.startsWith('https://sandbox.vnpayment.vn/') ? 'Mã thử nghiệm. Quét bằng công cụ thử nghiệm của VNPay.' : 'Mở ứng dụng hỗ trợ VNPay QR để quét mã.'}</p>
              <p role="status">Đang chờ xác nhận thanh toán…</p>
            </> : mutation.isIdle || (mutation.isPending && mutation.variables === 'qr') ?
              <p role="status">Đang lấy mã QR từ VNPay…</p> :
              <button type="button" className="pending-pay-secondary" disabled={locked} onClick={() => start('qr')}>Tải lại mã QR</button>}
          </div>
          <label className="pending-pay-option">
            <input type="radio" name="pending-payment-method" defaultChecked disabled={mutation.isPending} aria-label="VNPay" />
            <span className="pending-pay-option-body">
              <span className="pending-pay-option-title"><strong>VNPay</strong><span className="pending-pay-recommended">Khuyên dùng</span></span>
              <small>Ứng dụng ngân hàng, thẻ ATM hoặc quét mã QR.</small>
            </span>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="6" width="18" height="14" rx="2" /><path d="M3 10h18m-5 5h2M5 3h13" strokeLinecap="round" /></svg>
          </label>
          <button type="button" className="pending-pay-primary" disabled={locked} onClick={() => start('portal')}>
            {mutation.isPending && mutation.variables === 'portal' ? 'Đang mở cổng VNPay…' : `Thanh toán ${money(amount)}`}
          </button>
        </fieldset>}
    {!expired && !paid && payment?.status === 'FAILED' && <Alert type="warning" showIcon title="Thanh toán chưa thành công" />}
    {mutation.isError && <Alert type="error" showIcon title="Chưa thể mở thanh toán" description={errorMessage(mutation.error)} />}
    {query.isError && <Alert type="warning" showIcon title="Chưa cập nhật được trạng thái" description={errorMessage(query.error)} />}
    {payment && <button type="button" className="pending-pay-status" disabled={query.isFetching} onClick={() => void query.refetch()}>Kiểm tra trạng thái giao dịch</button>}
    {paid && !confirmed && <p className="pending-pay-note">Mã giao dịch: {payment.id}</p>}
  </aside>
}
