import { ApiOutlined, ArrowRightOutlined, HomeOutlined, LockOutlined } from '@ant-design/icons'
import { NavLink, Outlet } from 'react-router'
import { env } from '@/shared/config/env'

export function AppLayout() {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Đến nội dung chính</a>
      <aside className="app-sidebar">
        <NavLink to="/" className="brand" aria-label={env.appName + ' - Trang chủ'}>
          <span className="brand-mark" aria-hidden="true"><HomeOutlined /></span>
          <span>{env.appName}</span>
        </NavLink>
        <nav className="main-nav" aria-label="Điều hướng chính">
          <NavLink to="/" end>
            <ApiOutlined aria-hidden="true" />
            <span>Trạng thái hệ thống</span>
            <ArrowRightOutlined className="nav-arrow" aria-hidden="true" />
          </NavLink>
          <NavLink to="/login">
            <LockOutlined aria-hidden="true" />
            <span>Đăng nhập</span>
            <ArrowRightOutlined className="nav-arrow" aria-hidden="true" />
          </NavLink>
        </nav>
        <p className="sidebar-note">Không gian phát triển<br />dành cho nhóm dự án.</p>
      </aside>
      <div className="workspace">
        <header className="workspace-header">
          <span>Ứng dụng đặt phòng khách sạn</span>
          <span className="workspace-label">Khung frontend</span>
        </header>
        <main id="main-content" className="main-content" tabIndex={-1}>
          <Outlet />
        </main>
        <footer className="workspace-footer">
          <span>{env.appName}</span>
          <span>Dữ liệu kết nối trực tiếp từ backend.</span>
        </footer>
      </div>
    </div>
  )
}
