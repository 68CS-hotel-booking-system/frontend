import { OperationsReport } from '@/features/reports'
import { PageHeader } from '@/shared/ui/PageHeader'

export function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        kicker="BÁO CÁO & PHÂN TÍCH"
        title="Báo cáo Doanh thu & Vận hành"
        description="Thống kê hiệu suất kinh doanh, tỷ lệ lấp đầy phòng, ADR, RevPAR và doanh thu theo tháng."
      />
      <OperationsReport />
    </div>
  )
}
