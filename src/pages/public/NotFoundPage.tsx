import { Button, Result } from 'antd'
import { useNavigate } from 'react-router'

export function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <Result
      status="404"
      title="Không tìm thấy trang"
      subTitle="Đường dẫn này chưa tồn tại. Bạn có thể quay về trang trạng thái hệ thống."
      extra={<Button type="primary" onClick={() => void navigate("/")}>Về trang chính</Button>}
    />
  )
}
