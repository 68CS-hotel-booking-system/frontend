import { useMutation } from '@tanstack/react-query'
import { Alert, Button, Space } from 'antd'
import { Link } from 'react-router'
import { errorMessage } from '@/shared/api/api-error'
import { createVnpayPayment, paymentRedirectUrl } from '../api/payment-api'

export function PaymentButton({ bookingId, disabled = false }: { bookingId: string; disabled?: boolean }) {
  const mutation = useMutation({ mutationFn: async () => {
    const payment = await createVnpayPayment(bookingId)
    const redirect = payment.status === 'PENDING' && payment.paymentUrl ? paymentRedirectUrl(payment.paymentUrl) : null
    return { ...payment, redirect }
  }, retry: false })
  return <Space orientation="vertical">
    <Button type="primary" disabled={disabled || mutation.isPending} loading={mutation.isPending} onClick={() => {
      mutation.mutate(undefined, { onSuccess: (payment) => {
        if (payment.redirect) window.location.assign(payment.redirect)
      } })
    }}>Thanh toán qua VNPay</Button>
    {mutation.isError && <Alert type="error" showIcon title="Chưa thể mở thanh toán" description={errorMessage(mutation.error)} />}
    {mutation.data && <Link to={`/payment/return?paymentId=${mutation.data.id}`}>Kiểm tra trạng thái giao dịch</Link>}
  </Space>
}
