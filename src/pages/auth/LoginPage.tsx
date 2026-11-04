import { useState } from 'react'
import { App as AntApp } from 'antd'
import { useNavigate } from 'react-router'

export function LoginPage() {
  const navigate = useNavigate()
  const { message } = AntApp.useApp()
  const [roleTab, setRoleTab] = useState<'admin' | 'resident'>('admin')
  const [email, setEmail] = useState('julian.vance@grandheritage.com')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Welcome Command Header */}
      <header className="atelier-command-card" aria-labelledby="login-page-title">
        <div className="atelier-command-card__info">
          <div className="atelier-badges-row">
            <span className="atelier-season-pill">
              Grand Heritage &amp; Atelier OS
            </span>
            <span className="atelier-sync-pill">
              <span
                className="atelier-dot-tertiary"
                style={{ width: 6, height: 6 }}
                aria-hidden="true"
              />
              Bảo Mật Quản Trị Chuỗi Khách Sạn
            </span>
          </div>
          <h1 id="login-page-title" className="atelier-headline-xl">
            Cổng Đăng Nhập Quản Trị &amp; Cư Dân
          </h1>
          <p className="atelier-command-card__desc">
            Đăng nhập để quản lý danh mục cơ sở lưu trú, tình trạng buồng phòng,
            bảng giá theo ngày và hợp đồng hoa hồng trong Atelier OS, hoặc
            tra cứu hồ sơ đặt phòng riêng tư của bạn.
          </p>
        </div>

        <div
          className="atelier-pill-group"
          role="group"
          aria-label="Chọn chế độ đăng nhập"
        >
          <button
            type="button"
            className={`atelier-pill-tab ${
              roleTab === 'admin' ? 'is-active-dark' : ''
            }`}
            style={{ padding: '8px 16px', fontSize: 12 }}
            onClick={() => {
              setRoleTab('admin')
              setEmail('julian.vance@grandheritage.com')
            }}
          >
            Quản Trị Viên &amp; Nhân Viên (Admin)
          </button>
          <button
            type="button"
            className={`atelier-pill-tab ${
              roleTab === 'resident' ? 'is-active-dark' : ''
            }`}
            style={{ padding: '8px 16px', fontSize: 12 }}
            onClick={() => {
              setRoleTab('resident')
              setEmail('eleanor.vance@vanceholdings.com')
            }}
          >
            Khách Nghỉ Dưỡng &amp; Cư Dân
          </button>
        </div>
      </header>

      {/* 2-Column Portal Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 20,
        }}
      >
        {/* Left: Sign-in Form */}
        <section className="atelier-card" style={{ gap: 18 }}>
          <div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--atelier-primary)',
              }}
            >
              {roleTab === 'admin'
                ? 'ROLE_ADMIN • ROLE_HOTEL_OWNER • ROLE_HOTEL_MANAGER'
                : 'Tra Cứu Hồ Sơ Khách VIP'}
            </span>
            <h2
              style={{
                fontSize: 22,
                fontWeight: 700,
                marginTop: 4,
                marginBottom: 6,
              }}
            >
              {roleTab === 'admin'
                ? 'Đăng nhập vào Hệ thống Atelier OS'
                : 'Tra Cứu Hồ Sơ Đặt Phòng Riêng'}
            </h2>
            <p
              style={{
                fontSize: 13,
                color: 'var(--atelier-on-surface-variant)',
                margin: 0,
              }}
            >
              {roleTab === 'admin'
                ? 'Phiên làm việc xác thực an toàn, kiểm soát phạm vi quyền hạn và chi nhánh khách sạn.'
                : 'Kiểm tra hành trình phòng Penthouse hoặc Biệt thự sân vườn và các yêu cầu quản gia riêng.'}
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              void message.success(
                roleTab === 'admin'
                  ? 'Đã đăng nhập với tư cách Julian Vance (Giám đốc trực ban). Đang mở Atelier OS...'
                  : 'Chào mừng quý khách Eleanor Vance. Đang mở Grand Heritage...',
              )
              void navigate(roleTab === 'admin' ? '/admin' : '/')
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
          >
            <label
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--atelier-on-surface-variant)',
              }}
            >
              <span>Địa Chỉ Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: '1px solid var(--atelier-surface-highest)',
                  backgroundColor: 'var(--atelier-surface-low)',
                  color: 'var(--atelier-on-surface)',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
            </label>

            <label
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--atelier-on-surface-variant)',
              }}
            >
              <span>Mật Khẩu / Khóa Bảo Mật</span>
              <input
                type="password"
                defaultValue="••••••••••••••••"
                required
                style={{
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: '1px solid var(--atelier-surface-highest)',
                  backgroundColor: 'var(--atelier-surface-low)',
                  color: 'var(--atelier-on-surface)',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
            </label>

            <button
              type="submit"
              className="gh-btn-primary"
              style={{ width: '100%', padding: '12px 20px', marginTop: 4 }}
            >
              <span>
                {roleTab === 'admin'
                  ? 'Vào Trung Tâm Điều Hành Atelier OS'
                  : 'Xem Hồ Sơ Đặt Phòng Nghỉ Dưỡng'}
              </span>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 18 }}
                aria-hidden="true"
              >
                arrow_forward
              </span>
            </button>
          </form>
        </section>

        {/* Right: Instant Role & Workspace Shortcuts */}
        <section className="atelier-card" style={{ gap: 16 }}>
          <div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--atelier-tertiary)',
              }}
            >
              Truy Cập Nhanh Phân Hệ Quản Trị
            </span>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                marginTop: 4,
                marginBottom: 6,
              }}
            >
              Khám Phá Các Phân Hệ Grand Heritage &amp; Atelier OS
            </h2>
            <p
              style={{
                fontSize: 13,
                color: 'var(--atelier-on-surface-variant)',
                margin: 0,
              }}
            >
              Chuyển trực tiếp đến bất kỳ phân hệ nào ở chế độ Dữ liệu mẫu hoặc API thực:
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              {
                icon: 'dashboard',
                title: 'Atelier OS — Bảng Điều Khiển Tổng Quan',
                desc: 'Chỉ số KPI trực tiếp, công suất phòng, sổ đặt phòng thời gian thực & tình trạng buồng phòng',
                path: '/admin',
              },
              {
                icon: 'meeting_room',
                title: 'Cơ Sở Lưu Trú, Hạng Phòng & Buồng Phòng',
                desc: 'Quản lý danh mục khách sạn, phân bổ loại phòng và buồng phòng vật lý',
                path: '/management/hotels',
              },
              {
                icon: 'calendar_month',
                title: 'Bảng Giá Phòng Theo Ngày',
                desc: 'Tra cứu và kiểm soát giá phòng từng đêm theo từng hạng phòng và khung thời gian',
                path: '/management/rates',
              },
              {
                icon: 'payments',
                title: 'Hợp Đồng Hoa Hồng & Doanh Thu',
                desc: 'Quản lý thỏa thuận hoa hồng đại lý và hợp đồng đối tác lưu trú',
                path: '/management/contracts',
              },
              {
                icon: 'graph_4',
                title: 'Phân Quyền Báo Cáo Tài Chính',
                desc: 'Cấp và thu hồi quyền đọc số liệu tài chính cho đại diện khách sạn',
                path: '/management/financial-access',
              },
              {
                icon: 'travel_explore',
                title: 'Trang Chủ Grand Heritage Hotel & Residences',
                desc: 'Cổng thông tin nghỉ dưỡng, bộ sưu tập phòng cao cấp & đặt phòng trực tuyến',
                path: '/',
              },
            ].map((item) => (
              <button
                key={item.path}
                type="button"
                onClick={() => void navigate(item.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  padding: '12px 14px',
                  borderRadius: 14,
                  border: '1px solid var(--atelier-surface-highest)',
                  backgroundColor: 'var(--atelier-surface-low)',
                  color: 'var(--atelier-on-surface)',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      backgroundColor: 'var(--atelier-surface-lowest)',
                      color: 'var(--atelier-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 20 }}
                      aria-hidden="true"
                    >
                      {item.icon}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>
                      {item.title}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: 'var(--atelier-on-surface-variant)',
                      }}
                    >
                      {item.desc}
                    </div>
                  </div>
                </div>
                <span
                  className="material-symbols-outlined"
                  style={{ color: 'var(--atelier-primary)', fontSize: 18 }}
                  aria-hidden="true"
                >
                  east
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
