import { App, Alert, Button, Modal } from 'antd'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSessionIdentity } from '@/shared/hooks/use-session-identity'
import { errorMessage } from '@/shared/api/api-error'
import { PageLoading } from '@/shared/ui/PageLoading'
import { cancelCustomerBooking, getCancellationQuote } from '../api/booking-api'
import { useBookingAction } from '../hooks/use-bookings'
import { checkoutMoney } from '../model/client-checkout'

export function CancellationDialog({ bookingId, onClose }: { bookingId: string; onClose: () => void }) {
  const identity = useSessionIdentity()
  const client = useQueryClient()
  const { message } = App.useApp()
  const quote = useQuery({ queryKey: ['cancellation-quote', identity, bookingId], queryFn: ({ signal }) => getCancellationQuote(bookingId, signal), retry: false, staleTime: 0 })
  const cancel = useBookingAction((body: { expectedVersion: number; expectedRefundAmount: number }) => cancelCustomerBooking(bookingId, undefined, body))
  async function confirm() {
    if (!quote.data?.canCancel || quote.isFetching) return
    try {
      const result = await cancel.mutateAsync({ expectedVersion: quote.data.expectedVersion, expectedRefundAmount: quote.data.refundAmount })
      await Promise.all([client.invalidateQueries({ queryKey: ['refunds'] }), client.invalidateQueries({ queryKey: ['finance-dashboard'] })])
      void message.success(result.status === 'EXPIRED' ? 'Đơn đã hết hạn thanh toán.' : result.cancellation.refundAmount > 0
        ? `Đã hủy đơn. Khoản hoàn ${checkoutMoney(result.cancellation.refundAmount, result.currency)} được ghi nhận trong mục Hoàn tiền của tôi.` : 'Đã hủy đặt phòng.')
      onClose()
    } catch { /* Keep the quote visible and let the customer reload it. */ }
  }
  return <Modal open title="Xác nhận hủy đặt phòng" onCancel={() => { if (!cancel.isPending) onClose() }} closable={!cancel.isPending}
    maskClosable={false} footer={<><Button disabled={cancel.isPending} onClick={onClose}>Giữ đặt phòng</Button>
      <Button danger type="primary" loading={cancel.isPending} disabled={!quote.data?.canCancel || quote.isFetching || cancel.isError} onClick={() => void confirm()}>Xác nhận hủy</Button></>}>
    {quote.isPending ? <PageLoading /> : quote.isError ? <Alert type="error" title="Chưa kiểm tra được chính sách hủy" description={errorMessage(quote.error)} /> : <>
      <p>{quote.data.message}</p>
      <p>Phí hủy: <strong>0 ₫</strong> · Số tiền hoàn: <strong>{checkoutMoney(quote.data.refundAmount, quote.data.currency)}</strong></p>
      <p>Hạn hủy đơn đã thanh toán: {new Date(quote.data.cutoff).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })} (giờ Việt Nam).</p>
      {quote.data.refundAmount > 0 && <p>Yêu cầu hoàn tiền được tạo ngay khi hủy. Tiền sẽ được admin xử lý và cập nhật tiến trình để bạn theo dõi.</p>}
    </>}
    {cancel.isError && <Alert type="error" title="Chưa hủy được đặt phòng" description={errorMessage(cancel.error)} />}
    <Button loading={quote.isFetching} disabled={cancel.isPending} onClick={() => { cancel.reset(); void quote.refetch() }}>Kiểm tra lại chính sách</Button>
  </Modal>
}
