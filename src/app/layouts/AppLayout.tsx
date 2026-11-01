import {
  BankOutlined,
  CompassOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  FileProtectOutlined,
  SafetyCertificateOutlined,
  StarOutlined,
  ThunderboltOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Button, Switch, Tooltip } from 'antd'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import { StayVibeFooter } from '@/features/discovery/components/StayVibeFooter'
import { STAYVIBE_FOOTER_GROUPS } from '@/features/discovery/data/stayvibe-mock-data'
import { useDataMode } from '@/shared/lib/data-mode-context'

export function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { mode, setMode } = useDataMode()

  const isManagementRoute = location.pathname.startsWith('/management')

  return (
    <div className="stayvibe-site-shell">
      <a className="skip-link" href="#main-content">
        Đến nội dung chính
      </a>

      {/* Header ngang duy nhất cho toàn bộ trang web */}
      <header className="stayvibe-navbar" role="banner">
        <div className="stayvibe-navbar__container">
          <NavLink
            to="/"
            className="stayvibe-brand-link"
            aria-label="StayVibe Sovereign - Trang chủ đặt phòng nghỉ dưỡng"
          >
            <span className="stayvibe-logo-mark" aria-hidden="true">
              <CompassOutlined />
            </span>
            <span className="stayvibe-brand-stack">
              <span className="stayvibe-logo-text">
                Stay<span className="stayvibe-logo-accent">Vibe</span>
              </span>
              <span className="stayvibe-logo-sub">Private Collection</span>
            </span>
          </NavLink>

          <nav className="stayvibe-navbar__nav" aria-label="Điều hướng chính">
            {isManagementRoute ? (
              <>
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    `stayvibe-navbar__item ${isActive ? 'is-active' : ''}`
                  }
                >
                  <CompassOutlined aria-hidden="true" />
                  <span>Trang chủ</span>
                </NavLink>

                <NavLink
                  to="/management/hotels"
                  className={({ isActive }) =>
                    `stayvibe-navbar__item ${isActive ? 'is-active' : ''}`
                  }
                >
                  <BankOutlined aria-hidden="true" />
                  <span>Quản lý khách sạn</span>
                </NavLink>

                <NavLink
                  to="/management/rates"
                  className={({ isActive }) =>
                    `stayvibe-navbar__item ${isActive ? 'is-active' : ''}`
                  }
                >
                  <DollarOutlined aria-hidden="true" />
                  <span>Bảng giá phòng</span>
                </NavLink>

                <NavLink
                  to="/management/contracts"
                  className={({ isActive }) =>
                    `stayvibe-navbar__item ${isActive ? 'is-active' : ''}`
                  }
                >
                  <FileProtectOutlined aria-hidden="true" />
                  <span>Hợp đồng</span>
                </NavLink>

                <NavLink
                  to="/management/financial-access"
                  className={({ isActive }) =>
                    `stayvibe-navbar__item ${isActive ? 'is-active' : ''}`
                  }
                >
                  <SafetyCertificateOutlined aria-hidden="true" />
                  <span>Phân quyền tài chính</span>
                </NavLink>
              </>
            ) : (
              <>
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    `stayvibe-navbar__item ${isActive ? 'is-active' : ''}`
                  }
                >
                  <CompassOutlined aria-hidden="true" />
                  <span>Khám phá</span>
                </NavLink>

                <a href="#bento-section" className="stayvibe-navbar__item">
                  <EnvironmentOutlined aria-hidden="true" />
                  <span>Điểm đến độc bản</span>
                </a>

                <a href="#vibe-section" className="stayvibe-navbar__item">
                  <ThunderboltOutlined aria-hidden="true" />
                  <span>Phong cách lưu trú</span>
                </a>

                <a href="#hotels-section" className="stayvibe-navbar__item">
                  <StarOutlined aria-hidden="true" />
                  <span>Bộ sưu tập tuyển chọn</span>
                </a>
              </>
            )}
          </nav>

          <div className="stayvibe-navbar__actions">
            {isManagementRoute && (
              <Tooltip
                title={
                  mode === 'mock'
                    ? 'Đang dùng dữ liệu mẫu — Bật để kết nối máy chủ hệ thống'
                    : 'Đang kết nối trực tiếp với máy chủ hệ thống'
                }
              >
                <label className="stayvibe-mode-pill">
                  <Switch
                    size="small"
                    checked={mode === 'api'}
                    onChange={(checked) => setMode(checked ? 'api' : 'mock')}
                    aria-label="Chuyển đổi nguồn dữ liệu"
                  />
                  <span>{mode === 'mock' ? 'Dữ liệu mẫu' : 'Hệ thống thực'}</span>
                </label>
              </Tooltip>
            )}

            <Button
              type="primary"
              icon={<UserOutlined aria-hidden="true" />}
              onClick={() => void navigate('/login')}
            >
              Đăng nhập
            </Button>
          </div>
        </div>
      </header>

      <main id="main-content" className="stayvibe-site-main" tabIndex={-1}>
        <Outlet />
      </main>

      <div className="stayvibe-site-footer-wrap">
        <StayVibeFooter groups={STAYVIBE_FOOTER_GROUPS} />
      </div>
    </div>
  )
}
