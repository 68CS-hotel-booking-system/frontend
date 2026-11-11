import { MyComplaints } from '@/features/complaints'
import { PageHeader } from '@/shared/ui/PageHeader'
export function MyComplaintsPage() {
  return <div className="management-page"><PageHeader title="Khiếu nại của tôi" description="Theo dõi các yêu cầu đã gửi cho đơn đặt phòng." /><MyComplaints /></div>
}
