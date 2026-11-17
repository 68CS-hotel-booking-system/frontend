import { NavLink, useNavigate } from 'react-router'
import { App, Dropdown, type MenuProps } from 'antd'
import { useAuthAction, useCurrentUser, useSession } from '@/features/auth'
import { errorMessage } from '@/shared/api/api-error'
import { ClientFigmaBrand, ClientFigmaIcon } from './ClientFigmaIcon'

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
  const logout = useAuthAction('logout')
  const { message } = App.useApp()
  const session = useSession()
  const { currentUser, isAdmin } = useCurrentUser()
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
    ] : [
      { key: 'login', label: 'Đăng nhập', onClick: () => onOpenAuthModal ? onOpenAuthModal('login') : navigate('/login') },
      { key: 'register', label: 'Đăng ký', onClick: () => onOpenAuthModal ? onOpenAuthModal('register') : navigate('/register') },
    ]),
    ...(!session ? [
      { type: 'divider' as const },
      { key: 'saved', label: `${isSavedActive ? 'Xem tất cả chỗ nghỉ' : 'Chỗ nghỉ đã lưu'} (${savedCount})`, onClick: () => { if (window.location.pathname !== '/' && window.location.pathname !== '/explore') void navigate('/'); onToggleSaved() } },
      { key: 'mobile-nav', label: 'Điều hướng', onClick: onOpenMobileMenu },
    ] : []),
    ...(isAdmin ? [{ key: 'admin', label: 'StayHub Admin', ...openRoute('/admin/users') }] : []),
    ...(session ? [{ type: 'divider' as const }, { key: 'logout', label: logout.isPending ? 'Đang đăng xuất…' : 'Đăng xuất', disabled: logout.isPending, onClick: handleLogout }] : []),
  ]
  return <header className="cf-site-header" id="site-header"><div className="cf-header-inner">
    <NavLink to="/" className="cf-brand" aria-label="StayHub — về trang chủ"><ClientFigmaBrand /></NavLink>
    <nav className="cf-header-nav" aria-label="Điều hướng chính">
      <NavLink to="/" className="cf-nav-stays">Chỗ ở</NavLink>
      <button type="button" className="cf-nav-secondary" onClick={() => void message.info('Trải nghiệm sẽ sớm được cập nhật.')}>Trải nghiệm</button>
      <button type="button" className="cf-nav-secondary" onClick={() => void message.info('Dịch vụ sẽ sớm được cập nhật.')}>Dịch vụ</button>
    </nav>
    <div className="cf-header-actions"><NavLink to="/hotels" className="cf-host-link">Đăng ký khách sạn</NavLink><button type="button" className="cf-locale" aria-label="Ngôn ngữ và tiền tệ" onClick={() => void message.info('Đang sử dụng Tiếng Việt và VND.')}><ClientFigmaIcon name="globe" /></button>
      <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight" classNames={{ root: 'cf-account-dropdown' }}><button type="button" className="cf-account-button" aria-label={session ? `Menu tài khoản ${userName}` : 'Menu tài khoản'}><ClientFigmaIcon name="menu" /><span className="cf-account-avatar">{session ? <span>{userName.trim().charAt(0).toUpperCase()}</span> : <ClientFigmaIcon name="user" />}</span></button></Dropdown>
    </div>
  </div></header>
}
