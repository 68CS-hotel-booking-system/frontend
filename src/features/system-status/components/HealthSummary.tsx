import { CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { Tag } from 'antd'
import { env } from '@/shared/config/env'
import type { BackendHealth } from '../types/health'

interface HealthSummaryProps {
  health: BackendHealth
  updatedAt: number
  refreshSeconds: number
}

export function HealthSummary({ health, updatedAt, refreshSeconds }: HealthSummaryProps) {
  const up = health.status === 'UP'
  const checkedAt = new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short', timeStyle: 'medium',
  }).format(updatedAt)

  return (
    <section className="connection-result" aria-labelledby="connection-title" aria-live="polite">
      <div className={'connection-icon ' + (up ? 'is-up' : 'is-warning')} aria-hidden="true">
        {up ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
      </div>
      <div className="connection-heading">
        <Tag color={up ? 'success' : 'warning'}>{up ? 'Đang hoạt động' : health.status}</Tag>
        <h2 id="connection-title">{up ? 'Đã kết nối với backend' : 'Backend báo trạng thái cần kiểm tra'}</h2>
        <p className="muted">Kết quả được lấy trực tiếp từ dịch vụ, không sử dụng dữ liệu giả lập.</p>
      </div>
      <dl className="connection-details">
        <div><dt>Endpoint</dt><dd><code>GET /actuator/health</code></dd></div>
        <div><dt>Trạng thái</dt><dd>{health.status}</dd></div>
        <div><dt>Kiểm tra gần nhất</dt><dd>{checkedAt}</dd></div>
        <div><dt>Chế độ cập nhật</dt><dd>{refreshSeconds === 0 ? 'Thủ công' : 'Mỗi ' + refreshSeconds + ' giây'}</dd></div>
        <div><dt>API nghiệp vụ</dt><dd><code>{env.apiBaseUrl}</code></dd></div>
        <div><dt>Thời gian chờ tối đa</dt><dd>{env.apiTimeoutMs / 1_000} giây</dd></div>
      </dl>
    </section>
  )
}
