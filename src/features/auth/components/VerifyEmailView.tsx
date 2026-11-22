import { Link } from 'react-router'
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckCircleFilled,
  ClockCircleFilled,
  CloseCircleFilled,
  ExclamationCircleFilled,
  InfoCircleFilled,
  LoadingOutlined,
  LoginOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { useVerifyEmail, type VerifyEmailResult, type VerifyEmailStatus } from '../hooks/use-verify-email'

export interface VerifyEmailViewProps {
  overrideToken?: string
  overrideStatus?: VerifyEmailStatus
  countdown?: number | null
  onSuccess?: (result: VerifyEmailResult) => void
  onNavigateHome?: () => void
}

export function VerifyEmailView({
  overrideToken,
  overrideStatus,
  countdown,
  onSuccess,
  onNavigateHome,
}: VerifyEmailViewProps) {
  const { status: liveStatus, errorMessage, isVerifying, retry } = useVerifyEmail({
    overrideToken,
    onSuccess: overrideStatus ? undefined : onSuccess,
  })
  const status = overrideStatus ?? liveStatus

  const primaryBtnClass =
    'w-full sm:w-auto min-h-[48px] px-7 py-2.5 rounded-xl bg-[#c91f4b] hover:bg-[#a9183d] active:bg-[#921236] text-white font-semibold text-sm shadow-sm transition-all inline-flex items-center justify-center gap-2 no-underline focus-visible:outline-2 focus-visible:outline-[#c91f4b] active:scale-[0.99] cursor-pointer'
  const secondaryBtnClass =
    'w-full sm:w-auto min-h-[48px] px-5 py-2.5 rounded-xl border border-[#e1d6d9] hover:border-[#c91f4b] hover:bg-[#faf2f3] text-[#241f20] hover:text-[#c91f4b] font-semibold text-sm transition-colors inline-flex items-center justify-center no-underline focus-visible:outline-2 focus-visible:outline-[#c91f4b]'

  return (
    <div className="stayhub-client min-h-screen min-h-[100dvh] flex flex-col justify-between bg-[#fffcfb] text-[#241f20] selection:bg-[#f6d7e0] selection:text-[#5b1429]">
      {/* 1. Header gọn đồng bộ thương hiệu Client */}
      <header className="w-full border-b border-[#eee4e6] bg-white/95 backdrop-blur-md sticky top-0 z-10 transition-all">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="flex items-center gap-2.5 sm:gap-3 no-underline group focus-visible:outline-2 focus-visible:outline-[#c91f4b] rounded-lg"
            aria-label="StayHub – Về trang chủ"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#faf2f3] border border-[#e9e0e2] text-[#c91f4b] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 11.2 12 4l9 7.2" />
                <path d="M5.5 10v9.5h13V10M10 19.5v-5h4v5" />
              </svg>
            </div>
            <div className="flex flex-col leading-none shrink-0">
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#241f20]">
                StayHub
              </span>
              <span className="text-[10px] font-bold tracking-wider uppercase text-[#655b5f] mt-0.5">
                Chỗ nghỉ &amp; trải nghiệm
              </span>
            </div>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#655b5f] hover:text-[#c91f4b] transition-colors py-2 px-3.5 rounded-full hover:bg-[#faf2f3] no-underline focus-visible:outline-2 focus-visible:outline-[#c91f4b]"
          >
            <ArrowLeftOutlined className="text-xs" aria-hidden="true" />
            <span>Về trang chủ</span>
          </Link>
        </div>
      </header>

      {/* 2. Khối nội dung chính */}
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-16"
      >
        <section
          className="w-full max-w-[480px] bg-white border border-[#e9e0e2] rounded-2xl p-6 sm:p-10 shadow-[0_14px_36px_rgb(55_33_41_/_7%)] text-center transition-all"
          aria-live="polite"
        >
          {/* Status Icon */}
          <div className="flex justify-center mb-6">
            {status === 'verifying' && (
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#faf2f3] text-[#c91f4b] border border-[#e9e0e2] flex items-center justify-center text-2xl sm:text-3xl"
                role="status"
                aria-label="Đang xử lý"
              >
                <LoadingOutlined spin aria-hidden="true" />
              </div>
            )}

            {status === 'success' && (
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#eef5f1] text-[#2a583e] border border-[#c6ded0] flex items-center justify-center text-3xl sm:text-4xl"
                role="img"
                aria-label="Thành công"
              >
                <CheckCircleFilled aria-hidden="true" />
              </div>
            )}

            {status === 'missing-token' && (
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center text-3xl sm:text-4xl"
                role="img"
                aria-label="Thiếu mã xác minh"
              >
                <ExclamationCircleFilled aria-hidden="true" />
              </div>
            )}

            {status === 'expired' && (
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center text-3xl sm:text-4xl"
                role="img"
                aria-label="Liên kết hết hạn"
              >
                <ClockCircleFilled aria-hidden="true" />
              </div>
            )}

            {status === 'invalid' && (
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-50 text-red-600 border border-red-200 flex items-center justify-center text-3xl sm:text-4xl"
                role="img"
                aria-label="Liên kết không hợp lệ"
              >
                <CloseCircleFilled aria-hidden="true" />
              </div>
            )}

            {status === 'already-used' && (
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center text-3xl sm:text-4xl"
                role="img"
                aria-label="Liên kết đã dùng"
              >
                <InfoCircleFilled aria-hidden="true" />
              </div>
            )}

            {status === 'error' && (
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-50 text-red-600 border border-red-200 flex items-center justify-center text-3xl sm:text-4xl"
                role="img"
                aria-label="Lỗi xác minh"
              >
                <ExclamationCircleFilled aria-hidden="true" />
              </div>
            )}
          </div>

          {/* Status Badge when verified with countdown */}
          {status === 'success' && countdown !== undefined && countdown !== null && (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#eef5f1] text-[#2a583e] border border-[#c6ded0] text-xs font-semibold mb-3 mx-auto">
              <CheckCircleFilled className="text-xs" aria-hidden="true" />
              <span>Đăng ký &amp; kích hoạt tài khoản thành công</span>
            </div>
          )}

          {/* Heading */}
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#241f20] mb-3">
            {status === 'verifying' && 'Đang xác minh email'}
            {status === 'success' && 'Xác minh email thành công'}
            {status === 'missing-token' && 'Liên kết xác minh không hợp lệ'}
            {status === 'expired' && 'Liên kết xác minh đã hết hạn'}
            {status === 'invalid' && 'Liên kết không hợp lệ'}
            {status === 'already-used' && 'Liên kết đã được sử dụng'}
            {status === 'error' && 'Không thể hoàn tất xác minh'}
          </h1>

          {/* Description */}
          <div className="text-sm sm:text-base text-[#655b5f] leading-relaxed mb-8 max-w-sm mx-auto">
            {status === 'verifying' && (
              <p>Hệ thống đang kiểm tra liên kết xác minh tài khoản của bạn. Vui lòng đợi trong giây lát.</p>
            )}

            {status === 'success' && (
              <div className="flex flex-col items-center gap-3">
                <p>
                  Email của bạn đã được xác minh thành công. Bạn đã được đăng nhập tự động vào hệ thống StayHub.
                </p>
                {countdown !== undefined && countdown !== null && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#faf2f3] border border-[#e9e0e2] text-xs sm:text-sm font-medium text-[#241f20] shadow-xs">
                    <ClockCircleFilled className="text-[#c91f4b] text-sm animate-pulse" aria-hidden="true" />
                    <span>
                      Tự động chuyển về trang chủ sau{' '}
                      <strong className="text-[#c91f4b] font-bold text-base tabular-nums">
                        {countdown}
                      </strong>{' '}
                      giây...
                    </span>
                  </div>
                )}
              </div>
            )}

            {status === 'missing-token' && (
              <p>
                Không tìm thấy mã xác minh trong đường dẫn. Vui lòng kiểm tra và mở đầy đủ liên kết được gửi trong email của bạn.
              </p>
            )}

            {status === 'expired' && (
              <p>
                Liên kết xác minh này đã hết hiệu lực. Vì lý do an toàn, mã xác nhận chỉ có giá trị trong một khoảng thời gian nhất định.
              </p>
            )}

            {status === 'invalid' && (
              <p>
                Mã xác minh không tồn tại hoặc sai định dạng. Vui lòng kiểm tra lại liên kết trong email mới nhất.
              </p>
            )}

            {status === 'already-used' && (
              <p>
                Liên kết xác minh này đã được sử dụng trước đó. Bạn có thể tiến hành đăng nhập vào tài khoản ngay.
              </p>
            )}

            {status === 'error' && (
              <p>{errorMessage || 'Đã xảy ra sự cố khi kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.'}</p>
            )}
          </div>

          {/* 3. Khối hành động */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center">
            {status === 'verifying' && (
              <button
                type="button"
                disabled
                className="w-full sm:w-auto min-h-[48px] px-6 py-2.5 rounded-xl bg-[#eee4e6] text-[#655b5f] font-semibold text-sm cursor-not-allowed inline-flex items-center justify-center gap-2 border-0"
              >
                <LoadingOutlined spin aria-hidden="true" />
                <span>Đang xử lý...</span>
              </button>
            )}

            {status === 'success' && (
              <>
                {countdown !== undefined && countdown !== null ? (
                  <>
                    <button
                      type="button"
                      onClick={onNavigateHome}
                      className={`${primaryBtnClass} border-0`}
                    >
                      <span>Đến trang chủ ngay</span>
                      <ArrowRightOutlined aria-hidden="true" />
                    </button>
                    <Link to="/" className={secondaryBtnClass}>
                      <span>Khám phá chỗ nghỉ</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/login" className={primaryBtnClass}>
                      <LoginOutlined aria-hidden="true" />
                      <span>Đăng nhập</span>
                    </Link>
                    <Link to="/" className={secondaryBtnClass}>
                      <span>Khám phá chỗ nghỉ</span>
                    </Link>
                  </>
                )}
              </>
            )}

            {status === 'already-used' && (
              <>
                <Link to="/login" className={primaryBtnClass}>
                  <LoginOutlined aria-hidden="true" />
                  <span>Đăng nhập</span>
                </Link>
                <Link to="/" className={secondaryBtnClass}>
                  <span>Về trang chủ</span>
                </Link>
              </>
            )}

            {(status === 'missing-token' || status === 'expired' || status === 'invalid') && (
              <>
                <Link to="/" className={primaryBtnClass}>
                  <span>Về trang chủ</span>
                </Link>
                <Link to="/login" className={secondaryBtnClass}>
                  <span>Đăng nhập</span>
                </Link>
              </>
            )}

            {status === 'error' && (
              <>
                <button
                  type="button"
                  onClick={retry}
                  disabled={isVerifying}
                  className={`${primaryBtnClass} border-0 disabled:opacity-50`}
                >
                  <ReloadOutlined aria-hidden="true" />
                  <span>Thử lại</span>
                </button>
                <Link to="/" className={secondaryBtnClass}>
                  <span>Về trang chủ</span>
                </Link>
              </>
            )}
          </div>
        </section>
      </main>

      {/* 4. Footer gọn */}
      <footer className="w-full py-6 text-center text-xs text-[#655b5f] border-t border-[#eee4e6] px-4">
        <p className="m-0">© 2026 StayHub · Nền tảng đặt phòng nghỉ dưỡng. Mọi quyền được bảo lưu.</p>
      </footer>
    </div>
  )
}
