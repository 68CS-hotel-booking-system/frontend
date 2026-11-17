import { useEffect, useState } from 'react'
import { Alert, Button, QRCode, Space, Typography } from 'antd'
import { Link } from 'react-router'
import { errorMessage } from '@/shared/api/api-error'
import { formatCurrencyAmount } from '@/shared/lib/format'
import type { Payment } from '../api/payment-api'
import { usePayment } from '../hooks/use-payment'

export function VnpayQrPayment({ initialPayment, portalUrl }: { initialPayment: Payment; portalUrl: string | null }) {
  const query = usePayment(initialPayment.id)
  const payment = query.data ?? initialPayment
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    if (payment.status !== 'PENDING') return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [payment.status])
  const pending = payment.status === 'PENDING'
  const expired = pending && (payment.expired || Date.parse(payment.expiresAt) <= now)
  const success = payment.status === 'SUCCEEDED'
  const review = success && !payment.bookingConfirmed
  const sandbox = portalUrl != null && new URL(portalUrl).hostname === 'sandbox.vnpayment.vn'
  return <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
    <Typography.Title level={3} style={{ margin: 0 }}>{formatCurrencyAmount(payment.amountVnd, payment.currency)}</Typography.Title>
    {sandbox && <Alert type="info" showIcon title="VNPAY Sandbox" description="Mã QR dành cho thử nghiệm. Sử dụng công cụ hoặc ứng dụng test do VNPAY cung cấp." />}
    {pending && !expired ? <>
      {payment.qrContent ? <>
        <p>Mở ứng dụng ngân hàng hỗ trợ VNPAY-QR để quét mã và kiểm tra số tiền trước khi xác nhận.</p>
        <div style={{ display: 'flex', justifyContent: 'center' }} aria-label="Mã QR thanh toán VNPAY">
          <QRCode value={payment.qrContent} size={240} type="svg" />
        </div>
        <p role="status">Đang chờ xác nhận thanh toán. Trang này sẽ tự cập nhật khi nhận được kết quả.</p>
      </> : <Alert type="warning" showIcon title="Chưa có mã QR cho giao dịch này" description="Bạn có thể mở cổng VNPAY để tiếp tục thanh toán." />}
      <p>Hạn thanh toán: {new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'medium', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(payment.expiresAt))}</p>
      {portalUrl && <a href={portalUrl}>Mở cổng thanh toán VNPAY</a>}
    </> : <Alert showIcon type={success && !review ? 'success' : 'warning'}
      title={review ? 'Đã nhận thanh toán, cần kiểm tra đặt phòng' : success ? 'Đã ghi nhận thanh toán' : expired ? 'Đã hết hạn thanh toán' : 'Thanh toán chưa thành công'}
      description={review ? 'Vui lòng liên hệ hỗ trợ kèm mã giao dịch và không thanh toán lại.' : success ? 'Đơn đặt phòng đã được xác nhận.' : 'Nếu bạn đã thanh toán, hãy kiểm tra lại trạng thái hoặc liên hệ hỗ trợ trước khi tạo đơn khác.'} />}
    {query.isError && <Alert type="warning" showIcon title="Chưa cập nhật được trạng thái" description={errorMessage(query.error)} />}
    <Typography.Text copyable>Mã giao dịch: {payment.id}</Typography.Text>
    <Button loading={query.isFetching} onClick={() => void query.refetch()}>Kiểm tra lại</Button>
    <Link to="/my-bookings">Xem đơn đặt phòng của tôi</Link>
  </Space>
}
