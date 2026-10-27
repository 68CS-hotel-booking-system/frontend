import { Button } from 'antd'
import { useNavigate } from 'react-router'
import { EmptyState } from '@/shared/ui/EmptyState'

export function LoginPage() {
  const navigate = useNavigate()
  return (
    <>
      <div className="page-heading">
        <div><h1>Đăng nhập</h1><p>Phiên đăng nhập chưa được kết nối trong bản khung này.</p></div>
      </div>
      <div className="connection-panel">
        <EmptyState
          title="Chức năng xác thực đang được chuẩn bị"
          description="Bạn vẫn có thể kiểm tra kết nối công khai với backend. Các chức năng cần tài khoản sẽ mở sau khi dịch vụ xác thực sẵn sàng."
          action={<Button type="primary" onClick={() => void navigate("/")}>Về trạng thái hệ thống</Button>}
        />
      </div>
    </>
  )
}
