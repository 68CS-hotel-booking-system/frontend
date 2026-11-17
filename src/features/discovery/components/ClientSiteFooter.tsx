import { Link, useLocation } from 'react-router'
import { ClientFigmaIcon } from './ClientFigmaIcon'

interface ClientSiteFooterProps { onToast: (message: string) => void }
const groups = [
  { title: 'Hỗ trợ', links: ['Trung tâm trợ giúp', 'AirCover / StayCover', 'Hỗ trợ người khuyết tật', 'Các tùy chọn hủy'] },
  { title: 'Dành cho khách sạn', links: ['Đăng ký khách sạn trên StayHub', 'StayCover cho Chủ nhà', 'Tài nguyên đón tiếp khách', 'Diễn đàn cộng đồng'] },
  { title: 'StayHub', links: ['Trang tin tức', 'Tính năng mới', 'Cơ hội nghề nghiệp', 'Nhà đầu tư'] },
]
export function ClientSiteFooter({ onToast }: ClientSiteFooterProps) {
  const isHotelDetail = useLocation().pathname.startsWith('/stays/')
  const notice = (label: string) => onToast(`${label}: nội dung đang được hoàn thiện.`)
  if (isHotelDetail) return <footer className="hotel-detail-site-footer"><div><span>© {new Date().getFullYear()} StayHub, Inc.</span><span>·</span>{['Quyền riêng tư', 'Điều khoản'].map(label => <span key={label}><button type="button" onClick={() => notice(label)}>{label}</button><span> · </span></span>)}<Link to="/explore">Sơ đồ trang web</Link></div><div><button type="button" onClick={() => onToast('Đang sử dụng Tiếng Việt.')}><ClientFigmaIcon name="globe" />Tiếng Việt (VN)</button><button type="button" onClick={() => onToast('Giá đang hiển thị bằng VND.')}>VND</button></div></footer>
  return <footer className="cf-site-footer"><div className="cf-footer-inner"><div className="cf-footer-columns">{groups.map(group => <section key={group.title}><h2>{group.title}</h2><ul>{group.links.map((label, index) => <li key={label}>{group.title === 'Dành cho khách sạn' && index === 0 ? <Link to="/hotels">{label}</Link> : <button type="button" onClick={() => notice(label)}>{label}</button>}</li>)}</ul></section>)}</div>
    <div className="cf-footer-bottom"><div className="cf-footer-legal"><span>© 2026 StayHub, Inc.</span>{['Quyền riêng tư', 'Điều khoản'].map(label => <span key={label}>· <button type="button" onClick={() => notice(label)}>{label}</button></span>)}<span>· <Link to="/explore">Bản đồ</Link></span></div><div className="cf-footer-locale"><button type="button" onClick={() => onToast('Đang sử dụng Tiếng Việt.')}><ClientFigmaIcon name="globe" />Tiếng Việt (VN)</button><button type="button" onClick={() => onToast('Giá đang hiển thị bằng VND.')}>₫ VND</button></div></div>
  </div></footer>
}
