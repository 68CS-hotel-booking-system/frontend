import {
  ArrowRightOutlined,
  CompassOutlined,
  ThunderboltFilled,
} from '@ant-design/icons'
import { useNavigate } from 'react-router'
import type { FooterLinkGroup } from '@/features/discovery/data/stayvibe-mock-data'

interface StayVibeFooterProps {
  groups: FooterLinkGroup[]
}

export function StayVibeFooter({ groups }: StayVibeFooterProps) {
  const navigate = useNavigate()

  function handleFooterLinkClick(
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) {
    if (href.startsWith('/')) {
      event.preventDefault()
      void navigate(href)
    }
  }

  return (
    <footer className="stayvibe-footer" role="contentinfo">
      <div className="stayvibe-promo-banner">
        <div className="stayvibe-promo-banner__text">
          <span className="stayvibe-promo-kicker">
            <ThunderboltFilled aria-hidden="true" /> DÀNH CHO ĐỐI TÁC LƯU TRÚ
          </span>
          <h2 className="stayvibe-promo-title">
            Đồng hành vận hành khách sạn, bảng giá &amp; hợp đồng trên một nền
            tảng
          </h2>
          <p className="stayvibe-promo-desc">
            Quản lý hồ sơ khách sạn, cập nhật tiện ích, theo dõi bảng giá phòng
            theo ngày và đối soát hợp đồng minh bạch.
          </p>
        </div>

        <div className="stayvibe-promo-banner__actions">
          <button
            type="button"
            className="stayvibe-promo-btn-light"
            onClick={() => void navigate('/management/hotels')}
          >
            <span>Quản lý khách sạn</span>
            <ArrowRightOutlined aria-hidden="true" />
          </button>
          <button
            type="button"
            className="stayvibe-promo-btn-glass"
            onClick={() => void navigate('/management/rates')}
          >
            <span>Xem bảng giá phòng</span>
          </button>
        </div>
      </div>

      <div className="stayvibe-footer__grid">
        <div className="stayvibe-footer__brand-col">
          <div className="stayvibe-footer__logo">
            <span className="stayvibe-logo-mark" aria-hidden="true">
              <CompassOutlined />
            </span>
            <span className="stayvibe-brand-stack">
              <span className="stayvibe-logo-text">
                Stay<span className="stayvibe-logo-accent">Vibe</span>
              </span>
              <span className="stayvibe-logo-sub">Private Collection</span>
            </span>
          </div>
          <p className="stayvibe-footer__bio">
            Nền tảng tuyển chọn khu nghỉ dưỡng độc bản, Boutique Hotel và quản
            trị vận hành lưu trú cao cấp với chuẩn mực minh bạch dữ liệu.
          </p>
        </div>

        {groups.map((group) => (
          <nav
            key={group.id}
            className="stayvibe-footer__nav-col"
            aria-label={group.title}
          >
            <h3 className="stayvibe-footer__col-title">{group.title}</h3>
            <ul className="stayvibe-footer__link-list">
              {group.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="stayvibe-footer__link"
                    onClick={(e) => handleFooterLinkClick(e, link.href)}
                  >
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="stayvibe-footer__link-badge">
                        {link.badge}
                      </span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="stayvibe-footer__bottom">
        <span>© 2026 StayVibe · Nền tảng đặt phòng du lịch trải nghiệm.</span>
        <span>Giá niêm yết minh bạch · Hỗ trợ khách hàng 24/7.</span>
      </div>
    </footer>
  )
}
