import { useEffect, useRef } from 'react'
import { NavLink, useNavigate } from 'react-router'
import { CloseOutlined, LogoutOutlined } from '@ant-design/icons'
import { App } from 'antd'
import { useAuthAction, useCurrentUser, useSession } from '@/features/auth'
import { errorMessage } from '@/shared/api/api-error'
import { ClientReferenceBrand } from './ClientReferenceIcon'

interface ClientMobileMenuProps {
  isOpen: boolean
  onClose: () => void
  onOpenAuthModal?: (mode?: 'login' | 'register') => void
}

export function ClientMobileMenu({ isOpen, onClose, onOpenAuthModal }: ClientMobileMenuProps) {
  const navigate = useNavigate()
  const logout = useAuthAction('logout')
  const { message } = App.useApp()
  const session = useSession()
  const { currentUser, isAdmin, isOwner } = useCurrentUser()
  const dialog = useRef<HTMLDialogElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen || !dialog.current) return
    const panel = dialog.current
    const returnFocus = document.getElementById('client-account-menu-trigger')
    const previousOverflow = document.body.style.overflow
    panel.showModal()
    closeButton.current?.focus()
    document.body.style.overflow = 'hidden'
    return () => {
      panel.close()
      document.body.style.overflow = previousOverflow
      if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true })
    }
  }, [isOpen])

  async function handleLogout() {
    if (logout.isPending) return
    try {
      await logout.mutateAsync({})
      onClose()
      await navigate('/')
    } catch (error) { void message.error(errorMessage(error)) }
  }

  return <dialog ref={dialog} className={`mobile-menu cf-mobile-dialog ref-theme ref-ui ${isOpen ? 'is-open' : ''}`}
    id="mobile-menu" aria-label="Menu điều hướng di động" aria-modal="true"
    onCancel={event => { event.preventDefault(); onClose() }}
    onKeyDown={event => {
      if (event.key !== 'Tab') return
      const targets = event.currentTarget.querySelectorAll<HTMLElement>('a[href], button:not(:disabled)')
      const first = targets[0], last = targets[targets.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }}
    onClick={event => {
      if (event.target !== event.currentTarget) return
      const rect = event.currentTarget.getBoundingClientRect()
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose()
    }}>
    <div className="mobile-menu-head">
      <NavLink to="/" className="ref-brand" aria-label="StayHub — về trang chủ" onClick={onClose}><ClientReferenceBrand /></NavLink>
      <button ref={closeButton} className="cf-mobile-close" type="button" aria-label="Đóng menu" onClick={onClose}><CloseOutlined aria-hidden="true" /></button>
    </div>
    <nav aria-label="Điều hướng di động">
      <NavLink to="/" onClick={onClose}>Chỗ ở</NavLink>
      <NavLink to="/explore" onClick={onClose}>Tìm chỗ nghỉ</NavLink>
      {['Trải nghiệm', 'Dịch vụ'].map(label => <button type="button" key={label} onClick={() => { onClose(); void message.info(`${label} đang được phát triển.`) }}>{label}</button>)}
      {session && <>
        <NavLink to="/account" onClick={onClose}>Tài khoản của tôi</NavLink>
        {isOwner && <NavLink to="/admin/overview" onClick={onClose}>Khách sạn của tôi</NavLink>}
        <NavLink to="/my-bookings" onClick={onClose}>Đặt phòng của tôi</NavLink>
        <NavLink to="/my-complaints" onClick={onClose}>Khiếu nại của tôi</NavLink>
      </>}
      {isAdmin && <NavLink to="/admin/users" onClick={onClose}>StayHub Admin</NavLink>}
    </nav>
    <div className="mobile-menu-foot">
      {session ? <>
        <p className="cf-mobile-user">{currentUser?.fullName || currentUser?.email || 'Tài khoản'}</p>
        <button type="button" className="login-btn" disabled={logout.isPending} onClick={handleLogout}><LogoutOutlined /> {logout.isPending ? 'Đang đăng xuất…' : 'Đăng xuất'}</button>
      </> : <button className="login-btn" type="button" onClick={() => {
        onClose()
        if (onOpenAuthModal) onOpenAuthModal('login')
        else void navigate('/login')
      }}>Đăng nhập tài khoản</button>}
      <p className="cf-mobile-locale">Tiếng Việt · VND</p>
    </div>
  </dialog>
}
