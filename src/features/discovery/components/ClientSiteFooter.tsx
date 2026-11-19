import { Link, useLocation } from 'react-router'
import { useCurrentUser, useSession } from '@/features/auth'
import { ClientFigmaIcon } from './ClientFigmaIcon'

export function ClientSiteFooter() {
  const isHotelDetail = /^\/stays\/[^/]+\/(checkout|booking)(?:\/|$)/.test(useLocation().pathname)
  const session = useSession()
  const { isOwner, isAdmin } = useCurrentUser()
  const groups = [
    { title: 'Khám phá', links: [{ label: 'Tìm chỗ nghỉ', to: '/explore' }, { label: 'Trải nghiệm', to: '/experiences' }, { label: 'Dịch vụ', to: '/services' }] },
    { title: 'Chuyến đi của bạn', links: [{ label: 'Chỗ nghỉ đã lưu', to: '/saved-stays' }, { label: 'Đặt phòng của tôi', to: '/my-bookings' }, { label: 'Khiếu nại của tôi', to: '/my-complaints' }] },
    { title: 'Tài khoản', links: [
      { label: 'Tài khoản của tôi', to: '/account' },
      ...(isOwner ? [{ label: 'Khách sạn của tôi', to: '/admin/overview' }] : []),
      ...(isAdmin ? [{ label: 'StayHub Admin', to: '/admin/overview' }] : []),
      ...(!session ? [{ label: 'Đăng nhập', to: '/login' }, { label: 'Đăng ký tài khoản', to: '/register' }] : []),
    ] },
  ]
  const locale = <div className="cf-footer-locale ref-footer-prefs"><span className="ref-pref-label"><ClientFigmaIcon name="globe" />Tiếng Việt (VN)</span><span className="ref-pref-label">₫ VND</span></div>
  if (isHotelDetail) return <footer className="hotel-detail-site-footer"><div><span>© {new Date().getFullYear()} StayHub</span><Link to="/explore">Tìm chỗ nghỉ</Link><Link to="/my-bookings">Đặt phòng của tôi</Link><Link to="/services">Dịch vụ</Link></div>{locale}</footer>
  return <footer className="ref-ui ref-site-footer"><div className="ref-wrap">
    <div className="ref-footer-cols">{groups.map(group => <section key={group.title}><h2 className="ref-footer-heading">{group.title}</h2><ul className="ref-footer-list">{group.links.map(link => <li key={link.label}><Link to={link.to}>{link.label}</Link></li>)}</ul></section>)}</div>
    <div className="ref-footer-bottom"><div className="ref-footer-legal"><span>© {new Date().getFullYear()} StayHub</span></div>{locale}</div>
  </div></footer>
}
