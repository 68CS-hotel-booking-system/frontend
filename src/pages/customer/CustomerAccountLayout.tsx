import type { ReactNode } from 'react'
import { App, Button, Dropdown, Typography } from 'antd'
import { Link, useNavigate } from 'react-router'
import { useAuthAction, useCurrentUser } from '@/features/auth'
import { errorMessage } from '@/shared/api/api-error'
import { AccountIcon, type AccountIconName } from '@/shared/ui/AccountIcon'
import '@/shared/styles/account.css'
import '@/shared/styles/customer-account-reference.css'

interface CustomerAccountLayoutProps {
  section: 'profile' | 'security' | 'bookings' | 'complaints' | 'staff'
  title: string
  description: string
  mobileDescription?: string
  checkoutReturn?: string
  children: ReactNode
}

export function CustomerAccountLayout({ section, title, description, mobileDescription = description, checkoutReturn, children }: CustomerAccountLayoutProps) {
  const { currentUser } = useCurrentUser()
  const navigate = useNavigate()
  const logout = useAuthAction('logout')
  const { message, modal } = App.useApp()
  const profileHref = checkoutReturn ? `/account?returnTo=${encodeURIComponent(checkoutReturn)}` : '/account'
  const securityHref = checkoutReturn ? `/account?section=security&returnTo=${encodeURIComponent(checkoutReturn)}` : '/account?section=security'
  const destinations: { key: string; label: string; icon: AccountIconName; href?: string; onClick?: () => void }[] = [
    { key: 'profile', label: 'Thông tin cá nhân', icon: 'user', href: profileHref },
    { key: 'security', label: 'Đăng nhập & bảo mật', icon: 'lock', href: securityHref },
    { key: 'bookings', label: 'Đặt phòng của tôi', icon: 'bed', href: '/my-bookings' },
    { key: 'saved', label: 'Chỗ nghỉ đã lưu', icon: 'heart', href: '/saved-stays' },
    { key: 'complaints', label: 'Khiếu nại của tôi', icon: 'chat', href: '/my-complaints' },
    { key: 'staff', label: 'Nhân sự khách sạn', icon: 'staff', href: '/staff' },
  ]
  async function handleLogout() {
    if (logout.isPending) return
    try {
      await logout.mutateAsync({})
      await navigate('/')
    } catch (error) {
      void message.error(errorMessage(error))
    }
  }
  const referenceLayout = section === 'bookings' || section === 'profile' || section === 'security'
  const breadcrumb = <nav className="account-breadcrumb" aria-label="Đường dẫn"><Link to={profileHref}>Tài khoản</Link><span aria-hidden="true">/</span><span aria-current="page">{title}</span></nav>
  const signOut = <button type="button" className="account-nav-item account-sign-out" onClick={() => void handleLogout()} disabled={logout.isPending}>
    <AccountIcon name="logout" /><span>{logout.isPending ? 'Đang đăng xuất…' : 'Đăng xuất'}</span>
  </button>
  return <div className={`customer-account-shell${referenceLayout ? ' customer-account-reference' : ''}${section === 'bookings' ? ' customer-account-trips' : ''}`}>
    <div className="account-page">
      {referenceLayout && breadcrumb}
      {referenceLayout && checkoutReturn && <Link className="account-back account-checkout-return" to={checkoutReturn}><AccountIcon name="back" />Quay lại xác nhận đặt phòng</Link>}
      {!referenceLayout && <>
        <Link className="account-back" to={checkoutReturn ?? '/'}>
          <AccountIcon name="back" />
          {checkoutReturn ? 'Quay lại xác nhận đặt phòng' : <><span className="account-desktop-copy">Khám phá khách sạn</span><span className="account-mobile-copy">Tài khoản</span></>}
        </Link>
        <div className="account-mobile-navigation">
          <Dropdown trigger={['click']} menu={{ selectedKeys: [section], items: [
            ...destinations.map(item => ({ key: item.key, label: item.label, icon: <AccountIcon name={item.icon} />,
              onClick: item.href ? () => void navigate(item.href!) : item.onClick })),
            { type: 'divider' },
            { key: 'logout', label: logout.isPending ? 'Đang đăng xuất…' : 'Đăng xuất', disabled: logout.isPending, icon: <AccountIcon name="logout" />, onClick: () => void handleLogout() },
          ] }} classNames={{ root: 'account-navigation-dropdown' }}>
            <Button className="account-navigation-trigger" aria-label="Điều hướng tài khoản"><span>{title}</span><AccountIcon name="down" /></Button>
          </Dropdown>
        </div>
      </>}
      <div className="account-layout">
        <aside className="account-sidebar" aria-label="Tài khoản của bạn">
          <div className="account-identity">
            <span className="account-avatar" aria-hidden="true">{currentUser?.fullName.trim().charAt(0).toUpperCase() || 'N'}</span>
            <div className="account-identity-text">
              <button type="button" className="account-identity-name" aria-label={`Thông tin tài khoản ${currentUser?.fullName ?? ''}`} onClick={() => {
                if (currentUser) modal.info({ title: 'Thông tin tài khoản', content: <div><p>{currentUser.email}</p><p>Mã tài khoản: <Typography.Text copyable className="account-member-id">{currentUser.id}</Typography.Text></p></div> })
              }}>{currentUser?.fullName || 'Tài khoản'}</button>
              <p>Tài khoản của bạn</p>
            </div>
          </div>
          <nav className="account-sidebar-nav" aria-label="Cài đặt và hoạt động tài khoản">
            {destinations.map((item, index) => <div key={item.key}>
              {index === 2 && <hr />}
              {item.href ? <Link to={item.href} className="account-nav-item" aria-current={section === item.key ? 'page' : undefined}>
                <AccountIcon name={item.icon} /><span>{item.label}</span>
              </Link> : <button type="button" className="account-nav-item" onClick={item.onClick}>
                <AccountIcon name={item.icon} /><span>{item.label}</span>
              </button>}
            </div>)}
            {referenceLayout && <><hr />{signOut}</>}
          </nav>
          {!referenceLayout && signOut}
        </aside>
        <section className="account-content" aria-labelledby="account-page-title">
          {!referenceLayout && breadcrumb}
          <header className="account-heading">
            <h1 id="account-page-title">{title}</h1>
            <p className="account-desktop-copy">{description}</p>
            <p className="account-mobile-copy">{mobileDescription}</p>
          </header>
          {children}
        </section>
      </div>
    </div>
  </div>
}
