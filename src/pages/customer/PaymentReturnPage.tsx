import { PaymentReturn } from '@/features/payments'
import { PageHeader } from '@/shared/ui/PageHeader'
import '@/shared/styles/account.css'

export function PaymentReturnPage() {
  return <div className="account-workspace">
    <PageHeader title="Kết quả thanh toán" description="Kiểm tra khoản thanh toán cho đơn đặt phòng của bạn." />
    <section className="account-form" aria-label="Trạng thái giao dịch" style={{ maxWidth: 760, margin: '0 auto' }}>
      <PaymentReturn />
    </section>
  </div>
}
