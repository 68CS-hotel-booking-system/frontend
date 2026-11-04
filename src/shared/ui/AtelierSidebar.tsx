import { Switch } from 'antd'
import { useLocation, useNavigate } from 'react-router'
import { useDataMode } from '@/shared/lib/data-mode-context'

export interface AtelierSidebarProps {
  hotelName?: string
}

export function AtelierSidebar({ hotelName }: AtelierSidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { mode, setMode } = useDataMode()

  const pathname = location.pathname

  const navItems = [
    {
      path: '/admin',
      icon: 'dashboard',
      label: 'Tổng quan',
      active:
        pathname === '/admin' ||
        pathname === '/admin/dashboard' ||
        pathname === '/management/dashboard',
    },
    {
      path: '/management/hotels',
      icon: 'meeting_room',
      label: 'Cơ sở & Hạng phòng',
      active: pathname.startsWith('/management/hotels'),
    },
    {
      path: '/management/rates',
      icon: 'calendar_month',
      label: 'Bảng giá theo ngày',
      active: pathname.startsWith('/management/rates'),
    },
    {
      path: '/management/contracts',
      icon: 'payments',
      label: 'Hợp đồng & Doanh thu',
      active: pathname.startsWith('/management/contracts'),
    },
    {
      path: '/management/financial-access',
      icon: 'graph_4',
      label: 'Phân quyền tài chính',
      active: pathname.startsWith('/management/financial-access'),
    },
    {
      path: '/system-status',
      icon: 'tune',
      label: 'Trạng thái hệ thống',
      active: pathname === '/system-status',
    },
  ]

  const publicLinks = [
    {
      path: '/',
      icon: 'travel_explore',
      label: 'Trang chủ Grand Heritage',
    },
    {
      path: '/login',
      icon: 'badge',
      label: 'Cổng nhân sự & Cư dân',
    },
  ]

  return (
    <aside className="atelier-sidebar" aria-label="Thanh điều hướng Atelier OS">
      <div className="atelier-sidebar__top">
        {/* Brand */}
        <div
          className="atelier-brand"
          style={{ cursor: 'pointer' }}
          onClick={() => void navigate('/admin')}
        >
          <div className="atelier-brand__logo" aria-hidden="true">
            <span className="material-symbols-outlined">apartment</span>
          </div>
          <div>
            <span className="atelier-brand__title">Grand Heritage</span>
            <span className="atelier-brand__subtitle">
              {hotelName || 'Hotel & Residences'}
            </span>
          </div>
        </div>

        {/* Primary Management Navigation */}
        <nav className="atelier-nav" aria-label="Menu Quản Trị Hệ Thống">
          {navItems.map((item) => (
            <button
              key={item.path}
              type="button"
              aria-current={item.active ? 'page' : undefined}
              className={`atelier-nav__item ${item.active ? 'is-active' : ''}`}
              onClick={() => void navigate(item.path)}
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Public Sanctuary Section */}
        <div
          style={{
            padding: 12,
            borderRadius: 12,
            backgroundColor: 'var(--atelier-surface-lowest)',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <span className="atelier-sidebar__status-label">
            Cổng dịch vụ &amp; Cư dân
          </span>
          {publicLinks.map((link) => (
            <button
              key={link.path}
              type="button"
              className="atelier-nav__item"
              style={{ padding: '8px 10px', fontSize: 13 }}
              onClick={() => void navigate(link.path)}
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                {link.icon}
              </span>
              <span>{link.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Property Status & Data Source Switch */}
      <div className="atelier-sidebar__status">
        <div className="atelier-sidebar__status-row">
          <span className="atelier-sidebar__status-label">
            Tình trạng cơ sở
          </span>
          <span className="atelier-sidebar__occ-badge">
            <span className="atelier-dot-tertiary" aria-hidden="true" />
            94% Công suất
          </span>
        </div>
        <div
          className="atelier-sidebar__status-row"
          style={{ color: 'var(--atelier-on-surface-variant)' }}
        >
          <span style={{ fontSize: 12 }}>Phiên kiểm toán đêm</span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--atelier-secondary)',
            }}
          >
            04:30 SA
          </span>
        </div>
        <div
          className="atelier-sidebar__status-row"
          style={{
            paddingTop: 8,
            borderTop: '1px solid var(--atelier-surface-highest)',
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 600 }}>
            {mode === 'mock' ? 'Chế độ: Dữ liệu mẫu' : 'Chế độ: Backend API'}
          </span>
          <Switch
            size="small"
            checked={mode === 'api'}
            onChange={(checked) => setMode(checked ? 'api' : 'mock')}
            aria-label="Chuyển đổi nguồn dữ liệu Mock hoặc Backend API"
          />
        </div>
      </div>
    </aside>
  )
}
