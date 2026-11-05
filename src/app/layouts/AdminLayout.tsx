import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import { Dropdown, type MenuProps } from 'antd'
import { useSession } from '@/features/auth'

interface NavItemDef {
  to: string
  label: string
  icon: string
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
      { to: '/admin/overview', label: 'Tổng quan', icon: 'grid_view' },
      { to: '/admin/users', label: 'Người dùng', icon: 'group' },
    ],
  },
  {
    title: 'Quản lý khách sạn',
    items: [
      { to: '/management/hotels', label: 'Khách sạn & Phòng', icon: 'apartment' },
      { to: '/management/rates', label: 'Bảng giá phòng', icon: 'payments' },
      { to: '/management/contracts', label: 'Hợp đồng đối tác', icon: 'description' },
      { to: '/management/financial-access', label: 'Phân quyền tài chính', icon: 'verified_user' },
    ],
  },
  {
    title: 'Hệ thống',
    items: [
      { to: '/system-status', label: 'Trạng thái máy chủ', icon: 'dns' },
    ],
  },
]

export function AdminLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const session = useSession()

  // Close mobile sidebar on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && mobileSidebarOpen) {
        setMobileSidebarOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mobileSidebarOpen])

  // Determine current page title for breadcrumb
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

  // Account dropdown menu
  const accountMenuItems: MenuProps['items'] = [
    {
      key: 'user-info',
      label: (
        <div style={{ padding: '6px 4px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#17212B' }}>
            Nguyễn Văn An
          </div>
          <div style={{ fontSize: '12px', color: '#5F6B76' }}>
            {session ? 'Phiên hoạt động (Memory)' : 'Tài khoản Quản trị viên'}
          </div>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'home',
      icon: <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>travel_explore</span>,
      label: 'Về trang chủ khách',
      onClick: () => navigate('/'),
    },
    { type: 'divider' },
    {
      key: 'auth-link',
      icon: <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>login</span>,
      label: session ? 'Chuyển tài khoản đăng nhập' : 'Trang đăng nhập',
      onClick: () => navigate('/login'),
    },
  ]

  return (
    <div className="admin-body">
      {/* Mobile Drawer Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="admin-mobile-backdrop"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* SIDEBAR (240px Fixed on Desktop, Off-screen Drawer on Mobile) */}
      <aside
        id="admin-sidebar"
        className={`admin-sidebar-fixed ${mobileSidebarOpen ? 'is-open' : ''}`}
        aria-label="Thanh điều hướng quản trị"
      >
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          {/* Logo Brand Header */}
          <div
            style={{
              height: 'var(--admin-header-height)',
              padding: '0 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--admin-border)',
              backgroundColor: 'var(--admin-surface)',
            }}
          >
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
              onClick={() => {
                navigate('/admin/users')
                setMobileSidebarOpen(false)
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--admin-teal)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  flexShrink: 0,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '19px' }}>
                  apartment
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: 'var(--admin-text-primary)',
                    lineHeight: '1.2',
                    letterSpacing: '-0.01em',
                  }}
                >
                  StayHub
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    color: 'var(--admin-text-secondary)',
                    lineHeight: '1.2',
                    fontWeight: 400,
                  }}
                >
                  Admin Portal
                </span>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              type="button"
              className="md:hidden admin-btn-ghost"
              style={{ padding: '6px', lineHeight: 1 }}
              onClick={() => setMobileSidebarOpen(false)}
              aria-label="Đóng thanh điều hướng"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                close
              </span>
            </button>
          </div>

          {/* Navigation Items */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            {NAV_GROUPS.map((group) => (
              <div key={group.title}>
                <div
                  style={{
                    padding: '0 10px',
                    marginBottom: '6px',
                    fontSize: '11px',
                    fontWeight: 500,
                    color: 'var(--admin-text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {group.title}
                </div>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {group.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      style={({ isActive }) => ({
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '7px 10px',
                        borderRadius: 'var(--admin-radius-control)',
                        fontSize: '13px',
                        fontWeight: isActive ? 600 : 500,
                        textDecoration: 'none',
                        color: isActive ? 'var(--admin-teal-ink)' : 'var(--admin-text-secondary)',
                        backgroundColor: isActive ? 'var(--admin-teal-soft)' : 'transparent',
                        position: 'relative',
                        transition: 'background-color 0.12s ease, color 0.12s ease',
                      })}
                      onClick={() => setMobileSidebarOpen(false)}
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <span
                              style={{
                                position: 'absolute',
                                left: 0,
                                top: '4px',
                                bottom: '4px',
                                width: '3px',
                                backgroundColor: 'var(--admin-teal)',
                                borderTopRightRadius: '2px',
                                borderBottomRightRadius: '2px',
                              }}
                            />
                          )}
                          <span
                            className="material-symbols-outlined"
                            style={{
                              fontSize: '18px',
                              color: isActive ? 'var(--admin-teal)' : 'var(--admin-text-secondary)',
                            }}
                          >
                            {item.icon}
                          </span>
                          <span>{item.label}</span>
                        </>
                      )}
                    </NavLink>
                  ))}
                </nav>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Bottom: User Account Profile */}
        <div style={{ padding: '12px', borderTop: '1px solid var(--admin-border)' }}>
          <Dropdown menu={{ items: accountMenuItems }} trigger={['click']} placement="topRight">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 10px',
                borderRadius: 'var(--admin-radius-control)',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--admin-ground)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
              tabIndex={0}
              role="button"
              aria-label="Tài khoản quản trị"
            >
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--admin-teal)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                NA
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    color: 'var(--admin-text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  Nguyễn Văn An
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    color: 'var(--admin-text-secondary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  Quản trị viên
                </span>
              </div>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '18px', color: 'var(--admin-text-secondary)' }}
              >
                unfold_more
              </span>
            </div>
          </Dropdown>
        </div>
      </aside>

      {/* MAIN LAYOUT WRAPPER (padding-left 240px on desktop) */}
      <div className="admin-main-wrapper">
        {/* TOP STICKY HEADER */}
        <header className="admin-header-sticky" role="banner">
          <div
            style={{
              width: '100%',
              height: '100%',
              padding: '0 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
            }}
          >
            {/* Left: Mobile hamburger & Semantic Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
              <button
                type="button"
                className="md:hidden admin-btn-ghost"
                style={{ padding: '6px' }}
                onClick={() => setMobileSidebarOpen(true)}
                aria-label="Mở thanh menu quản trị"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                  menu
                </span>
              </button>

              <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
                <ol
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    margin: 0,
                    padding: 0,
                    listStyle: 'none',
                    fontSize: '13px',
                    color: 'var(--admin-text-secondary)',
                  }}
                >
                  <li>
                    <span
                      style={{ cursor: 'pointer', color: 'var(--admin-text-secondary)' }}
                      onClick={() => navigate('/admin/users')}
                    >
                      Quản trị
                    </span>
                  </li>
                  <li aria-hidden="true" style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                      chevron_right
                    </span>
                  </li>
                  <li style={{ minWidth: 0 }}>
                    <span
                      aria-current="page"
                      style={{
                        color: 'var(--admin-text-primary)',
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: 'block',
                      }}
                    >
                      {currentPageTitle}
                    </span>
                  </li>
                </ol>
              </nav>
            </div>

            {/* Right: Quick actions & User menu */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
              <NavLink
                to="/"
                className="admin-btn-secondary"
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  textDecoration: 'none',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  travel_explore
                </span>
                <span className="hidden sm:inline">Về trang chủ</span>
              </NavLink>

              <Dropdown menu={{ items: accountMenuItems }} trigger={['click']} placement="bottomRight">
                <button
                  type="button"
                  className="admin-btn-ghost"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 8px',
                    borderRadius: 'var(--admin-radius-control)',
                  }}
                  aria-label="Tài khoản cá nhân"
                >
                  <div
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--admin-teal)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 600,
                    }}
                  >
                    NA
                  </div>
                  <span
                    className="hidden sm:inline"
                    style={{ fontSize: '12px', fontWeight: 500, color: 'var(--admin-text-primary)' }}
                  >
                    Nguyễn Văn An
                  </span>
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '16px', color: 'var(--admin-text-secondary)' }}
                  >
                    expand_more
                  </span>
                </button>
              </Dropdown>
            </div>
          </div>
        </header>

        {/* CONTENT CANVAS */}
        <main
          id="main-content"
          tabIndex={-1}
          style={{
            flex: 1,
            width: '100%',
            maxWidth: '1360px',
            margin: '0 auto',
            padding: '24px 28px',
            boxSizing: 'border-box',
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
