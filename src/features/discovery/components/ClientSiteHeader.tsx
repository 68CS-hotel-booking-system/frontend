import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router'
import { App, Dropdown, type MenuProps } from 'antd'
import { useAuthAction, useCurrentUser, useSession } from '@/features/auth'
import { errorMessage } from '@/shared/api/api-error'
import { ClientReferenceBrand, ClientReferenceIcon } from './ClientReferenceIcon'

interface ClientSiteHeaderProps {
  savedCount: number
  isSavedActive: boolean
  pulseSaved: boolean
  onToggleSaved: () => void
  onOpenMobileMenu: () => void
  isMobileMenuOpen?: boolean
  onOpenAuthModal?: (mode?: 'login' | 'register') => void
}

export function ClientSiteHeader({ savedCount, isSavedActive, onToggleSaved, onOpenMobileMenu, onOpenAuthModal }: ClientSiteHeaderProps) {
  const navigate = useNavigate()
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
    ] : [
      { key: 'login', label: 'Đăng nhập', onClick: () => onOpenAuthModal ? onOpenAuthModal('login') : navigate('/login') },
      { key: 'register', label: 'Đăng ký', onClick: () => onOpenAuthModal ? onOpenAuthModal('register') : navigate('/register') },
    ]),
    ...(!session ? [
      { type: 'divider' as const },
      { key: 'saved', label: `${isSavedActive ? 'Xem tất cả chỗ nghỉ' : 'Chỗ nghỉ đã lưu'} (${savedCount})`, onClick: () => { if (window.location.pathname !== '/' && window.location.pathname !== '/explore') void navigate('/'); onToggleSaved() } },
    ] : []),
    { key: 'mobile-nav', label: 'Điều hướng', onClick: () => { setMenuOpen(false); onOpenMobileMenu() } },
    ...(isAdmin ? [{ key: 'admin', label: 'StayHub Admin', ...openRoute('/admin/users') }] : []),
    ...(session ? [{ type: 'divider' as const }, { key: 'logout', label: logout.isPending ? 'Đang đăng xuất…' : 'Đăng xuất', disabled: logout.isPending, onClick: handleLogout }] : []),
  ]
  return <header className="ref-ui ref-site-header" id="site-header"><div className="ref-header-inner">
    <NavLink to="/" className="ref-brand" aria-label="StayHub — về trang chủ"><ClientReferenceBrand /></NavLink>
    <nav className="ref-main-nav" aria-label="Điều hướng chính">
      <NavLink to="/" className="ref-nav-tab" end>Chỗ ở</NavLink>
      {['Trải nghiệm', 'Dịch vụ'].map(label => <button key={label} type="button" className="ref-nav-tab" onClick={() => void message.info(`${label} đang được phát triển.`)}>{label}<span className="ref-nav-new" aria-hidden="true">Mới</span></button>)}
    </nav>
    <div className="ref-header-actions">
      <span className="ref-locale" title="Tiếng Việt · VND"><ClientReferenceIcon name="globe" /></span>
      <Dropdown open={menuOpen} onOpenChange={setMenuOpen} menu={{ items, onClick: () => setMenuOpen(false) }} trigger={['click']} placement="bottomRight" classNames={{ root: 'cf-account-dropdown ref-theme ref-account-dropdown' }}>
        <button type="button" className="ref-user-pill" id="client-account-menu-trigger" aria-label={session ? `Menu tài khoản ${userName}` : 'Menu tài khoản'}><ClientReferenceIcon name="menu" /><span className="ref-user-initial" aria-hidden="true">{session ? userName.trim().charAt(0).toUpperCase() : <ClientReferenceIcon name="user" />}</span></button>
      </Dropdown>
    </div>
  </div></header>
}
