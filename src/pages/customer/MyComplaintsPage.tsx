import { MyComplaints } from '@/features/complaints'
import { CustomerAccountLayout } from './CustomerAccountLayout'
export function MyComplaintsPage() {
  return <CustomerAccountLayout section="complaints" title="Khiếu nại của tôi" description="Xem tình trạng xử lý các yêu cầu hỗ trợ cho đơn đặt phòng."><MyComplaints /></CustomerAccountLayout>
}
