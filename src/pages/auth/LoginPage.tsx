import {
  CompassOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import { Button, Space, Tag } from 'antd'
import { useNavigate } from 'react-router'
import { EmptyState } from '@/shared/ui/EmptyState'

export function LoginPage() {
  const navigate = useNavigate()
  return (
    <div className="management-page rates-management-page">
      <header className="rates-page-header" aria-labelledby="login-page-title">
        <div className="rates-page-header__content">
          <span className="rates-page-header__kicker">
            <SafetyCertificateOutlined aria-hidden="true" /> CỔNG ĐĂNG NHẬP ĐỐI TÁC &amp; HỘI VIÊN
          </span>
          <h1 id="login-page-title" className="rates-page-header__title">
            Đăng nhập Không gian StayVibe Sovereign
          </h1>
          <p className="rates-page-header__desc">
            Dịch vụ tài khoản và xác thực hiện đang được hoàn thiện kết nối với
            hệ thống máy chủ. Bạn vẫn có thể tự do khám phá bộ sưu tập khu nghỉ
            dưỡng.
          </p>
        </div>
        <div className="rates-page-header__actions">
          <Tag color="gold" style={{ fontSize: '13px', padding: '4px 12px' }}>
            Đang hoàn thiện
          </Tag>
        </div>
      </header>

      <div className="connection-panel">
        <EmptyState
          title="Chức năng đăng nhập đang được chuẩn bị"
          description="Bạn có thể khám phá bộ sưu tập khu nghỉ dưỡng, kiểm tra trạng thái hệ thống hoặc trải nghiệm các phân hệ quản trị danh mục."
          action={
            <Space wrap>
              <Button
                type="primary"
                icon={<CompassOutlined aria-hidden="true" />}
                onClick={() => void navigate('/')}
              >
                Khám phá Khu nghỉ dưỡng
              </Button>
              <Button
                icon={<ThunderboltOutlined aria-hidden="true" />}
                onClick={() => void navigate('/system-status')}
              >
                Kiểm tra trạng thái hệ thống
              </Button>
            </Space>
          }
        />
      </div>
    </div>
  )
}
