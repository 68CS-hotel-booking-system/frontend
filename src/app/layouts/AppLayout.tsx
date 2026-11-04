import { Outlet, useLocation, useNavigate } from 'react-router'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { AtelierSidebar } from '@/shared/ui/AtelierSidebar'

export function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated, logout } = useAuth()

  const pathname = location.pathname

  // Public landing pages (/ & /explore) render their own editorial sanctuary shell.
  const isSelfShelledRoute = pathname === '/' || pathname === '/explore'

  if (isSelfShelledRoute) {
    return (
      <>
        <a className="skip-link" href="#main-content">
          Đến nội dung chính
        </a>
        <Outlet />
      </>
    )
  }

  // All Admin, Management & Operations routes (/admin, /management/*, /system-status)
  // use the unified Atelier OS — Grand Heritage Hotel Sidebar & Top Header shell.
  const isAtelierManagementShell =
    pathname === '/admin' ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/management') ||
    pathname === '/system-status'

  if (isAtelierManagementShell) {
    return (
      <div className="atelier-dashboard-shell">
        <a className="skip-link" href="#main-content">
          Đến nội dung chính
        </a>

        {/* Left Fixed Atelier OS Sidebar */}
        <AtelierSidebar />

        {/* Main Content Offset & Top Header */}
        <div className="atelier-main-offset">
          <header className="atelier-header" role="banner">
            <div className="atelier-header__left">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--atelier-on-surface-variant)',
                  }}
                >
                  Grand Heritage
                </span>
                <span style={{ color: 'var(--atelier-outline-variant)' }}>•</span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: 'var(--atelier-on-surface)',
                  }}
                >
                  {pathname === '/admin' || pathname.startsWith('/admin')
                    ? 'Bảng Điều Khiển Tổng Quan'
                    : pathname.startsWith('/management/hotels')
                      ? 'Quản Lý Cơ Sở & Hạng Phòng'
                      : pathname.startsWith('/management/rates')
                        ? 'Bảng Giá Phòng Theo Ngày'
                        : pathname.startsWith('/management/contracts')
                          ? 'Hợp Đồng & Doanh Thu Đối Tác'
                          : pathname.startsWith('/management/financial-access')
                            ? 'Phân Quyền Báo Cáo Tài Chính'
                            : 'Trạng Thái Hệ Thống'}
                </span>
              </div>
            </div>

            <div className="atelier-header__right">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  className="atelier-icon-circle-btn"
                  aria-label="Tổng quan Grand Heritage"
                  title="Tổng quan Grand Heritage"
                  onClick={() => void navigate('/admin')}
                >
                  <span
                    className="material-symbols-outlined"
                    aria-hidden="true"
                  >
                    dashboard
                  </span>
                </button>
                <button
                  type="button"
                  className="atelier-icon-circle-btn"
                  aria-label="Trang chủ Grand Heritage"
                  title="Trang chủ Grand Heritage"
                  onClick={() => void navigate('/')}
                >
                  <span
                    className="material-symbols-outlined"
                    aria-hidden="true"
                  >
                    travel_explore
                  </span>
                </button>
                <button
                  type="button"
                  className="atelier-icon-circle-btn"
                  aria-label="Trạng thái hệ thống"
                  title="Trạng thái hệ thống"
                  onClick={() => void navigate('/system-status')}
                >
                  <span
                    className="material-symbols-outlined"
                    aria-hidden="true"
                  >
                    notifications_active
                  </span>
                </button>
              </div>

              <div className="atelier-header__divider" aria-hidden="true" />

              {isAuthenticated && user ? (
                <div
                  className="atelier-user-badge"
                  style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                >
                  <div className="atelier-user-badge__text">
                    <span className="atelier-user-badge__name">
                      {user.fullName || user.email}
                    </span>
                    <span className="atelier-user-badge__role">
                      {user.roles.length > 0 ? user.roles[0] : 'Quản trị viên'}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="atelier-icon-circle-btn"
                    title="Đăng xuất"
                    aria-label="Đăng xuất khỏi hệ thống"
                    onClick={() => void logout()}
                    style={{ width: 32, height: 32 }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 16 }}
                      aria-hidden="true"
                    >
                      logout
                    </span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="gh-btn-primary"
                  style={{ padding: '6px 14px', fontSize: 12 }}
                  onClick={() => void navigate('/login')}
                >
                  Đăng nhập
                </button>
              )}
            </div>
          </header>

          <main id="main-content" className="atelier-main-body" tabIndex={-1}>
            <Outlet />
          </main>
        </div>
      </div>
    )
  }

  // Public utility routes (/login, 404 NotFound) use the Grand Heritage Hotel & Residences Header & Footer
  return (
    <div className="atelier-dashboard-shell gh-landing-shell">
      <a className="skip-link" href="#main-content">
        Đến nội dung chính
      </a>

      <header className="gh-header" role="banner">
        <div className="gh-header__inner">
          <a
            href="/"
            className="gh-brand-link"
            onClick={(e) => {
              e.preventDefault()
              void navigate('/')
            }}
          >
            <span className="gh-brand-link__title">Grand Heritage</span>
            <span className="gh-brand-link__subtitle">
              Hotel &amp; Residences
            </span>
          </a>

          <nav className="gh-nav" aria-label="Grand Heritage Primary Navigation">
            <button
              type="button"
              className="gh-nav__link"
              onClick={() => void navigate('/')}
            >
              Suites &amp; Villas
            </button>
            <button
              type="button"
              className="gh-nav__link"
              onClick={() => void navigate('/admin')}
            >
              Atelier OS Admin
            </button>
            <button
              type="button"
              className="gh-nav__link"
              onClick={() => void navigate('/management/hotels')}
            >
              Hotels &amp; Rooms
            </button>
            <button
              type="button"
              className="gh-nav__link"
              onClick={() => void navigate('/management/rates')}
            >
              Daily Rates
            </button>
            <button
              type="button"
              className="gh-nav__link"
              onClick={() => void navigate('/management/contracts')}
            >
              Contracts
            </button>
          </nav>

          <div className="gh-header__actions">
            <button
              type="button"
              className="gh-btn-primary"
              onClick={() => void navigate('/')}
            >
              Explore Sanctuary
            </button>
          </div>
        </div>
      </header>

      <main
        id="main-content"
        style={{
          width: '100%',
          paddingTop: 112,
          paddingBottom: 64,
          minHeight: 'calc(100vh - 180px)',
        }}
        tabIndex={-1}
      >
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 24px' }}>
          <Outlet />
        </div>
      </main>

      <footer
        role="contentinfo"
        style={{
          width: '100%',
          backgroundColor: 'var(--atelier-surface-low)',
          color: 'var(--atelier-on-surface-variant)',
          padding: '28px 24px',
          borderTop: '1px solid var(--atelier-surface-highest)',
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            fontSize: 12,
          }}
        >
          <span>
            © 2025 Grand Heritage Hotel &amp; Residences • Hệ Thống Quản Trị Khách Sạn
          </span>
          <span>Michelin Key 2025 • The Leading Hotels of the World</span>
        </div>
      </footer>
    </div>
  )
}
