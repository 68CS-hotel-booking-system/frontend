import { RevenueDashboard } from '@/features/finance'
import { PageHeader } from '@/shared/ui/PageHeader'

export function FinanceDashboardPage() {
  return <div className="mx-auto w-full max-w-6xl space-y-6">
    <PageHeader title="Doanh thu & hoa hồng"
      description="Theo dõi tiền khách đã thanh toán, doanh thu lưu trú hoàn thành và các khoản phân chia theo hợp đồng." />
    <RevenueDashboard />
  </div>
}
