import '@/shared/styles/admin-login.css'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router'
import { ADMIN_LOGIN_PHOTO, AdminLoginForm, adminLoginDestination, clearAuthSession, useAuthStatus, useCurrentUser, useSession, useWorkplaces } from '@/features/auth'
import { errorMessage } from '@/shared/api/api-error'

export function AdminLoginPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const session = useSession()
  const { status } = useAuthStatus()
  const { currentUser, isChecking, isAdmin, isOwner, isAuthorized, isError, error, isFetching, refetch } = useCurrentUser()
  const {
    isStaff,
    isChecking: isWorkplacesChecking,
    isError: isWorkplacesError,
    error: workplacesError,
    isFetching: isWorkplacesFetching,
    refetch: refetchWorkplaces,
  } = useWorkplaces()
  const [helpOpen, setHelpOpen] = useState(false)

  const canEnter = isAuthorized || isStaff
  const isStaffOnly = !isAdmin && !isOwner && isStaff
  const hasError = isError || isWorkplacesError
  const checking = isChecking || isWorkplacesChecking

  const state: unknown = location.state
  const from = state && typeof state === 'object' && 'from' in state ? state.from : undefined
  const destination = isStaffOnly
    ? '/bookings'
    : adminLoginDestination(from ?? searchParams.get('returnTo'), {
        allowManagement: true,
        isOwnerOnly: isOwner && !isAdmin,
      })

  useEffect(() => {
    if (session && currentUser && canEnter && !checking && !hasError) {
      void navigate(destination, { replace: true })
    }
  }, [session, currentUser, canEnter, checking, hasError, destination, navigate])

  const verifying =
    status === 'restoring' ||
    (Boolean(session) && (checking || (!hasError && (!currentUser || canEnter))))

  return (
    <div className="admin-login-shell min-h-screen min-h-[100dvh] bg-admin-bg text-admin-ink selection:bg-admin-teal selection:text-admin-surface">
      <main className="grid min-h-screen min-h-[100dvh] lg:grid-cols-[46fr_54fr]">
        {/* Brand sidebar (Desktop only) */}
        <aside className="relative hidden lg:flex flex-col justify-between p-7 lg:p-9 bg-admin-ink overflow-hidden isolate" aria-label="Giới thiệu StayHub">
          <img
            className="absolute inset-0 w-full h-full object-cover object-[58%_55%] pointer-events-none select-none"
            src={ADMIN_LOGIN_PHOTO}
            alt=""
          />

          <div className="relative z-10 flex flex-col justify-between gap-8 h-full">
            {/* Top brand badge */}
            <Link
              to="/"
              className="admin-brand-badge inline-flex items-center gap-2.5 self-start min-h-[48px] px-3.5 py-2.5 rounded-[10px] text-admin-ink hover:border-admin-teal transition-colors shadow-sm"
              aria-label="StayHub – Cổng quản trị"
            >
              <svg className="w-6 h-6 text-admin-teal shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3.5 10.5 12 3l8.5 7.5" />
                <path d="M5.5 9.5V21h13V9.5" />
                <path d="M9.5 21v-6h5v6" />
              </svg>
              <span className="admin-brand-logo-text">StayHub</span>
            </Link>

            {/* Bottom caption card */}
            <figure className="admin-brand-caption w-full max-w-[480px] m-0 p-6 lg:p-[30px] rounded-[10px] shadow-sm">
              <p className="admin-brand-headline m-0">
                Vận hành khách sạn,<br />
                <em>gọn trong một màn hình.</em>
              </p>
              <figcaption className="admin-brand-caption-foot mt-5 pt-3.5 border-t border-admin-border">
                © 2026 StayHub · Bảo mật nhiều lớp cho bộ phận quản trị & vận hành
              </figcaption>
            </figure>
          </div>
        </aside>

        {/* Right form panel */}
        <section className="flex flex-col min-h-screen min-h-[100dvh] lg:border-l lg:border-admin-border bg-admin-bg" id="main">
          {/* Top navigation bar */}
          <header className="flex items-center justify-between gap-3 min-h-[56px] sm:min-h-[72px] px-4 sm:px-7 py-2.5">
            {/* Mobile logo */}
            <Link
              to="/"
              className="lg:hidden inline-flex items-center gap-2 min-h-[44px] py-1.5 px-0.5 text-admin-ink"
              aria-label="StayHub – Cổng quản trị"
            >
              <svg className="w-6 h-6 text-admin-teal shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3.5 10.5 12 3l8.5 7.5" />
                <path d="M5.5 9.5V21h13V9.5" />
                <path d="M9.5 21v-6h5v6" />
              </svg>
              <span className="admin-mobile-logo-text">StayHub</span>
            </Link>

            {/* Back to guest link */}
            <Link
              to="/"
              className="admin-back-link inline-flex items-center gap-2 min-h-[44px] ml-auto px-0.5 border-0 bg-transparent group"
            >
              <svg className="w-[18px] h-[18px] text-admin-teal shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 12H4" />
                <path d="m10 6-6 6 6 6" />
              </svg>
              <span className="group-hover:underline underline-offset-4 decoration-current">Về trang khách</span>
            </Link>
          </header>

          {/* Panel center body */}
          <div className="flex-1 flex items-center justify-center px-5 sm:px-10 lg:px-16 py-8 sm:py-10">
            <div className="w-full max-w-[424px] flex flex-col gap-8 my-auto">
              {/* Heading */}
              <div className="border-b border-admin-border pb-6">
                <h1 className="admin-h1">
                  <span className="sr-only">Đăng nhập quản trị</span>
                  <span aria-hidden="true">
                    Đăng nhập<br />
                    <em>quản trị</em>
                  </span>
                </h1>
                <p className="admin-lede">
                  Dùng tài khoản quản trị để tiếp tục vào StayHub.
                </p>
              </div>

              {/* Form or State content */}
              {!session && status !== 'restoring' ? (
                <AdminLoginForm />
              ) : verifying ? (
                <div className="flex flex-col items-center justify-center gap-4 py-12" role="status" aria-live="polite">
                  <div className="w-8 h-8 border-2 border-admin-teal/25 border-t-admin-teal rounded-full animate-spin" aria-hidden="true" />
                  <p className="m-0 text-sm font-medium text-admin-ink-2">Đang xác minh quyền truy cập</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {hasError ? (
                    <>
                      <div className="p-4 border border-admin-danger/30 rounded-[10px] bg-admin-surface flex flex-col gap-1.5" role="alert">
                        <div className="flex items-center gap-2 text-admin-danger font-semibold text-sm">
                          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                          </svg>
                          <span>Chưa xác minh được tài khoản</span>
                        </div>
                        <p className="m-0 text-xs text-admin-ink-2 leading-relaxed pl-6">{errorMessage(isError ? error : workplacesError)}</p>
                      </div>
                      <button
                        type="button"
                        disabled={isFetching || isWorkplacesFetching}
                        onClick={() => void (isError ? refetch() : refetchWorkplaces())}
                        className="admin-login-btn-primary w-full h-11 px-4 rounded-[8px] font-semibold text-sm transition-colors cursor-pointer disabled:opacity-75"
                      >
                        {isFetching || isWorkplacesFetching ? 'Đang thử lại…' : 'Thử lại'}
                      </button>
                    </>
                  ) : (
                    <div className="p-4 border border-[#946412]/30 rounded-[10px] bg-admin-surface flex flex-col gap-1.5" role="alert">
                      <div className="flex items-center gap-2 text-[#946412] font-semibold text-sm">
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                          <line x1="12" y1="9" x2="12" y2="13" />
                          <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                        <span>Tài khoản chưa có quyền quản trị</span>
                      </div>
                      <p className="m-0 text-xs text-admin-ink-2 leading-relaxed pl-6">
                        Tài khoản <strong className="font-semibold text-admin-ink">{currentUser?.email}</strong> chưa được cấp quyền quản trị viên (ADMIN) hoặc đối tác khách sạn (HOTEL_OWNER). Vui lòng sử dụng tài khoản có thẩm quyền hoặc liên hệ người quản trị.
                      </p>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={clearAuthSession}
                    className="w-full h-11 px-4 rounded-[8px] border border-admin-border-strong hover:border-admin-teal hover:text-admin-teal text-admin-ink font-semibold text-sm transition-colors cursor-pointer bg-transparent"
                  >
                    Đăng nhập bằng tài khoản khác
                  </button>
                </div>
              )}

              {/* Support footer row */}
              <div className="flex items-center justify-between gap-2 flex-wrap mt-1">
                <p className="admin-support-text inline-flex items-center gap-2 m-0">
                  <svg className="w-4 h-4 text-admin-teal shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="4.5" y="10" width="15" height="10.5" rx="2" />
                    <path d="M8 10V7.5a4 4 0 0 1 8 0V10" />
                  </svg>
                  <span>Chỉ dành cho quản trị viên.</span>
                </p>
                <button
                  type="button"
                  onClick={() => setHelpOpen(true)}
                  className="admin-link-btn ml-auto"
                >
                  Cần hỗ trợ?
                </button>
              </div>
            </div>
          </div>

          {/* Panel footer */}
          <footer className="admin-panel-foot px-5 sm:px-8 py-5 border-t border-admin-border text-center lg:text-left">
            StayHub · Cổng quản trị
          </footer>
        </section>
      </main>

      {/* Accessible Help Modal */}
      {helpOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071c18]/48 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="helpDialogTitle"
        >
          <div className="w-full max-w-[480px] p-7 border border-admin-border rounded-[16px] bg-admin-surface text-admin-ink shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between gap-3">
              <h2 id="helpDialogTitle" className="admin-dialog-heading">
                Cần hỗ trợ?
              </h2>
              <button
                type="button"
                onClick={() => setHelpOpen(false)}
                className="grid place-items-center w-8 h-8 rounded-md text-admin-muted hover:text-admin-ink hover:bg-admin-border/30 transition-colors border-0 bg-transparent cursor-pointer -mt-1 -mr-1"
                aria-label="Đóng hộp thoại"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m6 6 12 12" />
                  <path d="M18 6 6 18" />
                </svg>
              </button>
            </div>
            <p className="admin-dialog-body m-0">
              Nếu không đăng nhập được, hãy kiểm tra email đã được cấp quyền quản trị và liên hệ quản trị viên cấp cao. Ghi kèm mã khách sạn và thời điểm đăng nhập để được hỗ trợ nhanh hơn.
            </p>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setHelpOpen(false)}
                className="admin-dialog-close-btn h-10 px-5 border border-admin-border-strong hover:border-admin-teal hover:text-admin-teal rounded-[6px] bg-transparent transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
