import { useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router'
import { App, Dropdown, type MenuProps } from 'antd'
import { useAuthAction, useCurrentUser, useSession } from '@/features/auth'
import { errorMessage } from '@/shared/api/api-error'
import { ClientReferenceBrand, ClientReferenceIcon } from './ClientReferenceIcon'
import { clientNavigation, isStaySection } from '../model/client-navigation'

interface ClientSiteHeaderProps {
  savedCount: number
  onOpenMobileMenu: () => void
  isMobileMenuOpen?: boolean
  onOpenAuthModal?: (mode?: 'login' | 'register') => void
}

export function ClientSiteHeader({ savedCount, onOpenMobileMenu, isMobileMenuOpen, onOpenAuthModal }: ClientSiteHeaderProps) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const logout = useAuthAction('logout')
  const { message } = App.useApp()
  const session = useSession()
  const { currentUser, isAdmin, isOwner } = useCurrentUser()
  const userName = currentUser?.fullName || currentUser?.email || 'Tài khoản'
  const openRoute = (path: string) => ({ onClick: () => void navigate(path) })
  async function handleLogout() {
    if (logout.isPending) return
    try { await logout.mutateAsync({}); await navigate('/') }
    catch (error) { void message.error(errorMessage(error)) }
  }
  const items: MenuProps['items'] = [
    ...(session ? [
      { key: 'account', label: 'Tài khoản của tôi', ...openRoute('/account') },
      ...(isOwner ? [{ key: 'my-hotels', label: 'Khách sạn của tôi', ...openRoute('/admin/overview') }] : []),
      { key: 'bookings', label: 'Đặt phòng của tôi', ...openRoute('/my-bookings') },
      { key: 'complaints', label: 'Khiếu nại của tôi', ...openRoute('/my-complaints') },
    ] : [
      { key: 'login', label: 'Đăng nhập', onClick: () => onOpenAuthModal ? onOpenAuthModal('login') : navigate('/login') },
      { key: 'register', label: 'Đăng ký', onClick: () => onOpenAuthModal ? onOpenAuthModal('register') : navigate('/register') },
    ]),
    ...(isAdmin ? [{ key: 'admin', label: 'StayHub Admin', ...openRoute('/admin/users') }] : []),
    ...(session ? [{ type: 'divider' as const }, { key: 'logout', label: logout.isPending ? 'Đang đăng xuất…' : 'Đăng xuất', disabled: logout.isPending, onClick: handleLogout }] : []),
  ]
  return <header className="ref-ui ref-site-header" id="site-header"><div className="ref-header-inner">
    <NavLink to="/" className="ref-brand" aria-label="StayHub — về trang chủ"><ClientReferenceBrand /></NavLink>
    <nav className="ref-main-nav" aria-label="Điều hướng chính">
      {clientNavigation.map(({ to, label }) => (
        <Link key={to} to={to} viewTransition className="ref-nav-tab"
          aria-current={(to === '/' ? isStaySection(pathname) : pathname === to) ? 'page' : undefined}>
          {label}
        </Link>
      ))}
    </nav>
    <div className="ref-header-actions">
      <NavLink to="/saved-stays" viewTransition className="stayhub-icon-link"
        aria-label={`Chỗ nghỉ đã lưu (${savedCount})`} title="Chỗ nghỉ đã lưu">
        <ClientReferenceIcon name="heart" size={20} />
        {savedCount > 0 && <span aria-hidden="true">{savedCount}</span>}
      </NavLink>
      <Dropdown open={menuOpen} onOpenChange={setMenuOpen} menu={{ items, onClick: () => setMenuOpen(false) }} trigger={['click']} placement="bottomRight" classNames={{ root: 'cf-account-dropdown ref-theme ref-account-dropdown' }}>
        <button type="button" className="ref-user-pill" aria-label={session ? `Menu tài khoản ${userName}` : 'Menu tài khoản'}><span className="ref-user-initial" aria-hidden="true">{session ? userName.trim().charAt(0).toUpperCase() : <ClientReferenceIcon name="user" />}</span></button>
      </Dropdown>
      <button type="button" className="stayhub-icon-link stayhub-mobile-trigger" id="client-mobile-menu-trigger"
        aria-label="Mở menu điều hướng" aria-haspopup="dialog" aria-expanded={isMobileMenuOpen}
        aria-controls="mobile-menu" onClick={onOpenMobileMenu}>
        <ClientReferenceIcon name="menu" size={20} />
      </button>
    </div>
  </div></header>
}
