import { RefundWorkspace } from '@/features/refunds'
import { CustomerAccountLayout } from './CustomerAccountLayout'
export function MyRefundsPage() {
  return <CustomerAccountLayout section="refunds" title="Hoàn tiền của tôi" description="Theo dõi khoản hoàn và kết quả xử lý cho các đơn đã thanh toán."><RefundWorkspace /></CustomerAccountLayout>
}
