import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import {
  AppstoreOutlined,
  ArrowLeftOutlined,
  BarChartOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  CloudServerOutlined,
  CompassOutlined,
  CreditCardOutlined,
  DownOutlined,
  HomeOutlined,
  LogoutOutlined,
  MenuOutlined,
  MessageOutlined,
  SettingOutlined,
  ShopOutlined,
  TagOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Dropdown, type MenuProps } from 'antd'
import { useQueryClient } from '@tanstack/react-query'
import { setSession } from '@/shared/api/session'
import { useCurrentUser } from '@/features/auth'

interface NavItemDef {
  to: string
  label: string
  icon: typeof AppstoreOutlined
  end?: boolean
}

interface NavGroupDef {
  title: string
  items: NavItemDef[]
}

const NAV_GROUPS: NavGroupDef[] = [
  {
    title: 'Bảng điều khiển',
    items: [
      { to: '/admin/overview', label: 'Tổng quan', icon: AppstoreOutlined },
    ],
  },
  {
    title: 'Vận hành',
    items: [
      { to: '/admin/users', label: 'Người dùng & Phân quyền', icon: TeamOutlined },
      { to: '/management/hotels', label: 'Khách sạn', icon: ShopOutlined },
      { to: '/management/bookings', label: 'Đặt phòng', icon: CalendarOutlined },
      { to: '/management/vouchers', label: 'Voucher', icon: TagOutlined },
      { to: '/management/complaints', label: 'Khiếu nại', icon: MessageOutlined },
    ],
  },
  {
    title: 'Tài chính & báo cáo',
    items: [
      { to: '/management/finance', label: 'Tài chính', icon: CreditCardOutlined },
      { to: '/management/reports', label: 'Báo cáo', icon: BarChartOutlined },
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
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { currentUser } = useCurrentUser()

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
  let currentPageTitle = 'Tổng quan'
  if (location.pathname.includes('/admin/users')) {
    currentPageTitle = 'Người dùng & Phân quyền'
  } else if (location.pathname.includes('/admin/overview')) {
    currentPageTitle = 'Tổng quan'
  } else if (location.pathname.includes('/management/hotels')) {
    currentPageTitle = 'Khách sạn'
  } else if (location.pathname.includes('/management/bookings')) {
    currentPageTitle = 'Đặt phòng'
  } else if (location.pathname.includes('/management/vouchers')) {
    currentPageTitle = 'Voucher'
  } else if (location.pathname.includes('/management/complaints')) {
    currentPageTitle = 'Khiếu nại'
  } else if (location.pathname.includes('/management/finance')) {
    currentPageTitle = 'Tài chính'
  } else if (location.pathname.includes('/management/reports')) {
    currentPageTitle = 'Báo cáo'
  } else if (location.pathname.includes('/system-status')) {
    currentPageTitle = 'Trạng thái máy chủ'
  }

  // Real user display values (defaults match design.md sample)
  const userFullName = currentUser?.fullName || (currentUser?.email ? currentUser.email.split('@')[0] : 'Nguyễn Văn C')
  const userEmail = currentUser?.email || 'an.demo06@example.test'
  const userRoles = currentUser?.roles && currentUser.roles.length > 0 ? currentUser.roles : ['ADMIN', 'HOTEL_OWNER']
  const userInitials =
    userFullName
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .slice(-2)
      .join('')
      .toUpperCase() || 'VC'

  const handleLogout = () => {
    setSession(null)
    queryClient.clear()
    navigate('/admin/login', { replace: true })
  }

  // Account dropdown menu items
  const accountMenuItems: MenuProps['items'] = [
    {
      key: 'user-profile-header',
      label: (
        <div className="py-1 px-1">
          <div className="text-sm font-semibold text-[#12211d]">
            {userFullName}
          </div>
          <div className="text-xs text-[#5f736e] mt-0.5">
            {userEmail}
          </div>
          <div className="mt-2 flex items-center gap-1.5 flex-wrap">
            {userRoles.map((role) => (
              <span
                key={role}
                className="inline-flex items-center px-2 py-0.5 rounded text-[10.5px] font-semibold bg-[#d9f0ea] text-[#08473e]"
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
      key: 'profile-action',
      icon: <UserOutlined />,
      label: 'Hồ sơ quản trị',
      onClick: () => setProfileModalOpen(true),
    },
    {
      key: 'settings-action',
      icon: <SettingOutlined />,
      label: 'Cài đặt cổng quản trị',
      onClick: () => setSettingsModalOpen(true),
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
      icon: <LogoutOutlined className="!text-[#9b2c22]" />,
      label: <span className="text-[#9b2c22] font-semibold">Đăng xuất tài khoản</span>,
      onClick: handleLogout,
    },
  ]

  const closeMobileDrawer = () => setMobileDrawerOpen(false)

  return (
    <div className="admin-console-shell bg-[#f4f8f7] text-[#12211d] min-h-screen flex">
      {/* Mobile Backdrop Scrim */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#071c18]/48 backdrop-blur-xs min-[981px]:hidden"
          onClick={closeMobileDrawer}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        id="admin-sidebar"
        className={`fixed min-[981px]:sticky top-0 bottom-0 left-0 z-50 w-[264px] h-screen bg-white border-r border-[#dce7e3] flex flex-col justify-between shrink-0 transition-transform duration-200 ease-out p-3 pt-[18px] pb-3 ${
          mobileDrawerOpen
            ? 'translate-x-0 shadow-2xl'
            : '-translate-x-full min-[981px]:translate-x-0 shadow-none'
        }`}
        aria-label="Thanh điều hướng quản trị"
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Brand Row */}
          <div className="flex items-center justify-between px-2 pb-4 mb-2 border-b border-[#dce7e3]">
            <NavLink
              to="/admin/overview"
              className="flex items-center gap-3 no-underline select-none group"
              onClick={closeMobileDrawer}
              aria-label="StayHub Admin Portal - Về trang tổng quan"
            >
              <div className="w-[38px] h-[38px] rounded-[11px] bg-[#0b5f53] text-white flex items-center justify-center text-lg shadow-sm shrink-0 group-hover:bg-[#08473e] transition-colors">
                <HomeOutlined aria-hidden="true" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[17.5px] font-bold text-[#12211d] leading-[1.1] tracking-tight">
                  StayHub
                </span>
                <span className="text-[9.5px] uppercase font-bold tracking-[.13em] text-[#5f736e]">
                  Admin Portal
                </span>
              </div>
            </NavLink>

            {/* Mobile Close Button */}
            <button
              type="button"
              className="min-[981px]:hidden w-8 h-8 rounded-md flex items-center justify-center text-[#5f736e] hover:text-[#12211d] hover:bg-[#f7fbfa] transition-colors border-0 bg-transparent cursor-pointer"
              onClick={closeMobileDrawer}
              aria-label="Đóng thanh điều hướng"
            >
              <CloseOutlined className="text-sm" />
            </button>
          </div>

          {/* Navigation Links Scroll Container */}
          <div className="flex-1 overflow-y-auto px-1 py-1 flex flex-col gap-5">
            {NAV_GROUPS.map((group) => (
              <div key={group.title} className="flex flex-col">
                <div className="px-3 mb-1 text-[10.5px] font-bold uppercase tracking-[.12em] text-[#5f736e]">
                  {group.title}
                </div>
                <nav className="flex flex-col gap-[2px]" aria-label={group.title}>
                  {group.items.map((item) => {
                    const IconComponent = item.icon
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) =>
                          `admin-nav-link ${isActive ? 'is-active' : ''}`
                        }
                        onClick={closeMobileDrawer}
                      >
                        <span className="text-base shrink-0 flex items-center">
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

        {/* Sidebar Footer User Button */}
        <div className="pt-3 border-t border-[#dce7e3]">
          <Dropdown menu={{ items: accountMenuItems }} trigger={['click']} placement="topRight">
            <button
              type="button"
              className="w-full min-h-[60px] px-3 py-2 rounded-[10px] hover:bg-[#f7fbfa] transition-colors cursor-pointer border-0 bg-transparent flex items-center justify-between gap-2.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#0b5f53]"
              aria-label={`Tài khoản quản trị viên ${userFullName}`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#0b5f53] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {userInitials}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-[#12211d] truncate">
                    {userFullName}
                  </span>
                  <span className="text-[11px] text-[#5f736e] truncate">
                    {userEmail}
                  </span>
                </div>
              </div>
              <DownOutlined className="text-[10px] text-[#5f736e] shrink-0" />
            </button>
          </Dropdown>
        </div>
      </aside>

      {/* Main Column Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top App Bar */}
        <header
          className="sticky top-0 z-40 min-h-[64px] bg-white border-b border-[#dce7e3] px-4 sm:px-7 flex items-center justify-between gap-3 shadow-xs"
          role="banner"
        >
          {/* Left: Mobile hamburger & Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              className="min-[981px]:hidden w-9 h-9 rounded-lg border border-[#bfd3cd] hover:border-[#0b5f53] hover:text-[#0b5f53] text-[#344a44] bg-white flex items-center justify-center cursor-pointer transition-colors"
              onClick={() => setMobileDrawerOpen(true)}
              aria-label="Mở thanh điều hướng"
            >
              <MenuOutlined />
            </button>

            {/* Breadcrumb */}
            <nav aria-label="Điều hướng phân cấp" className="flex items-center gap-1.5 text-[12.5px] min-w-0">
              <NavLink
                to="/admin/overview"
                className="text-[#5f736e] hover:text-[#0b5f53] transition-colors no-underline hidden sm:inline"
              >
                Quản trị
              </NavLink>
              <span className="text-[#bfd3cd] hidden sm:inline">/</span>
              <span className="font-semibold text-[#12211d] truncate">
                {currentPageTitle}
              </span>
            </nav>
          </div>

          {/* Right: Quick actions & User menu */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Back to guest/customer homepage button */}
            <NavLink
              to="/"
              className="admin-guest-btn"
              style={{ color: '#344a44', textDecoration: 'none' }}
              title="Về trang khách"
            >
              <ArrowLeftOutlined aria-hidden="true" className="text-xs" />
              <span className="hidden sm:inline">Về trang khách</span>
            </NavLink>

            {/* User Dropdown Button */}
            <Dropdown menu={{ items: accountMenuItems }} trigger={['click']} placement="bottomRight">
              <button
                type="button"
                className="min-h-[44px] px-3 py-1.5 rounded-full border border-[#bfd3cd] hover:border-[#0b5f53] bg-white transition-colors flex items-center gap-2 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#0b5f53]"
                aria-label={`Menu tài khoản ${userFullName}`}
              >
                <div className="w-7 h-7 rounded-full bg-[#0b5f53] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {userInitials}
                </div>
                <span className="hidden sm:inline text-xs font-semibold text-[#12211d] max-w-[130px] truncate">
                  {userFullName}
                </span>
                <DownOutlined className="text-[10px] text-[#5f736e]" />
              </button>
            </Dropdown>
          </div>
        </header>

        {/* Main Content Body */}
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 w-full max-w-[1360px] mx-auto p-4 sm:p-6 lg:p-8 box-border outline-none"
        >
          <Outlet />
        </main>
      </div>

      {/* Profile Dialog */}
      {profileModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071c18]/48 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="profileDialogTitle"
        >
          <div className="w-full max-w-[500px] p-6 sm:p-7 border border-[#dce7e3] rounded-[16px] bg-white text-[#12211d] shadow-2xl flex flex-col gap-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#dce7e3]">
              <h2 id="profileDialogTitle" className="text-xl font-bold text-[#12211d] m-0">
                Hồ sơ quản trị
              </h2>
              <button
                type="button"
                onClick={() => setProfileModalOpen(false)}
                className="w-8 h-8 rounded-md flex items-center justify-center text-[#5f736e] hover:text-[#12211d] hover:bg-[#f7fbfa] transition-colors border-0 bg-transparent cursor-pointer"
                aria-label="Đóng hộp thoại"
              >
                <CloseOutlined />
              </button>
            </div>

            <div className="flex items-center gap-4 py-2">
              <div className="w-14 h-14 rounded-full bg-[#0b5f53] text-white flex items-center justify-center text-xl font-bold shrink-0">
                {userInitials}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-base font-bold text-[#12211d] truncate">
                  {userFullName}
                </span>
                <span className="text-sm text-[#5f736e] truncate">
                  {userEmail}
                </span>
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  {userRoles.map((role) => (
                    <span
                      key={role}
                      className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#d9f0ea] text-[#08473e]"
                    >
                      {role}
                    </span>
                  ))}
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#eef8f5] text-[#0b5f53] border border-[#d6ebe5]">
                    Phiên demo
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#5f736e] leading-relaxed m-0 p-3 rounded-lg bg-[#f7fbfa] border border-[#dce7e3]">
              Dữ liệu tài khoản quản trị vận hành phục vụ giám sát và phân quyền trên StayHub. Phiên đăng nhập hiện tại được bảo mật trong bộ nhớ máy khách.
            </p>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setProfileModalOpen(false)}
                className="min-h-[40px] px-5 border border-[#bfd3cd] hover:border-[#0b5f53] rounded-[9px] text-sm font-semibold text-[#12211d] bg-transparent transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Dialog */}
      {settingsModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071c18]/48 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="settingsDialogTitle"
        >
          <div className="w-full max-w-[500px] p-6 sm:p-7 border border-[#dce7e3] rounded-[16px] bg-white text-[#12211d] shadow-2xl flex flex-col gap-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#dce7e3]">
              <h2 id="settingsDialogTitle" className="text-xl font-bold text-[#12211d] m-0">
                Cài đặt cổng quản trị
              </h2>
              <button
                type="button"
                onClick={() => setSettingsModalOpen(false)}
                className="w-8 h-8 rounded-md flex items-center justify-center text-[#5f736e] hover:text-[#12211d] hover:bg-[#f7fbfa] transition-colors border-0 bg-transparent cursor-pointer"
                aria-label="Đóng hộp thoại"
              >
                <CloseOutlined />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#eef8f5] border border-[#d6ebe5] flex items-center gap-3 text-sm text-[#08473e]">
              <CheckCircleOutlined className="text-base text-[#0b5f53] shrink-0" />
              <span>Bản xem trước hiện tại không hỗ trợ thay đổi cấu hình tài khoản trực tiếp. Vui lòng liên hệ quản trị viên cấp cao.</span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSettingsModalOpen(false)}
                className="min-h-[40px] px-5 border border-[#bfd3cd] hover:border-[#0b5f53] rounded-[9px] text-sm font-semibold text-[#12211d] bg-transparent transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
