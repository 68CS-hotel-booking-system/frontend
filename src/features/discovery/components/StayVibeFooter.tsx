import {
  ArrowRightOutlined,
  CompassOutlined,
  ThunderboltFilled,
} from '@ant-design/icons'
import { useNavigate } from 'react-router'
import type { FooterLinkGroup } from '../model/discovery'

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
    <footer className="w-full mt-12 sm:mt-16" role="contentinfo">
      {/* Partner Banner */}
      <div className="w-full rounded-2xl bg-[#141413] text-white p-6 sm:p-10 border border-[#DECBA4]/30 shadow-lg flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-12">
        <div className="max-w-xl">
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#E5C98B] flex items-center gap-1.5">
            <ThunderboltFilled aria-hidden="true" /> DÀNH CHO ĐỐI TÁC LƯU TRÚ
          </span>
          <h2 className="font-editorial text-2xl sm:text-3xl font-semibold !text-[#FAF8F5] mt-2 mb-2 leading-snug">
            Đồng hành vận hành khách sạn, bảng giá &amp; hợp đồng trên một nền tảng
          </h2>
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
            Quản lý hồ sơ khách sạn, cập nhật tiện ích, theo dõi bảng giá phòng
            theo ngày và đối soát hợp đồng minh bạch.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#A67C37] !text-white font-bold text-xs uppercase tracking-wider hover:bg-[#8E6728] transition shadow cursor-pointer"
            onClick={() => void navigate('/management/hotels')}
          >
            <span>Quản lý khách sạn</span>
            <ArrowRightOutlined aria-hidden="true" />
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-white/10 border border-white/20 !text-white font-semibold text-xs hover:bg-white/20 transition cursor-pointer"
            onClick={() => void navigate('/management/rates')}
          >
            <span>Xem bảng giá phòng</span>
          </button>
        </div>
      </div>

      {/* Footer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-8 border-t border-[#E6E1D6]">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-[#141413] text-[#E5C98B] flex items-center justify-center text-sm shadow-sm">
              <CompassOutlined aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <span className="font-editorial text-xl font-bold text-[#141413]">
                Stay<span className="text-[#A67C37]">Vibe</span>
              </span>
              <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-[#7A7468]">
                Private Collection
              </span>
            </div>
          </div>
          <p className="text-xs text-[#7A7468] leading-relaxed max-w-sm mt-1">
            Nền tảng tuyển chọn khu nghỉ dưỡng độc bản, Boutique Hotel và quản
            trị vận hành lưu trú cao cấp với chuẩn mực minh bạch dữ liệu.
          </p>
        </div>

        {groups.map((group) => (
          <nav key={group.id} className="flex flex-col gap-2" aria-label={group.title}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#141413]">
              {group.title}
            </h3>
            <ul className="flex flex-col gap-2 p-0 m-0 list-none mt-1">
              {group.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-xs text-[#7A7468] hover:text-[#A67C37] transition inline-flex items-center gap-2"
                    onClick={(e) => handleFooterLinkClick(e, link.href)}
                  >
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#A67C37]/15 text-[#A67C37]">
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

      {/* Copyright */}
      <div className="pt-6 border-t border-[#E6E1D6]/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#7A7468]">
        <p>© 2026 StayVibe. Nền tảng đặt phòng du lịch trải nghiệm.</p>
        <p>Giá niêm yết minh bạch · Hỗ trợ khách hàng 24/7.</p>
      </div>
    </footer>
  )
}
