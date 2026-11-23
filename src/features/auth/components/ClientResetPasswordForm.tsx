import { useId, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router'
import {
  ArrowRightOutlined,
  CheckCircleFilled,
  EyeInvisibleOutlined,
  EyeOutlined,
  KeyOutlined,
  LoadingOutlined,
  LockOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import { errorMessage } from '@/shared/api/api-error'
import { applyApiFieldErrors } from '@/shared/lib/form-errors'
import {
  resetPasswordRequestSchema,
  type ResetPasswordRequest,
} from '../api/auth-contracts'
import { useAuthAction } from '../hooks/use-auth-action'
import { useAuthLinkToken } from '../hooks/use-auth-link-token'

export interface ClientResetPasswordFormProps {
  inModal?: boolean
  onSwitchToLogin?: () => void
  onSwitchToForgot?: () => void
}

/**
 * Biểu mẫu đặt lại mật khẩu bằng mã xác nhận, đồng bộ kích cỡ và kiểu dáng với modal Đăng nhập.
 */
export function ClientResetPasswordForm({
  onSwitchToLogin,
  onSwitchToForgot,
}: ClientResetPasswordFormProps) {
  const id = useId()
  const inFlight = useRef(false)
  const initialToken = useAuthLinkToken()

  const [showToken, setShowToken] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [succeeded, setSucceeded] = useState(false)

  const mutation = useAuthAction('reset-password')
  const {
    control,
    handleSubmit,
    setError,
    resetField,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordRequest>({
    resolver: zodResolver(resetPasswordRequestSchema),
    defaultValues: { token: initialToken, newPassword: '' },
  })

  const busy = isSubmitting || mutation.isPending

  async function onSubmit(values: ResetPasswordRequest) {
    if (inFlight.current) return
    inFlight.current = true
    setApiError(null)

    try {
      await mutation.mutateAsync(values)
      resetField('newPassword', { defaultValue: '' })
      setSucceeded(true)
    } catch (error) {
      const applied = applyApiFieldErrors(error, setError, ['token', 'newPassword'])
      if (applied === 0) {
        setApiError(
          errorMessage(error) ||
            'Không thể đặt lại mật khẩu. Vui lòng kiểm tra mã xác nhận và thử lại.',
        )
      }
    } finally {
      inFlight.current = false
    }
  }

  if (succeeded) {
    return (
      <div className="auth-form-slide flex flex-col gap-4 w-full" role="status" aria-live="polite">
        <div className="rounded-xl border border-[#c6ded0] bg-[#eef5f1] p-3.5 flex items-start gap-2.5 text-sm text-[#1e463d]">
          <CheckCircleFilled className="text-base text-[#1f7a4d] shrink-0 mt-0.5" aria-hidden="true" />
          <p className="m-0 leading-relaxed">
            Đặt lại mật khẩu thành công. Các phiên đăng nhập cũ đã được đăng xuất.
          </p>
        </div>

        {onSwitchToLogin ? (
          <button type="button" className="auth-btn-primary" onClick={onSwitchToLogin}>
            <span>Đăng nhập ngay</span>
            <ArrowRightOutlined />
          </button>
        ) : (
          <Link to="/login" className="auth-btn-primary no-underline">
            <span>Đăng nhập ngay</span>
            <ArrowRightOutlined />
          </Link>
        )}
      </div>
    )
  }

  return (
    <form
      className="auth-form-slide flex flex-col gap-4 w-full"
      onSubmit={(e) => {
        void handleSubmit(onSubmit)(e)
      }}
      noValidate
      aria-busy={busy}
    >
      {apiError && (
        <div className="auth-alert-box" role="alert">
          <WarningOutlined className="mt-0.5 shrink-0 text-base" aria-hidden="true" />
          <span>{apiError}</span>
        </div>
      )}

      {initialToken && (
        <div className="rounded-xl border border-[#e9e0e2] bg-[#faf2f3] px-3.5 py-2.5 text-xs text-[#655b5f]">
          Đã nhận mã đặt lại mật khẩu từ liên kết email. Hãy nhập mật khẩu mới bên dưới để hoàn tất.
        </div>
      )}

      <div className="auth-field-group auth-stagger-item auth-stagger-3">
        <label htmlFor={`${id}-token`} className="auth-field-label">
          Mã đặt lại mật khẩu
        </label>
        <div className="auth-input-container">
          <span className="auth-input-icon" aria-hidden="true">
            <KeyOutlined />
          </span>
          <Controller
            name="token"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                id={`${id}-token`}
                type={showToken ? 'text' : 'password'}
                autoComplete="one-time-code"
                placeholder="Dán mã từ email của bạn"
                disabled={busy}
                aria-invalid={Boolean(errors.token)}
                aria-describedby={errors.token ? `${id}-token-error` : undefined}
                className={`auth-input has-toggle ${errors.token ? 'is-invalid' : ''}`}
              />
            )}
          />
          <button
            type="button"
            className="auth-toggle-pwd"
            aria-label={showToken ? 'Ẩn mã đặt lại mật khẩu' : 'Hiện mã đặt lại mật khẩu'}
            onClick={() => setShowToken((prev) => !prev)}
            tabIndex={0}
          >
            <span className="auth-toggle-pwd-icon">
              {showToken ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            </span>
          </button>
        </div>
        {errors.token && (
          <p className="auth-field-error" id={`${id}-token-error`} role="alert">
            {errors.token.message}
          </p>
        )}
      </div>

      <div className="auth-field-group auth-stagger-item auth-stagger-4">
        <label htmlFor={`${id}-newPassword`} className="auth-field-label">
          Mật khẩu mới
        </label>
        <div className="auth-input-container">
          <span className="auth-input-icon" aria-hidden="true">
            <LockOutlined />
          </span>
          <Controller
            name="newPassword"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                id={`${id}-newPassword`}
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••••••"
                disabled={busy}
                aria-invalid={Boolean(errors.newPassword)}
                aria-describedby={`${id}-newPassword-hint${errors.newPassword ? ` ${id}-newPassword-error` : ''}`}
                className={`auth-input has-toggle ${errors.newPassword ? 'is-invalid' : ''}`}
              />
            )}
          />
          <button
            type="button"
            className="auth-toggle-pwd"
            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            onClick={() => setShowPassword((prev) => !prev)}
            tabIndex={0}
          >
            <span className="auth-toggle-pwd-icon">
              {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            </span>
          </button>
        </div>
        <p className="text-xs text-[#655b5f] m-0" id={`${id}-newPassword-hint`}>
          Mật khẩu dài 15–128 ký tự.
        </p>
        {errors.newPassword && (
          <p className="auth-field-error" id={`${id}-newPassword-error`} role="alert">
            {errors.newPassword.message}
          </p>
        )}
      </div>

      <div className="auth-stagger-item auth-stagger-5 flex flex-col w-full">
        <button
          type="submit"
          className="auth-btn-primary"
          disabled={busy}
          aria-disabled={busy}
        >
          {busy ? (
            <>
              <LoadingOutlined aria-hidden="true" />
              <span>Đang cập nhật mật khẩu...</span>
            </>
          ) : (
            <>
              <span>Đặt lại mật khẩu</span>
              <ArrowRightOutlined />
            </>
          )}
        </button>

        <div className="auth-switch-line flex flex-wrap justify-center gap-x-3 gap-y-1">
          {onSwitchToForgot ? (
            <button
              type="button"
              className="auth-switch-btn"
              onClick={onSwitchToForgot}
              disabled={busy}
            >
              Gửi lại mã
            </button>
          ) : (
            <Link to="/forgot-password" className="auth-switch-btn no-underline">
              Gửi lại mã
            </Link>
          )}
          <span aria-hidden="true">·</span>
          {onSwitchToLogin ? (
            <button
              type="button"
              className="auth-switch-btn"
              onClick={onSwitchToLogin}
              disabled={busy}
            >
              Quay lại đăng nhập
            </button>
          ) : (
            <Link to="/login" className="auth-switch-btn no-underline">
              Quay lại đăng nhập
            </Link>
          )}
        </div>
      </div>
    </form>
  )
}
