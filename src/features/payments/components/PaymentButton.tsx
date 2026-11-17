import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Alert, Button, Modal, Space } from 'antd'
import { Link } from 'react-router'
import { errorMessage } from '@/shared/api/api-error'
import { createVnpayQrPayment, paymentRedirectUrl } from '../api/payment-api'
import { VnpayQrPayment } from './VnpayQrPayment'

export function PaymentButton({ bookingId, disabled = false }: { bookingId: string; disabled?: boolean }) {
  const [open, setOpen] = useState(false)
  const mutation = useMutation({ mutationFn: async () => {
    const payment = await createVnpayQrPayment(bookingId)
    const redirect = payment.status === 'PENDING' && payment.paymentUrl ? paymentRedirectUrl(payment.paymentUrl) : null
    return { ...payment, redirect }
  }, retry: false })
  return <Space orientation="vertical">
    <Button type="primary" disabled={disabled || mutation.isPending} loading={mutation.isPending} onClick={() => {
      mutation.mutate(undefined, { onSuccess: (payment) => {
        if (payment) setOpen(true)
      } })
    }}>Thanh toán qua VNPay</Button>
    {mutation.isError && <Alert type="error" showIcon title="Chưa thể mở thanh toán" description={errorMessage(mutation.error)} />}
    {mutation.data && <Link to={`/payment/return?vnp_TxnRef=${mutation.data.id}`}>Kiểm tra trạng thái giao dịch</Link>}
    <Modal title="Thanh toán VNPAY-QR" open={open} onCancel={() => setOpen(false)} footer={null} destroyOnHidden centered>
      {open && mutation.data && <VnpayQrPayment key={mutation.data.id} initialPayment={mutation.data} portalUrl={mutation.data.redirect} />}
    </Modal>
  </Space>
}
