import type { CSSProperties } from 'react'
import { RevenueDashboard } from '@/features/finance'
import { useNavigate } from 'react-router'
import {
  ArrowRightOutlined,
  CalendarOutlined,
  CloudServerOutlined,
  CreditCardOutlined,
  LineChartOutlined,
  LockOutlined,
  MessageOutlined,
  ShopOutlined,
  TagOutlined,
  TeamOutlined,
  UserAddOutlined,
} from '@ant-design/icons'
import { useCurrentUser } from '@/features/auth'
import { useBackendHealth } from '@/features/system-status'
import { formatRoleLabel } from '@/shared/lib/format'

export function AdminOverviewPage() {
  const navigate = useNavigate()
  const { currentUser, isChecking, isAdmin } = useCurrentUser()
  const health = useBackendHealth(60)

  const userFullName = currentUser?.fullName || (currentUser?.email ? currentUser.email.split('@')[0] : 'Tài khoản')
  const userEmail = currentUser?.email || ''
  const userRoles = currentUser?.roles && currentUser.roles.length > 0 ? currentUser.roles : []
  const userInitials =
    userFullName
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .slice(-2)
      .join('')
      .toUpperCase() || 'SH'

  const healthStatus = health.isPending
    ? { label: 'Đang kiểm tra...', tone: 'neutral' as const }
    : health.isError
      ? { label: 'Mất kết nối', tone: 'danger' as const }
      : health.data?.status === 'UP'
        ? { label: 'Đang hoạt động', tone: 'live' as const }
        : { label: health.data?.status ?? 'Không xác định', tone: 'neutral' as const }

  return (
    <div className="flex flex-col gap-7 w-full max-w-6xl mx-auto">
      {/* 1. Page Header */}
      <div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#dce7e3] dash-enter"
        style={{ '--dash-delay': '0ms' } as CSSProperties}
      >
        <div>
          <h1
            id="dashboardTitle"
            tabIndex={-1}
            className="text-[28px] sm:text-[32px] font-bold tracking-[-0.035em] text-[#12211d] leading-[1.12] m-0 outline-none"
          >
            Tổng quan
          </h1>
          <p className="text-[15px] text-[#5f736e] mt-1.5 mb-0 max-w-[68ch] leading-relaxed">
            Theo dõi nhu cầu, doanh thu và vận hành StayHub trong một màn hình.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate(isAdmin ? '/admin/users' : '/hotels')}
          className="console-primary-btn shrink-0 self-start sm:self-auto"
          style={{ color: '#ffffff', backgroundColor: '#0b5f53' }}
        >
          {isAdmin ? (
            <UserAddOutlined className="!text-white text-sm" style={{ color: '#ffffff' }} aria-hidden="true" />
          ) : (
            <ShopOutlined className="!text-white text-sm" style={{ color: '#ffffff' }} aria-hidden="true" />
          )}
          <span className="!text-white font-semibold" style={{ color: '#ffffff' }}>
            {isAdmin ? 'Quản lý tài khoản' : 'Quản lý khách sạn'}
          </span>
        </button>
      </div>

      {/* 2. Real Revenue & Commission Analytics + Charts */}
      <div className="dash-enter" style={{ '--dash-delay': '60ms' } as CSSProperties}>
        <RevenueDashboard />
      </div>

      {/* 3. Session and Infrastructure Status */}
      <section
        className="flex flex-col gap-3 dash-enter"
        style={{ '--dash-delay': '120ms' } as CSSProperties}
        aria-labelledby="status-heading"
      >
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
          <h2
            id="status-heading"
            className="text-[11px] font-bold uppercase tracking-[.12em] text-[#40564f] m-0"
          >
            Phiên quản trị &amp; Hạ tầng
          </h2>
          <span className="text-[12.5px] text-[#5f736e]">
            Thông tin phiên làm việc và trạng thái kết nối backend thực tế
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card: Current Admin Account */}
          <div className="console-card p-5 flex flex-col justify-between gap-4 min-h-[190px]">
            <div>
              <div className="flex items-start justify-between gap-3">
                <span className="text-[11px] font-bold text-[#0b5f53] uppercase tracking-wider">
                  Tài khoản phiên làm việc
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#eaf6f1] text-[#0f7a5f] border border-[#cde9dc]">
                  <span className={`w-1.5 h-1.5 rounded-full bg-[#0f7a5f] ${currentUser ? 'status-dot-live' : ''}`} />
                  <span>{isChecking ? 'Đang kiểm tra' : 'Đang hoạt động'}</span>
                </span>
              </div>

              <div className="flex items-center gap-3.5 mt-3 min-w-0">
                <div className="w-12 h-12 rounded-full bg-[#0b5f53] text-white flex items-center justify-center text-lg font-bold shrink-0">
                  {userInitials}
                </div>
                <div className="flex flex-col min-w-0">
                  <h3 className="text-base font-bold text-[#12211d] truncate m-0 leading-snug">
                    {isChecking ? 'Đang kiểm tra...' : userFullName}
                  </h3>
                  <span className="text-xs text-[#5f736e] truncate mt-0.5">
                    {userEmail}
                  </span>
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    {userRoles.map((role) => (
                      <span
                        key={role}
                        className="px-2 py-0.5 rounded text-[10.5px] font-semibold bg-[#d9f0ea] text-[#08473e]"
                      >
                        {formatRoleLabel(role)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#dce7e3] flex items-center justify-between text-xs">
              <span className="text-[#5f736e]">Thông tin quyền hạn được cấp</span>
              <button
                type="button"
                onClick={() => navigate(isAdmin ? '/admin/users' : '/account')}
                className="text-[#0b5f53] hover:underline font-semibold cursor-pointer border-0 bg-transparent p-0 flex items-center gap-1"
              >
                <span>Xem hồ sơ</span>
                <ArrowRightOutlined className="text-[10px]" />
              </button>
            </div>
          </div>

          {/* Card: Spring Boot Backend Health */}
          <div className="console-card p-5 flex flex-col justify-between gap-4 min-h-[190px]">
            <div>
              <div className="flex items-start justify-between gap-3">
                <span className="text-[11px] font-bold text-[#5f736e] uppercase tracking-wider">
                  Trạng thái máy chủ
                </span>
                {healthStatus.tone === 'live' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#eaf6f1] text-[#0f7a5f] border border-[#cde9dc]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0f7a5f] status-dot-live" />
                    <span>{healthStatus.label}</span>
                  </span>
                ) : healthStatus.tone === 'danger' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#fef2f2] text-[#9b2c22] border border-[#fecaca]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#9b2c22]" />
                    <span>{healthStatus.label}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#f7fbfa] text-[#5f736e] border border-[#dce7e3]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5f736e]" />
                    <span>{healthStatus.label}</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3.5 mt-3 min-w-0">
                <div className="w-12 h-12 rounded-[11px] bg-[#eef8f5] border border-[#d6ebe5] text-[#0b5f53] flex items-center justify-center text-xl shrink-0">
                  <CloudServerOutlined />
                </div>
                <div className="flex flex-col min-w-0">
                  <h3 className="text-base font-bold text-[#12211d] truncate m-0 leading-snug">
                    Spring Boot Backend
                  </h3>
                  <span className="text-xs text-[#5f736e] truncate mt-0.5">
                    Endpoint Actuator /health
                  </span>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-[#5f736e]">
                    <LockOutlined className="text-xs" />
                    <span>Spring Boot Actuator</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#dce7e3] flex items-center justify-between text-xs">
              <span className="text-[#5f736e]">Giám sát tình trạng kết nối backend</span>
              {isAdmin ? (
                <button
                  type="button"
                  onClick={() => navigate('/system-status')}
                  className="text-[#0b5f53] hover:underline font-semibold cursor-pointer border-0 bg-transparent p-0 flex items-center gap-1"
                >
                  <span>Mở trang trạng thái</span>
                  <ArrowRightOutlined className="text-[10px]" />
                </button>
              ) : (
                <span className="text-[#5f736e] font-medium">Chỉ dành cho quản trị viên</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Module Operational Cards */}
      <section
        className="flex flex-col gap-3 dash-enter"
        style={{ '--dash-delay': '180ms' } as CSSProperties}
        aria-labelledby="modules-heading"
      >
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
          <h2
            id="modules-heading"
            className="text-[11px] font-bold uppercase tracking-[.12em] text-[#40564f] m-0"
          >
            Tác vụ vận hành theo phân hệ
          </h2>
          <span className="text-[12.5px] text-[#5f736e]">
            {isAdmin ? '7 phân hệ tính năng quản trị' : '6 phân hệ vận hành đối tác'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Module 1: Users (Admin only) */}
          {isAdmin && (
            <div className="module-card p-5 flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="w-[42px] h-[42px] rounded-[11px] bg-[#eef8f5] border border-[#d6ebe5] text-[#0b5f53] flex items-center justify-center text-lg">
                    <TeamOutlined />
                  </div>
                </div>
                <div>
                  <h3 className="text-[17.5px] font-semibold tracking-[-0.02em] text-[#12211d] m-0">
                    Người dùng &amp; Phân quyền
                  </h3>
                  <p className="text-[14.5px] text-[#5f736e] mt-1.5 mb-0 leading-[22px]">
                    Quản lý tài khoản, khóa/mở khóa và phân quyền quản trị viên, chủ khách sạn.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/admin/users')}
                className="w-full min-h-[44px] px-4 rounded-[8px] bg-[#eef8f5] hover:bg-[#d9f0ea] text-[#0b5f53] font-semibold text-[13px] flex items-center justify-between cursor-pointer border-0 transition-colors"
              >
                <span>Quản lý người dùng</span>
                <ArrowRightOutlined className="module-cta-arrow transition-transform duration-150" />
              </button>
            </div>
          )}

          {/* Module 2: Hotels */}
          <div className="module-card p-5 flex flex-col justify-between gap-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="w-[42px] h-[42px] rounded-[11px] bg-[#eef8f5] border border-[#d6ebe5] text-[#0b5f53] flex items-center justify-center text-lg">
                  <ShopOutlined />
                </div>
              </div>
              <div>
                <h3 className="text-[17.5px] font-semibold tracking-[-0.02em] text-[#12211d] m-0">
                  Khách sạn
                </h3>
                <p className="text-[14.5px] text-[#5f736e] mt-1.5 mb-0 leading-[22px]">
                  Danh sách, phê duyệt chỗ nghỉ, tạm dừng kinh doanh và phân công nhân sự quản lý.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/hotels')}
              className="w-full min-h-[44px] px-4 rounded-[8px] bg-[#eef8f5] hover:bg-[#d9f0ea] text-[#0b5f53] font-semibold text-[13px] flex items-center justify-between cursor-pointer border-0 transition-colors"
            >
              <span>Quản lý khách sạn</span>
              <ArrowRightOutlined className="module-cta-arrow transition-transform duration-150" />
            </button>
          </div>

          {/* Module 3: Bookings */}
          <div className="module-card p-5 flex flex-col justify-between gap-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="w-[42px] h-[42px] rounded-[11px] bg-[#eef8f5] border border-[#d6ebe5] text-[#0b5f53] flex items-center justify-center text-lg">
                  <CalendarOutlined />
                </div>
              </div>
              <div>
                <h3 className="text-[17.5px] font-semibold tracking-[-0.02em] text-[#12211d] m-0">
                  Đặt phòng
                </h3>
                <p className="text-[14.5px] text-[#5f736e] mt-1.5 mb-0 leading-[22px]">
                  Tra cứu đơn đặt theo khách sạn, xếp phòng, check-in/out, quá giờ nhận, NO_SHOW, hủy phòng.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/bookings')}
              className="w-full min-h-[44px] px-4 rounded-[8px] bg-[#eef8f5] hover:bg-[#d9f0ea] text-[#0b5f53] font-semibold text-[13px] flex items-center justify-between cursor-pointer border-0 transition-colors"
            >
              <span>Quản lý đặt phòng</span>
              <ArrowRightOutlined className="module-cta-arrow transition-transform duration-150" />
            </button>
          </div>

          {/* Module 4: Vouchers */}
          <div className="module-card p-5 flex flex-col justify-between gap-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="w-[42px] h-[42px] rounded-[11px] bg-[#eef8f5] border border-[#d6ebe5] text-[#0b5f53] flex items-center justify-center text-lg">
                  <TagOutlined />
                </div>
              </div>
              <div>
                <h3 className="text-[17.5px] font-semibold tracking-[-0.02em] text-[#12211d] m-0">
                  Voucher
                </h3>
                <p className="text-[14.5px] text-[#5f736e] mt-1.5 mb-0 leading-[22px]">
                  Danh sách mã giảm giá, thiết lập điều kiện áp dụng, hạn mức sử dụng và kích hoạt/tạm dừng.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/vouchers')}
              className="w-full min-h-[44px] px-4 rounded-[8px] bg-[#eef8f5] hover:bg-[#d9f0ea] text-[#0b5f53] font-semibold text-[13px] flex items-center justify-between cursor-pointer border-0 transition-colors"
            >
              <span>Quản lý voucher</span>
              <ArrowRightOutlined className="module-cta-arrow transition-transform duration-150" />
            </button>
          </div>

          {/* Module 5: Complaints */}
          <div className="module-card p-5 flex flex-col justify-between gap-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="w-[42px] h-[42px] rounded-[11px] bg-[#eef8f5] border border-[#d6ebe5] text-[#0b5f53] flex items-center justify-center text-lg">
                  <MessageOutlined />
                </div>
              </div>
              <div>
                <h3 className="text-[17.5px] font-semibold tracking-[-0.02em] text-[#12211d] m-0">
                  Khiếu nại
                </h3>
                <p className="text-[14.5px] text-[#5f736e] mt-1.5 mb-0 leading-[22px]">
                  Tiếp nhận phản ánh từ khách hàng, kiểm tra bằng chứng, cập nhật tiến độ và giải quyết.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/complaints')}
              className="w-full min-h-[44px] px-4 rounded-[8px] bg-[#eef8f5] hover:bg-[#d9f0ea] text-[#0b5f53] font-semibold text-[13px] flex items-center justify-between cursor-pointer border-0 transition-colors"
            >
              <span>Xử lý khiếu nại</span>
              <ArrowRightOutlined className="module-cta-arrow transition-transform duration-150" />
            </button>
          </div>

          {/* Module 6: Finance */}
          <div className="module-card p-5 flex flex-col justify-between gap-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="w-[42px] h-[42px] rounded-[11px] bg-[#eef8f5] border border-[#d6ebe5] text-[#0b5f53] flex items-center justify-center text-lg">
                  <CreditCardOutlined />
                </div>
              </div>
              <div>
                <h3 className="text-[17.5px] font-semibold tracking-[-0.02em] text-[#12211d] m-0">
                  Tài chính
                </h3>
                <p className="text-[14.5px] text-[#5f736e] mt-1.5 mb-0 leading-[22px]">
                  Giao dịch dòng tiền, đối soát thanh toán, hoàn tiền, hợp đồng hoa hồng và quyết toán.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/finance')}
              className="w-full min-h-[44px] px-4 rounded-[8px] bg-[#eef8f5] hover:bg-[#d9f0ea] text-[#0b5f53] font-semibold text-[13px] flex items-center justify-between cursor-pointer border-0 transition-colors"
            >
              <span>Báo cáo tài chính</span>
              <ArrowRightOutlined className="module-cta-arrow transition-transform duration-150" />
            </button>
          </div>

          {/* Module 7: Reports (Centered in desktop 3-col layout when 7 modules) */}
          <div className={`module-card ${isAdmin ? 'lg:col-start-2 ' : ''}p-5 flex flex-col justify-between gap-4`}>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="w-[42px] h-[42px] rounded-[11px] bg-[#eef8f5] border border-[#d6ebe5] text-[#0b5f53] flex items-center justify-center text-lg">
                  <LineChartOutlined />
                </div>
              </div>
              <div>
                <h3 className="text-[17.5px] font-semibold tracking-[-0.02em] text-[#12211d] m-0">
                  Báo cáo
                </h3>
                <p className="text-[14.5px] text-[#5f736e] mt-1.5 mb-0 leading-[22px]">
                  Báo cáo tài chính nền tảng, doanh số khách sạn đối tác và thống kê tỷ lệ hủy phòng.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/reports')}
              className="w-full min-h-[44px] px-4 rounded-[8px] bg-[#eef8f5] hover:bg-[#d9f0ea] text-[#0b5f53] font-semibold text-[13px] flex items-center justify-between cursor-pointer border-0 transition-colors"
            >
              <span>Xem báo cáo</span>
              <ArrowRightOutlined className="module-cta-arrow transition-transform duration-150" />
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
