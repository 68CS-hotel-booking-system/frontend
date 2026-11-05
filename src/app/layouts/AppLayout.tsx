import { useState } from 'react'
import {
  BankOutlined,
  CompassOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  FileProtectOutlined,
  MenuOutlined,
  SafetyCertificateOutlined,
  StarOutlined,
  ThunderboltOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Button, Drawer, Switch, Tooltip } from 'antd'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import { StayVibeFooter, STAYVIBE_FOOTER_GROUPS } from '@/features/discovery'
import { useCurrentUser } from '@/features/auth'
import { useDataMode } from '@/shared/lib/data-mode-context'

export function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { mode, setMode } = useDataMode()
  const { isAdmin } = useCurrentUser()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isManagementRoute = location.pathname.startsWith('/management')
  const closeMenu = () => setMobileMenuOpen(false)

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#141413]">
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#141413] focus:text-white focus:rounded-md shadow-lg"
        href="#main-content"
      >
        Đến nội dung chính
      </a>

      {/* Sticky Luxury Navbar */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E6E1D6] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 xl:px-8 h-20 flex items-center justify-between gap-2 xl:gap-4">
          {/* Brand Logo */}
          <NavLink
            to="/"
            className="flex items-center gap-2 xl:gap-3 no-underline group focus-visible:outline-2 focus-visible:outline-[#A67C37] rounded-md shrink-0"
            aria-label="StayVibe Sovereign - Trang chủ đặt phòng nghỉ dưỡng"
            onClick={closeMenu}
          >
            <div className="w-9 h-9 xl:w-10 xl:h-10 rounded-md bg-[#141413] border border-[#A67C37]/50 text-[#E5C98B] flex items-center justify-center text-base xl:text-lg shadow-sm group-hover:scale-105 transition-transform duration-200 shrink-0">
              <CompassOutlined aria-hidden="true" />
            </div>
            <div className="flex flex-col leading-none shrink-0">
              <span className="font-editorial text-xl xl:text-2xl font-bold tracking-tight text-[#141413] whitespace-nowrap">
                Stay<span className="text-[#A67C37]">Vibe</span>
              </span>
              <span className="text-[9px] xl:text-[10px] font-bold tracking-[0.15em] xl:tracking-[0.2em] uppercase text-[#7A7468] mt-0.5 xl:mt-1 font-display whitespace-nowrap">
                Private Collection
              </span>
            </div>
          </NavLink>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 shrink-0" aria-label="Điều hướng chính">
            {isAdmin && (
              <>
                <NavLink
                  to="/admin/users"
                  className="text-[11px] xl:text-xs font-semibold px-2.5 xl:px-3 py-1.5 rounded-md !bg-[#F9F5EB] !text-[#A67C37] border border-[#DECBA4]/50 hover:!bg-[#DECBA4]/30 transition whitespace-nowrap shrink-0"
                >
                  StayHub Admin
                </NavLink>

                <span className="w-px h-5 bg-[#E6E1D6] mx-0.5 xl:mx-1 shrink-0" aria-hidden="true" />
              </>
            )}

            {isManagementRoute ? (
              <>
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    `text-xs font-semibold px-3 py-1.5 rounded-md transition flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                      isActive ? '!bg-[#A67C37] !text-white' : '!text-[#524E46] hover:!text-[#141413] hover:!bg-[#F3EFE6]'
                    }`
                  }
                >
                  <CompassOutlined aria-hidden="true" />
                  <span>Trang chủ</span>
                </NavLink>
                <NavLink
                  to="/management/hotels"
                  className={({ isActive }) =>
                    `text-xs font-semibold px-3 py-1.5 rounded-md transition flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                      isActive ? '!bg-[#A67C37] !text-white' : '!text-[#524E46] hover:!text-[#141413] hover:!bg-[#F3EFE6]'
                    }`
                  }
                >
                  <BankOutlined aria-hidden="true" />
                  <span>Quản lý khách sạn</span>
                </NavLink>
                <NavLink
                  to="/management/rates"
                  className={({ isActive }) =>
                    `text-xs font-semibold px-3 py-1.5 rounded-md transition flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                      isActive ? '!bg-[#A67C37] !text-white' : '!text-[#524E46] hover:!text-[#141413] hover:!bg-[#F3EFE6]'
                    }`
                  }
                >
                  <DollarOutlined aria-hidden="true" />
                  <span>Bảng giá phòng</span>
                </NavLink>
                <NavLink
                  to="/management/contracts"
                  className={({ isActive }) =>
                    `text-xs font-semibold px-3 py-1.5 rounded-md transition flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                      isActive ? '!bg-[#A67C37] !text-white' : '!text-[#524E46] hover:!text-[#141413] hover:!bg-[#F3EFE6]'
                    }`
                  }
                >
                  <FileProtectOutlined aria-hidden="true" />
                  <span>Hợp đồng</span>
                </NavLink>
                <NavLink
                  to="/management/financial-access"
                  className={({ isActive }) =>
                    `text-xs font-semibold px-3 py-1.5 rounded-md transition flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                      isActive ? '!bg-[#A67C37] !text-white' : '!text-[#524E46] hover:!text-[#141413] hover:!bg-[#F3EFE6]'
                    }`
                  }
                >
                  <SafetyCertificateOutlined aria-hidden="true" />
                  <span>Phân quyền tài chính</span>
                </NavLink>
              </>
            ) : (
              <>
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    `text-[11px] xl:text-xs font-semibold px-2.5 xl:px-3.5 py-1.5 rounded-md transition flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                      isActive ? '!bg-[#141413] !text-[#FAF8F5]' : '!text-[#524E46] hover:!text-[#141413] hover:!bg-[#F3EFE6]'
                    }`
                  }
                >
                  <CompassOutlined aria-hidden="true" />
                  <span>Khám phá</span>
                </NavLink>
                <a
                  href="#bento-section"
                  className="text-[11px] xl:text-xs font-semibold px-2.5 xl:px-3.5 py-1.5 rounded-md !text-[#524E46] hover:!text-[#141413] hover:!bg-[#F3EFE6] transition flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <EnvironmentOutlined aria-hidden="true" />
                  <span>Điểm đến độc bản</span>
                </a>
                <a
                  href="#vibe-section"
                  className="text-[11px] xl:text-xs font-semibold px-2.5 xl:px-3.5 py-1.5 rounded-md !text-[#524E46] hover:!text-[#141413] hover:!bg-[#F3EFE6] transition flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <ThunderboltOutlined aria-hidden="true" />
                  <span>Phong cách lưu trú</span>
                </a>
                <a
                  href="#hotels-section"
                  className="text-[11px] xl:text-xs font-semibold px-2.5 xl:px-3.5 py-1.5 rounded-md !text-[#524E46] hover:!text-[#141413] hover:!bg-[#F3EFE6] transition flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <StarOutlined aria-hidden="true" />
                  <span>Bộ sưu tập tuyển chọn</span>
                </a>
              </>
            )}
          </nav>

          {/* Action cluster */}
          <div className="flex items-center gap-2 xl:gap-3 shrink-0">
            {isManagementRoute && (
              <Tooltip
                title={
                  mode === 'mock'
                    ? 'Kết nối các API khách sạn đã triển khai'
                    : 'Đang kết nối trực tiếp với máy chủ hệ thống'
                }
              >
                <label className="hidden sm:inline-flex items-center gap-2 px-2.5 xl:px-3 py-1.5 rounded-md bg-white border border-[#E6E1D6] text-xs font-medium text-[#524E46] cursor-pointer hover:border-[#CFC7B8] transition whitespace-nowrap shrink-0">
                  <Switch
                    size="small"
                    checked={mode === 'api'}
                    onChange={(checked) => setMode(checked ? 'api' : 'mock')}
                    aria-label="Chuyển đổi nguồn dữ liệu"
                  />
                  <span>{mode === 'mock' ? 'Dữ liệu mẫu' : 'Hệ thống thực'}</span>
                </label>
              </Tooltip>
            )}

            <button
              type="button"
              className="hidden lg:inline-flex items-center gap-1.5 xl:gap-2 px-3.5 xl:px-5 py-2 xl:py-2.5 rounded-md bg-[#141413] !text-[#FAF8F5] text-[11px] xl:text-xs font-bold uppercase tracking-wider hover:bg-[#A67C37] hover:!text-white transition-colors duration-200 shadow-sm cursor-pointer whitespace-nowrap shrink-0"
              onClick={() => void navigate('/login')}
            >
              <UserOutlined aria-hidden="true" />
              <span>Đăng nhập</span>
            </button>

            {/* Mobile / Tablet Menu Button */}
            <button
              type="button"
              className="lg:hidden p-2.5 rounded-md border border-[#E6E1D6] bg-white text-[#141413] hover:border-[#A67C37] hover:text-[#A67C37] transition cursor-pointer flex items-center justify-center text-base"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Mở menu điều hướng"
            >
              <MenuOutlined aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <Drawer
        title={
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#141413] text-[#E5C98B] flex items-center justify-center text-sm">
              <CompassOutlined aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <span className="font-editorial text-lg font-bold">
                Stay<span className="text-[#A67C37]">Vibe</span>
              </span>
              <span className="text-[9px] tracking-widest text-[#7A7468] uppercase">Private Collection</span>
            </div>
          </div>
        }
        placement="right"
        onClose={closeMenu}
        open={mobileMenuOpen}
        styles={{
          body: {
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '24px',
            background: '#FAF8F5',
          },
        }}
      >
        <div className="flex flex-col gap-2">
          {isAdmin && (
            <div className="pb-3 mb-2 border-b border-[#E6E1D6] flex flex-col gap-2">
              <NavLink
                to="/admin/users"
                className="flex items-center justify-between px-3.5 py-2.5 rounded-md bg-[#F9F5EB] text-[#A67C37] font-semibold text-sm"
                onClick={closeMenu}
              >
                <span>StayHub Admin</span>
                <span className="text-xs bg-[#A67C37]/15 px-2 py-0.5 rounded">Hệ thống</span>
              </NavLink>
            </div>
          )}

          {isManagementRoute ? (
            <>
              <NavLink
                to="/"
                end
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-semibold text-[#524E46] hover:bg-[#F3EFE6]"
                onClick={closeMenu}
              >
                <CompassOutlined />
                <span>Trang chủ</span>
              </NavLink>
              <NavLink
                to="/management/hotels"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-semibold text-[#524E46] hover:bg-[#F3EFE6]"
                onClick={closeMenu}
              >
                <BankOutlined />
                <span>Quản lý khách sạn</span>
              </NavLink>
              <NavLink
                to="/management/rates"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-semibold text-[#524E46] hover:bg-[#F3EFE6]"
                onClick={closeMenu}
              >
                <DollarOutlined />
                <span>Bảng giá phòng</span>
              </NavLink>
              <NavLink
                to="/management/contracts"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-semibold text-[#524E46] hover:bg-[#F3EFE6]"
                onClick={closeMenu}
              >
                <FileProtectOutlined />
                <span>Hợp đồng</span>
              </NavLink>
              <NavLink
                to="/management/financial-access"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-semibold text-[#524E46] hover:bg-[#F3EFE6]"
                onClick={closeMenu}
              >
                <SafetyCertificateOutlined />
                <span>Phân quyền tài chính</span>
              </NavLink>
            </>
          ) : (
            <>
              <NavLink
                to="/"
                end
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-semibold text-[#524E46] hover:bg-[#F3EFE6]"
                onClick={closeMenu}
              >
                <CompassOutlined />
                <span>Khám phá</span>
              </NavLink>
              <a
                href="#bento-section"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-semibold text-[#524E46] hover:bg-[#F3EFE6]"
                onClick={closeMenu}
              >
                <EnvironmentOutlined />
                <span>Điểm đến độc bản</span>
              </a>
              <a
                href="#vibe-section"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-semibold text-[#524E46] hover:bg-[#F3EFE6]"
                onClick={closeMenu}
              >
                <ThunderboltOutlined />
                <span>Phong cách lưu trú</span>
              </a>
              <a
                href="#hotels-section"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-semibold text-[#524E46] hover:bg-[#F3EFE6]"
                onClick={closeMenu}
              >
                <StarOutlined />
                <span>Bộ sưu tập tuyển chọn</span>
              </a>
            </>
          )}
        </div>

        <div className="pt-4 border-t border-[#E6E1D6] flex flex-col gap-3">
          {isManagementRoute && (
            <div className="flex items-center justify-between p-3 rounded-md bg-white border border-[#E6E1D6]">
              <span className="text-xs font-semibold text-[#524E46]">
                {mode === 'mock' ? 'Dữ liệu mẫu' : 'Hệ thống thực'}
              </span>
              <Switch
                size="small"
                checked={mode === 'api'}
                onChange={(checked) => setMode(checked ? 'api' : 'mock')}
              />
            </div>
          )}

          <Button
            type="primary"
            block
            size="large"
            icon={<UserOutlined />}
            className="!bg-[#141413] hover:!bg-[#A67C37] !h-12 !font-semibold !rounded-md"
            onClick={() => {
              closeMenu()
              void navigate('/login')
            }}
          >
            Đăng nhập tài khoản
          </Button>
        </div>
      </Drawer>

      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8" tabIndex={-1}>
        <Outlet />
      </main>

      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <StayVibeFooter groups={STAYVIBE_FOOTER_GROUPS} />
      </div>
    </div>
  )
}
