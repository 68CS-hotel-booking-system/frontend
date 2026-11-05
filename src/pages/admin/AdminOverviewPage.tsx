import { useNavigate } from 'react-router'

interface AdminModuleCard {
  title: string
  description: string
  icon: string
  to: string
  actionLabel: string
  tag?: string
}

const MODULES: AdminModuleCard[] = [
  {
    title: 'Quản lý người dùng',
    description: 'Theo dõi danh sách tài khoản, thông tin liên hệ và trạng thái xác thực trên StayHub.',
    icon: 'group',
    to: '/admin/users',
    actionLabel: 'Truy cập người dùng',
  },
  {
    title: 'Cơ sở lưu trú & Phòng',
    description: 'Danh sách khách sạn, cơ sở lưu trú và cấu hình loại phòng nghỉ dưỡng.',
    icon: 'apartment',
    to: '/management/hotels',
    actionLabel: 'Quản lý khách sạn',
  },
  {
    title: 'Bảng giá phòng',
    description: 'Thiết lập và theo dõi giá bán theo ngày cho từng hạng phòng.',
    icon: 'payments',
    to: '/management/rates',
    actionLabel: 'Xem bảng giá',
  },
  {
    title: 'Hợp đồng đối tác',
    description: 'Hợp đồng hợp tác kinh doanh, điều khoản thanh toán và tỷ lệ chia sẻ doanh thu.',
    icon: 'description',
    to: '/management/contracts',
    actionLabel: 'Xem hợp đồng',
  },
  {
    title: 'Phân quyền tài chính',
    description: 'Kiểm soát hạn mức và quyền phê duyệt tài chính của từng quản trị viên.',
    icon: 'verified_user',
    to: '/management/financial-access',
    actionLabel: 'Xem phân quyền',
  },
  {
    title: 'Kiểm thử API trực tiếp',
    description: 'Bàn làm việc 18 thao tác tương tác trực tiếp với các API máy chủ đã triển khai.',
    icon: 'terminal',
    to: '/management/live',
    actionLabel: 'Mở bàn API',
    tag: 'Live Backend',
  },
  {
    title: 'Trạng thái hệ thống',
    description: 'Theo dõi tình trạng hoạt động thực tế của máy chủ qua Spring Boot Actuator.',
    icon: 'dns',
    to: '/system-status',
    actionLabel: 'Kiểm tra health',
    tag: 'Actuator',
  },
]

export function AdminOverviewPage() {
  const navigate = useNavigate()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 'var(--admin-fs-title)',
              fontWeight: 600,
              color: 'var(--admin-text-primary)',
              letterSpacing: '-0.02em',
              lineHeight: 1.25,
              margin: 0,
            }}
          >
            Tổng quan quản trị
          </h1>
          <p
            style={{
              fontSize: 'var(--admin-fs-body)',
              color: 'var(--admin-text-secondary)',
              marginTop: '4px',
              marginBottom: 0,
            }}
          >
            Không gian điều hướng và quản lý các phân hệ nghiệp vụ StayHub.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/admin/users')}
          className="admin-btn-primary"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            group
          </span>
          <span>Quản lý người dùng</span>
        </button>
      </div>

      {/* Module Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '16px',
        }}
      >
        {MODULES.map((mod) => (
          <div
            key={mod.to}
            style={{
              backgroundColor: 'var(--admin-surface)',
              border: '1px solid var(--admin-border)',
              borderRadius: 'var(--admin-radius-card)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '16px',
              transition: 'border-color 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--admin-teal-soft)',
                    color: 'var(--admin-teal)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    {mod.icon}
                  </span>
                </div>
                {mod.tag && (
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 500,
                      color: 'var(--admin-teal)',
                      backgroundColor: 'var(--admin-teal-soft)',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                    }}
                  >
                    {mod.tag}
                  </span>
                )}
              </div>

              <div>
                <h2
                  style={{
                    fontSize: 'var(--admin-fs-section)',
                    fontWeight: 600,
                    color: 'var(--admin-text-primary)',
                    margin: '0 0 4px 0',
                    lineHeight: 1.3,
                  }}
                >
                  {mod.title}
                </h2>
                <p
                  style={{
                    fontSize: 'var(--admin-fs-body)',
                    color: 'var(--admin-text-secondary)',
                    margin: 0,
                    lineHeight: 1.45,
                  }}
                >
                  {mod.description}
                </p>
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={() => navigate(mod.to)}
                className="admin-btn-secondary"
                style={{ width: '100%', justifyContent: 'space-between' }}
              >
                <span>{mod.actionLabel}</span>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  arrow_forward
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
