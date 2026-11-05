import { useNavigate } from 'react-router'
import {
  ArrowRightOutlined,
  BarChartOutlined,
  CheckCircleOutlined,
  CloudServerOutlined,
  DollarOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined,
  ShopOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { useCurrentUser } from '@/features/auth'

export function AdminOverviewPage() {
  const navigate = useNavigate()
  const { currentUser, isChecking } = useCurrentUser()

  const userFullName = currentUser?.fullName || (currentUser?.email ? currentUser.email.split('@')[0] : 'Quản trị viên')
  const userEmail = currentUser?.email || 'admin@stayhub.vn'
  const userRoles = currentUser?.roles && currentUser.roles.length > 0 ? currentUser.roles : ['ADMIN']

  return (
    <div className="flex flex-col gap-6 sm:gap-8 w-full max-w-full">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[var(--md-sys-color-outline-subtle)]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--md-sys-color-on-surface)] m-0">
            Tổng quan
          </h1>
          <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] mt-1 mb-0">
            Bảng điều khiển tác vụ quản trị vận hành và giám sát trạng thái hệ thống StayHub.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/admin/users')}
          className="m3-btn-filled shrink-0 self-start sm:self-auto"
        >
          <TeamOutlined aria-hidden="true" />
          <span>Quản lý người dùng</span>
        </button>
      </div>

      {/* 2. Real System & Session Status (Live API verified) */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-[var(--md-sys-color-outline)] mb-3">
          Phiên quản trị & Hạ tầng thực tế
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card: Current Admin Account */}
          <div className="m3-card flex flex-col justify-between gap-4">
            <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-12 h-12 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center text-xl shrink-0">
                  <UserOutlined />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-bold text-[var(--md-sys-color-primary)] uppercase tracking-wider">
                    Tài khoản phiên làm việc
                  </div>
                  <h2 className="text-base font-bold text-[var(--md-sys-color-on-surface)] break-words m-0 mt-0.5 leading-snug">
                    {isChecking ? 'Đang kiểm tra...' : userFullName}
                  </h2>
                  <div className="text-xs text-[var(--md-sys-color-on-surface-variant)] truncate mt-0.5">
                    {userEmail}
                  </div>
                </div>
              </div>
              <span className="m3-chip m3-chip-primary self-start shrink-0">
                <CheckCircleOutlined />
                <span>API Thật</span>
              </span>
            </div>

            <div className="pt-3 border-t border-[var(--md-sys-color-outline-subtle)] flex items-center justify-between text-xs text-[var(--md-sys-color-on-surface-variant)]">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span>Vai trò:</span>
                {userRoles.map((role) => (
                  <span
                    key={role}
                    className="font-semibold text-[var(--md-sys-color-on-surface)] bg-[var(--md-sys-color-surface-container)] px-2 py-0.5 rounded"
                  >
                    {role}
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => navigate('/admin/users')}
                className="text-[var(--md-sys-color-primary)] hover:underline font-semibold cursor-pointer border-none bg-transparent p-0 flex items-center gap-1"
              >
                <span>Xem hồ sơ</span>
                <ArrowRightOutlined className="text-[10px]" />
              </button>
            </div>
          </div>

          {/* Card: System Health Connection */}
          <div className="m3-card flex flex-col justify-between gap-4">
            <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-12 h-12 rounded-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] flex items-center justify-center text-xl shrink-0">
                  <CloudServerOutlined />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-bold text-[var(--md-sys-color-secondary)] uppercase tracking-wider">
                    Dịch vụ máy chủ
                  </div>
                  <h2 className="text-base font-bold text-[var(--md-sys-color-on-surface)] break-words m-0 mt-0.5 leading-snug">
                    Spring Boot Backend
                  </h2>
                  <div className="text-xs text-[var(--md-sys-color-on-surface-variant)] truncate mt-0.5">
                    Endpoint Actuator /health
                  </div>
                </div>
              </div>
              <span className="m3-chip m3-chip-primary self-start shrink-0">
                <CheckCircleOutlined />
                <span>API Thật</span>
              </span>
            </div>

            <div className="pt-3 border-t border-[var(--md-sys-color-outline-subtle)] flex items-center justify-between text-xs text-[var(--md-sys-color-on-surface-variant)]">
              <span>Kiểm tra trạng thái sống của dịch vụ backend</span>
              <button
                type="button"
                onClick={() => navigate('/system-status')}
                className="text-[var(--md-sys-color-primary)] hover:underline font-semibold cursor-pointer border-none bg-transparent p-0 flex items-center gap-1"
              >
                <span>Kiểm tra máy chủ</span>
                <ArrowRightOutlined className="text-[10px]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Operational Shortcuts grouped by domain */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-[var(--md-sys-color-outline)] mb-3">
          Tác vụ vận hành theo phân hệ
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: Users */}
          <div className="m3-card flex flex-col justify-between gap-4">
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-primary)] flex items-center justify-center text-lg">
                  <TeamOutlined />
                </div>
                <span className="m3-chip m3-chip-primary">API Thật</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--md-sys-color-on-surface)] m-0">
                  Quản lý người dùng
                </h3>
                <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1 mb-0 leading-relaxed">
                  Theo dõi danh sách tài khoản, thông tin liên hệ và trạng thái xác thực trên StayHub.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/admin/users')}
              className="m3-btn-tonal !w-full !justify-between"
            >
              <span>Vào danh sách</span>
              <ArrowRightOutlined aria-hidden="true" />
            </button>
          </div>

          {/* Card 2: Hotels (Mock) */}
          <div className="m3-card flex flex-col justify-between gap-4">
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-secondary)] flex items-center justify-center text-lg">
                  <ShopOutlined />
                </div>
                <span className="m3-chip">Dữ liệu minh họa</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--md-sys-color-on-surface)] m-0">
                  Cơ sở lưu trú & Phòng
                </h3>
                <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1 mb-0 leading-relaxed">
                  Danh mục khách sạn, khu nghỉ dưỡng và cấu hình các hạng phòng trải nghiệm.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/management/hotels')}
              className="m3-btn-tonal !w-full !justify-between"
            >
              <span>Quản lý khách sạn</span>
              <ArrowRightOutlined aria-hidden="true" />
            </button>
          </div>

          {/* Card 3: Rates (Mock) */}
          <div className="m3-card flex flex-col justify-between gap-4">
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-secondary)] flex items-center justify-center text-lg">
                  <DollarOutlined />
                </div>
                <span className="m3-chip">Dữ liệu minh họa</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--md-sys-color-on-surface)] m-0">
                  Bảng giá phòng theo ngày
                </h3>
                <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1 mb-0 leading-relaxed">
                  Thiết lập và quản lý chính sách biểu giá phòng theo thời vụ và từng ngày nghỉ.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/management/rates')}
              className="m3-btn-tonal !w-full !justify-between"
            >
              <span>Xem bảng giá</span>
              <ArrowRightOutlined aria-hidden="true" />
            </button>
          </div>

          {/* Card 4: Contracts (Mock) */}
          <div className="m3-card flex flex-col justify-between gap-4">
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-secondary)] flex items-center justify-center text-lg">
                  <FileTextOutlined />
                </div>
                <span className="m3-chip">Dữ liệu minh họa</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--md-sys-color-on-surface)] m-0">
                  Hợp đồng đối tác lưu trú
                </h3>
                <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1 mb-0 leading-relaxed">
                  Điều khoản kinh doanh, thỏa thuận phân chia tỷ lệ doanh thu và hạn mức thanh toán.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/management/contracts')}
              className="m3-btn-tonal !w-full !justify-between"
            >
              <span>Xem hợp đồng</span>
              <ArrowRightOutlined aria-hidden="true" />
            </button>
          </div>

          {/* Card 5: Financial Access (Mock) */}
          <div className="m3-card flex flex-col justify-between gap-4">
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-secondary)] flex items-center justify-center text-lg">
                  <SafetyCertificateOutlined />
                </div>
                <span className="m3-chip">Dữ liệu minh họa</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--md-sys-color-on-surface)] m-0">
                  Phân quyền tài chính
                </h3>
                <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1 mb-0 leading-relaxed">
                  Thiết lập hạn mức chuyển khoản và phê duyệt tài chính đối tác khách sạn.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/management/financial-access')}
              className="m3-btn-tonal !w-full !justify-between"
            >
              <span>Xem phân quyền</span>
              <ArrowRightOutlined aria-hidden="true" />
            </button>
          </div>

          {/* Card 6: System Status */}
          <div className="m3-card flex flex-col justify-between gap-4">
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-primary)] flex items-center justify-center text-lg">
                  <CloudServerOutlined />
                </div>
                <span className="m3-chip m3-chip-primary">API Thật</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--md-sys-color-on-surface)] m-0">
                  Trạng thái máy chủ
                </h3>
                <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1 mb-0 leading-relaxed">
                  Đọc trực tiếp dữ liệu từ Spring Boot Actuator /health để kiểm tra độ trễ và tính sẵn sàng.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/system-status')}
              className="m3-btn-tonal !w-full !justify-between"
            >
              <span>Xem trạng thái</span>
              <ArrowRightOutlined aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Business Metrics & Analytics Empty State (Truthful UX - No fake metrics) */}
      <div className="m3-card flex flex-col items-center justify-center text-center p-8 sm:p-12 border-dashed">
        <div className="w-16 h-16 rounded-full bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-outline)] flex items-center justify-center text-2xl mb-4">
          <BarChartOutlined />
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] mb-2">
          <span>Chưa kết nối API báo cáo phân tích</span>
        </div>
        <h3 className="text-lg font-bold text-[var(--md-sys-color-on-surface)] m-0">
          Dữ liệu thống kê doanh thu & Lượt đặt phòng
        </h3>
        <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] max-w-md mt-1 mb-0 leading-relaxed">
          Tính năng phân tích số liệu tổng hợp đang trong lộ trình tích hợp backend. StayHub không hiển thị số liệu doanh thu, lượt đặt phòng hoặc tỷ lệ lấp đầy giả mạo.
        </p>
      </div>
    </div>
  )
}
