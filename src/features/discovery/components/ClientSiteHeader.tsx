import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router'
import { App, Dropdown, type MenuProps } from 'antd'
import { DashboardOutlined, LogoutOutlined } from '@ant-design/icons'
import { useAuthAction, useCurrentUser, useSession } from '@/features/auth'
import { errorMessage } from '@/shared/api/api-error'
import { formatRoleLabel } from '@/shared/lib/format'
import { ClientIcon } from './ClientSiteIcons'

interface ClientSiteHeaderProps {
  savedCount: number
  isSavedActive: boolean
  pulseSaved: boolean
  onToggleSaved: () => void
  onOpenMobileMenu: () => void
  isMobileMenuOpen?: boolean
  onOpenAuthModal?: (mode?: 'login' | 'register') => void
}

export function ClientSiteHeader({
  savedCount,
  isSavedActive,
  pulseSaved,
  onToggleSaved,
  onOpenMobileMenu,
  isMobileMenuOpen = false,
  onOpenAuthModal,
}: ClientSiteHeaderProps) {
  const navigate = useNavigate()
  const logout = useAuthAction('logout')
  const { message } = App.useApp()
  const session = useSession()
  const { currentUser, isAdmin } = useCurrentUser()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const userFullName =
    currentUser?.fullName ||
    (currentUser?.email ? currentUser.email.split('@')[0] : 'Tài khoản')
  const userEmail = currentUser?.email || ''
  const userInitials =
    userFullName
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .slice(-2)
      .join('')
      .toUpperCase() || 'SH'

  const handleLogout = async () => {
    if (logout.isPending) return
    try {
      await logout.mutateAsync({})
      await navigate('/')
    } catch (error) {
      void message.error(errorMessage(error))
    }
  }

  const accountMenuItems: MenuProps['items'] = [
    { key: 'bookings', label: <NavLink to="/my-bookings">Đặt phòng của tôi</NavLink> },
    { key: 'complaints', label: <NavLink to="/my-complaints">Khiếu nại của tôi</NavLink> },
    { key: 'profile', label: <NavLink to="/account">Hồ sơ của tôi</NavLink> },
    { key: 'staff', label: <NavLink to="/staff">Nhân sự khách sạn</NavLink> },
    {
      key: 'user-profile-header',
      label: (
        <div className="py-1 px-1">
          <div className="text-sm font-semibold text-[var(--ink)]">
            {userFullName}
          </div>
          {userEmail && (
            <div className="text-xs text-[var(--muted)] mt-0.5">
              {userEmail}
            </div>
          )}
          {currentUser?.roles && currentUser.roles.length > 0 && (
            <div className="mt-2 flex items-center gap-1.5 flex-wrap">
              {currentUser.roles.map((role) => (
                <span
                  key={role}
                  className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[var(--accent-pale)] text-[var(--accent)]"
                >
                  {formatRoleLabel(role)}
                </span>
              ))}
            </div>
          )}
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    ...(isAdmin
      ? [
          {
            key: 'admin-portal-link',
            icon: <DashboardOutlined className="!text-[var(--accent)]" />,
            label: (
              <NavLink
                to="/admin/users"
                className="font-semibold text-[var(--accent)]"
              >
                StayHub Admin
              </NavLink>
            ),
          },
          { type: 'divider' as const },
        ]
      : []),
    {
      key: 'logout-action',
      icon: <LogoutOutlined className="!text-red-600" />,
      label: <span className="text-red-600 font-medium">Đăng xuất tài khoản</span>,
      onClick: handleLogout,
    },
  ]

  return (
    <header
      className={`site-header ${isScrolled ? 'is-scrolled' : ''}`}
      id="site-header"
      data-od-id="site-header"
    >
      <div className="header-inner">
        <a className="brand" href="/" data-od-id="brand-logo" aria-label="StayHub — về trang chủ">
          <span className="brand-mark">
            <ClientIcon name="compass" />
          </span>
          <span className="brand-word">
            <strong>StayHub</strong>
            <span>Bộ sưu tập lưu trú</span>
          </span>
        </a>

        <nav className="main-nav" aria-label="Điều hướng chính" data-od-id="main-nav">
          <NavLink to="/">Khám phá</NavLink>
          <NavLink to="/#destinations">Điểm đến</NavLink>
          <NavLink to="/#stays">Chỗ nghỉ</NavLink>
          <NavLink to="/#journal">Trải nghiệm</NavLink>
          <NavLink to="/#partner">Đối tác</NavLink>
          {isAdmin && (
            <NavLink
              to="/admin/users"
              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[var(--accent-pale)] text-[var(--accent)] hover:opacity-90 inline-flex items-center gap-1.5"
            >
              <DashboardOutlined />
              <span>StayHub Admin</span>
            </NavLink>
          )}
        </nav>

        <div className="header-actions">
          <span className="locale">
            <ClientIcon name="globe" /> VI · VND
          </span>

          <button
            className={`icon-btn ${isSavedActive ? 'is-active' : ''}`}
            id="saved-btn"
            type="button"
            aria-label={savedCount ? `Xem ${savedCount} chỗ nghỉ đã lưu` : 'Xem chỗ nghỉ đã lưu'}
            onClick={onToggleSaved}
          >
            <ClientIcon name="heart" />
            <span
              className={`saved-count ${savedCount === 0 ? 'is-empty' : ''} ${pulseSaved ? 'pulse' : ''}`}
              id="saved-count"
            >
              {savedCount}
            </span>
          </button>

          {session ? (
            <Dropdown menu={{ items: accountMenuItems }} trigger={['click']} placement="bottomRight">
              <button
                type="button"
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1 rounded-full border border-[var(--line)] bg-[var(--white)] hover:bg-[var(--paper)] transition-colors cursor-pointer outline-none focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                aria-label={`Menu tài khoản ${userFullName}`}
              >
                <div className="w-7 h-7 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {userInitials}
                </div>
                <span className="hidden sm:inline text-xs font-semibold text-[var(--ink)] max-w-[120px] truncate">
                  {userFullName}
                </span>
              </button>
            </Dropdown>
          ) : (
            <a
              href="/login"
              className="login-btn login-btn-desktop"
              id="login-btn"
              data-od-id="login-btn"
              onClick={(e) => {
                if (onOpenAuthModal) {
                  e.preventDefault()
                  onOpenAuthModal('login')
                }
              }}
            >
              Đăng nhập
            </a>
          )}

          <button
            className="icon-btn menu-btn"
            id="menu-btn"
            type="button"
            aria-label="Mở menu"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            onClick={onOpenMobileMenu}
          >
            <ClientIcon name="menu" />
          </button>
        </div>
      </div>
    </header>
  )
}
