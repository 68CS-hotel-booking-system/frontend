import { Link } from 'react-router'
import { StatusMessage } from '@/shared/ui/StatusMessage'

export function NotFoundPage() {
  return <StatusMessage
    title="Không tìm thấy trang này"
    description="Liên kết có thể đã thay đổi hoặc không còn tồn tại. Bạn có thể về trang chủ để tiếp tục tìm chỗ nghỉ."
  >
    <Link to="/">Về trang chủ</Link>
  </StatusMessage>
}
