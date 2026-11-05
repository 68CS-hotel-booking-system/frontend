import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import {
  CloudServerOutlined,
  CompassOutlined,
  DashboardOutlined,
  DollarOutlined,
  DownOutlined,
  FileTextOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuOutlined,
  MenuUnfoldOutlined,
  SafetyCertificateOutlined,
  ShopOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { Dropdown, ConfigProvider, type MenuProps } from 'antd'
import { useQueryClient } from '@tanstack/react-query'
import { setSession } from '@/shared/api/session'
import { useCurrentUser } from '@/features/auth'

const ADMIN_M3_THEME = {
  token: {
    colorPrimary: '#006A6A',
    colorInfo: '#4B607C',
    colorSuccess: '#0D6B40',
    colorWarning: '#8A5A00',
    colorError: '#BA1A1A',
    colorText: '#191C1C',
    colorTextSecondary: '#3F4948',
    colorBgLayout: '#F4FBFB',
    colorBgContainer: '#FFFFFF',
    colorBorder: '#BEC9C8',
    borderRadius: 8,
    borderRadiusLG: 16,
    controlHeight: 40,
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  components: {
    Button: {
      fontWeight: 600,
      borderRadius: 9999,
      controlHeight: 40,
    },
    Card: {
      borderRadiusLG: 16,
      colorBorderSecondary: '#E2E9E9',
    },
    Dropdown: {
      borderRadiusLG: 16,
    },
    Result: {
      titleFontSize: 20,
      subtitleFontSize: 14,
    },
  },
}

interface NavItemDef {
  to: string
  label: string
  icon: typeof DashboardOutlined
  end?: boolean
}

interface NavGroupDef {
  title: string
  items: NavItemDef[]
}

const NAV_GROUPS: NavGroupDef[] = [
  {
    title: 'Quản trị vận hành',
    items: [
      { to: '/admin/overview', label: 'Tổng quan', icon: DashboardOutlined },
      { to: '/admin/users', label: 'Người dùng', icon: TeamOutlined },
    ],
  },
  {
    title: 'Vận hành khách sạn',
    items: [
      { to: '/management/hotels', label: 'Khách sạn & Phòng', icon: ShopOutlined },
      { to: '/management/rates', label: 'Bảng giá phòng', icon: DollarOutlined },
      { to: '/management/contracts', label: 'Hợp đồng đối tác', icon: FileTextOutlined },
      { to: '/management/financial-access', label: 'Phân quyền tài chính', icon: SafetyCertificateOutlined },
    ],
  },
  {
    title: 'Hệ thống',
    items: [
      { to: '/system-status', label: 'Trạng thái máy chủ', icon: CloudServerOutlined },
    ],
  },
]

export function AdminLayout() {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [isRailMode, setIsRailMode] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { currentUser } = useCurrentUser()

  // Auto-collapse to rail on tablet viewports (768px - 1023px)
  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth
      if (width >= 768 && width < 1024) {
        setIsRailMode(true)
      } else if (width >= 1024) {
        setIsRailMode(false)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Close mobile drawer on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && mobileDrawerOpen) {
        setMobileDrawerOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mobileDrawerOpen])

  // Determine current page title
  let currentPageTitle = 'Quản trị'
  if (location.pathname.includes('/admin/users')) {
    currentPageTitle = 'Người dùng'
  } else if (location.pathname.includes('/admin/overview')) {
    currentPageTitle = 'Tổng quan'
  } else if (location.pathname.includes('/management/hotels')) {
    currentPageTitle = 'Khách sạn & Phòng'
  } else if (location.pathname.includes('/management/rates')) {
    currentPageTitle = 'Bảng giá phòng'
  } else if (location.pathname.includes('/management/contracts')) {
    currentPageTitle = 'Hợp đồng đối tác'
  } else if (location.pathname.includes('/management/financial-access')) {
    currentPageTitle = 'Phân quyền tài chính'
  } else if (location.pathname.includes('/system-status')) {
    currentPageTitle = 'Trạng thái máy chủ'
  }

  // Real user display values
  const userFullName = currentUser?.fullName || (currentUser?.email ? currentUser.email.split('@')[0] : 'Quản trị viên')
  const userEmail = currentUser?.email || 'admin@stayhub.internal'
  const userRoles = currentUser?.roles && currentUser.roles.length > 0 ? currentUser.roles : ['ADMIN']
  const userInitials =
    userFullName
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .slice(-2)
      .join('')
      .toUpperCase() || 'AD'

  const handleLogout = () => {
    setSession(null)
    queryClient.clear()
    navigate('/login', { replace: true })
  }

  // Account dropdown menu
  const accountMenuItems: MenuProps['items'] = [
    {
      key: 'user-profile-header',
      label: (
        <div className="py-1 px-1">
          <div className="text-sm font-semibold text-[var(--md-sys-color-on-surface)]">
            {userFullName}
          </div>
          <div className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
            {userEmail}
          </div>
          <div className="mt-2 flex items-center gap-1.5 flex-wrap">
            {userRoles.map((role) => (
              <span
                key={role}
                className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]"
              >
                {role}
              </span>
            ))}
          </div>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'goto-home',
      icon: <CompassOutlined />,
      label: 'Về trang chủ StayHub',
      onClick: () => navigate('/'),
    },
    { type: 'divider' },
    {
      key: 'logout-action',
      icon: <LogoutOutlined className="!text-[var(--md-sys-color-error)]" />,
      label: <span className="text-[var(--md-sys-color-error)] font-medium">Đăng xuất tài khoản</span>,
      onClick: handleLogout,
    },
  ]

  const closeMobileDrawer = () => setMobileDrawerOpen(false)

  return (
    <ConfigProvider theme={ADMIN_M3_THEME}>
      <div className="admin-body">
        {/* Mobile Modal Backdrop */}
        {mobileDrawerOpen && (
          <div
            className="m3-modal-backdrop md:hidden"
            onClick={closeMobileDrawer}
            aria-hidden="true"
          />
        )}

        {/* Material Design 3 Navigation Drawer / Rail */}
        <aside
          id="admin-sidebar"
          className={`m3-nav-drawer ${isRailMode ? 'is-rail' : ''} ${mobileDrawerOpen ? 'is-mobile-open' : ''
            }`}
          aria-label="Thanh điều hướng quản trị"
        >
          <div className="flex flex-col flex-1 min-h-0">
            {/* Brand Header */}
            <div
              className={`h-16 flex items-center ${isRailMode ? 'justify-center px-0' : 'justify-between px-4'
                } border-b border-[var(--md-sys-color-outline-subtle)] bg-[var(--md-sys-color-surface-container-low)]`}
            >
              <NavLink
                to="/admin/overview"
                className={`flex items-center ${isRailMode ? 'justify-center' : 'gap-3'
                  } cursor-pointer no-underline select-none`}
                onClick={closeMobileDrawer}
                aria-label="Về trang tổng quan quản trị StayHub"
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] flex items-center justify-center text-lg shadow-sm shrink-0">
                  <ShopOutlined aria-hidden="true" />
                </div>
                {!isRailMode && (
                  <div className="flex flex-col min-w-0">
                    <span className="text-base font-bold text-[var(--md-sys-color-on-surface)] leading-tight tracking-tight">
                      StayHub
                    </span>
                    <span className="text-[11px] font-semibold text-[var(--md-sys-color-primary)] tracking-wider uppercase">
                      Admin Portal
                    </span>
                  </div>
                )}
              </NavLink>

              {/* Mobile close button */}
              {!isRailMode && (
                <button
                  type="button"
                  className="m3-mobile-only m3-btn-icon"
                  onClick={closeMobileDrawer}
                  aria-label="Đóng thanh điều hướng"
                >
                  <span className="text-lg">✕</span>
                </button>
              )}
            </div>

            {/* Navigation Items (Drawer vs Rail) */}
            <div className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-5">
              {NAV_GROUPS.map((group) => (
                <div key={group.title} className="flex flex-col">
                  {!isRailMode && (
                    <div className="px-3 mb-1.5 text-[11px] font-bold text-[var(--md-sys-color-outline)] uppercase tracking-wider">
                      {group.title}
                    </div>
                  )}
                  <nav className="flex flex-col gap-1" aria-label={group.title}>
                    {group.items.map((item) => {
                      const IconComponent = item.icon
                      if (isRailMode) {
                        return (
                          <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            className={({ isActive }) =>
                              `m3-rail-item ${isActive ? 'is-active' : ''}`
                            }
                            title={item.label}
                            onClick={closeMobileDrawer}
                          >
                            <div className="m3-rail-pill">
                              <IconComponent aria-hidden="true" />
                            </div>
                            <span className="m3-rail-label">{item.label}</span>
                          </NavLink>
                        )
                      }

                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          end={item.end}
                          className={({ isActive }) =>
                            `m3-drawer-item ${isActive ? 'is-active' : ''}`
                          }
                          onClick={closeMobileDrawer}
                        >
                          <span className="m3-drawer-icon">
                            <IconComponent aria-hidden="true" />
                          </span>
                          <span className="truncate">{item.label}</span>
                        </NavLink>
                      )
                    })}
                  </nav>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Footer: Current User Profile Chip */}
          <div className="p-3 border-t border-[var(--md-sys-color-outline-subtle)] bg-[var(--md-sys-color-surface-container-low)]">
            <Dropdown menu={{ items: accountMenuItems }} trigger={['click']} placement="topRight">
              <button
                type="button"
                className={`w-full flex items-center ${isRailMode ? 'justify-center p-2' : 'justify-between px-3 py-2'
                  } rounded-full hover:bg-[var(--md-sys-color-surface-container)] transition-colors cursor-pointer border-none bg-transparent outline-none focus-visible:outline-2 focus-visible:outline-[var(--md-sys-color-primary)]`}
                aria-label={`Tài khoản quản trị viên ${userFullName}`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] flex items-center justify-center text-xs font-bold shrink-0">
                    {userInitials}
                  </div>
                  {!isRailMode && (
                    <div className="flex flex-col text-left min-w-0">
                      <span className="text-xs font-semibold text-[var(--md-sys-color-on-surface)] truncate">
                        {userFullName}
                      </span>
                      <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] truncate">
                        {userEmail}
                      </span>
                    </div>
                  )}
                </div>
                {!isRailMode && (
                  <DownOutlined className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] shrink-0 ml-1" />
                )}
              </button>
            </Dropdown>
          </div>
        </aside>

        {/* Main Content Area */}
        <div
          className={`m3-main-wrapper ${isRailMode ? 'has-rail' : 'has-drawer'
            }`}
        >
          {/* Material Design 3 Top App Bar */}
          <header className="m3-top-app-bar" role="banner">
            {/* Left: Mobile hamburger & Rail collapse toggle & Breadcrumb */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              {/* Mobile Hamburger Toggle */}
              <button
                type="button"
                className="m3-mobile-only m3-btn-icon"
                onClick={() => setMobileDrawerOpen(true)}
                aria-label="Mở menu quản trị"
              >
                <MenuOutlined />
              </button>

              {/* Desktop / Tablet Rail Toggle */}
              <button
                type="button"
                className="m3-desktop-only m3-btn-icon"
                onClick={() => setIsRailMode((prev) => !prev)}
                aria-label={isRailMode ? 'Mở rộng thanh điều hướng' : 'Thu gọn thanh điều hướng'}
                title={isRailMode ? 'Mở rộng thanh điều hướng' : 'Thu gọn thanh điều hướng'}
              >
                {isRailMode ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              </button>

              {/* Semantic Header Title & Breadcrumb */}
              <nav aria-label="Điều hướng phân cấp" className="flex items-center gap-1.5 min-w-0">
                <NavLink
                  to="/admin/overview"
                  className="hidden lg:inline text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-primary)] transition-colors no-underline"
                >
                  Quản trị
                </NavLink>
                <span className="hidden lg:inline text-[var(--md-sys-color-outline)] text-xs">/</span>
                <span className="text-base sm:text-lg font-bold text-[var(--md-sys-color-on-surface)] truncate">
                  {currentPageTitle}
                </span>
              </nav>
            </div>

            {/* Right: Quick action & Account Menu */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <NavLink
                to="/"
                className="m3-btn-outlined !h-9 !px-3 !text-xs sm:!h-10 sm:!px-4 sm:!text-sm"
              >
                <CompassOutlined aria-hidden="true" />
                <span className="hidden sm:inline">Về trang chủ</span>
              </NavLink>

              <Dropdown menu={{ items: accountMenuItems }} trigger={['click']} placement="bottomRight">
                <button
                  type="button"
                  className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-full hover:bg-[var(--md-sys-color-surface-container)] transition-colors border border-[var(--md-sys-color-outline-subtle)] bg-white cursor-pointer outline-none focus-visible:outline-2 focus-visible:outline-[var(--md-sys-color-primary)]"
                  aria-label={`Menu tài khoản ${userFullName}`}
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[var(--md-sys-color-primary)] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {userInitials}
                  </div>
                  <span className="hidden sm:inline text-xs font-semibold text-[var(--md-sys-color-on-surface)] max-w-[120px] truncate">
                    {userFullName}
                  </span>
                  <DownOutlined className="text-[10px] text-[var(--md-sys-color-on-surface-variant)]" />
                </button>
              </Dropdown>
            </div>
          </header>

          {/* Content Canvas */}
          <main
            id="main-content"
            tabIndex={-1}
            className="flex-1 w-full max-w-[1360px] mx-auto p-4 sm:p-6 lg:p-8 box-border outline-none"
          >
            <Outlet />
          </main>
        </div>
      </div>
    </ConfigProvider>
  )
}
