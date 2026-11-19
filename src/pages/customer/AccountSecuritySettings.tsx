import { useState } from 'react'
import { Button, Modal, Switch } from 'antd'
import { AccountPasswordForm } from '@/features/auth'
import { AccountIcon } from '@/shared/ui/AccountIcon'
import '@/shared/styles/customer-security.css'

const providers = [
  { name: 'Google', initial: 'G' },
  { name: 'Facebook', initial: 'f' },
  { name: 'Apple', initial: 'A' },
]

export function AccountSecuritySettings() {
  const [safetyOpen, setSafetyOpen] = useState(false)

  return <div className="customer-security">
    <AccountPasswordForm />

    <section className="security-card" aria-labelledby="security-two-step">
      <div className="security-card-heading">
        <div><h2 id="security-two-step">Xác minh 2 bước</h2><p>Thêm một lớp bảo vệ khi đăng nhập.</p></div>
        <span className="security-badge">Chưa hỗ trợ</span>
      </div>
      <div className="security-two-step">
        <span className="security-icon"><AccountIcon name="shield" /></span>
        <p>Thiết lập xác minh 2 bước hiện chưa khả dụng.</p>
        <Button disabled>Thiết lập</Button>
      </div>
    </section>

    <section className="security-card" aria-labelledby="security-devices">
      <div className="security-card-heading"><div><h2 id="security-devices">Thiết bị &amp; phiên đăng nhập</h2><p>Danh sách các phiên khác hiện chưa khả dụng.</p></div></div>
      <div className="security-row">
        <span className="security-icon"><AccountIcon name="device" /></span>
        <div className="security-row-title">Phiên hiện tại <span className="security-badge">Thiết bị này</span></div>
      </div>
      <div className="security-actions"><Button disabled>Đăng xuất khỏi tất cả thiết bị</Button></div>
    </section>

    <section className="security-card" aria-labelledby="security-alerts">
      <div className="security-card-heading"><div><h2 id="security-alerts">Cảnh báo &amp; liên kết</h2><p>Kiểm soát thông báo bảo mật và cách bạn đăng nhập.</p></div></div>
      <div className="security-alert-row">
        <div><p id="security-alert-label" className="security-row-title">Email cảnh báo đăng nhập lạ</p><p className="security-row-meta">Chưa hỗ trợ cài đặt cảnh báo.</p></div>
        <Switch disabled aria-labelledby="security-alert-label" />
      </div>
      {providers.map(provider => <div className="security-row" key={provider.name}>
        <span className="security-icon" aria-hidden="true">{provider.initial}</span>
        <div><p className="security-row-title">{provider.name}</p><p className="security-row-meta">Chưa hỗ trợ liên kết tài khoản.</p></div>
        <Button type="link" disabled aria-label={`Liên kết ${provider.name}`}>Liên kết</Button>
      </div>)}
    </section>

    <section className="security-card" aria-labelledby="security-tips">
      <div className="security-card-heading"><div><h2 id="security-tips">Bảo vệ tài khoản</h2></div></div>
      <ul className="security-tips">
        <li><AccountIcon name="key" />Dùng mật khẩu riêng cho StayHub, khác với mật khẩu email hoặc mạng xã hội.</li>
        <li><AccountIcon name="shield" />Chỉ đăng nhập trên trang StayHub mà bạn tin cậy.</li>
        <li><AccountIcon name="alert-triangle" />Đăng xuất sau khi dùng thiết bị công cộng hoặc dùng chung.</li>
      </ul>
      <div className="security-actions">
        <button type="button" className="security-help-link" onClick={() => setSafetyOpen(true)}>Đọc thêm ở Trung tâm an toàn</button>
      </div>
    </section>
    <Modal title="Trung tâm an toàn" open={safetyOpen} onCancel={() => setSafetyOpen(false)} footer={null} centered>
      <p>Nếu nghi ngờ mật khẩu đã bị lộ, hãy đổi mật khẩu ngay. Tuyệt đối tránh gửi mật khẩu hoặc liên kết đặt lại mật khẩu cho người khác.</p>
      <p>Khi mất quyền truy cập, dùng mục Quên mật khẩu trên trang đăng nhập để khôi phục tài khoản.</p>
    </Modal>
  </div>
}
