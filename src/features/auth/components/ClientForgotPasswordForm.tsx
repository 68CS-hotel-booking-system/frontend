import { useId, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router'
import {
  ArrowRightOutlined,
  CheckCircleFilled,
  LoadingOutlined,
  MailOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import { errorMessage } from '@/shared/api/api-error'
import { applyApiFieldErrors } from '@/shared/lib/form-errors'
import {
  forgotPasswordRequestSchema,
  type ForgotPasswordRequest,
} from '../api/auth-contracts'
import { useAuthAction } from '../hooks/use-auth-action'

export interface ClientForgotPasswordFormProps {
  defaultEmail?: string
  inModal?: boolean
  onSwitchToLogin?: (currentEmail?: string) => void
  onSwitchToReset?: (currentEmail?: string) => void
}

/**
 * Biểu mẫu yêu cầu gửi email đặt lại mật khẩu, đồng bộ kích cỡ và kiểu dáng với modal Đăng nhập.
 */
export function ClientForgotPasswordForm({
  defaultEmail = '',
  onSwitchToLogin,
  onSwitchToReset,
}: ClientForgotPasswordFormProps) {
  const id = useId()
  const inFlight = useRef(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const mutation = useAuthAction('forgot-password')
  const {
    control,
    handleSubmit,
    setError,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordRequest>({
    resolver: zodResolver(forgotPasswordRequestSchema),
    defaultValues: { email: defaultEmail },
  })

  const busy = isSubmitting || mutation.isPending

  async function onSubmit(values: ForgotPasswordRequest) {
    if (inFlight.current) return
    inFlight.current = true
    setApiError(null)

    try {
      await mutation.mutateAsync(values)
      setSubmitted(true)
    } catch (error) {
      const applied = applyApiFieldErrors(error, setError, ['email'])
      if (applied === 0) {
        setApiError(
          errorMessage(error) ||
            'Không thể gửi yêu cầu đặt lại mật khẩu. Vui lòng thử lại.',
        )
      }
    } finally {
      inFlight.current = false
    }
  }

  if (submitted) {
    return (
      <div className="auth-form-slide flex flex-col gap-4 w-full" role="status" aria-live="polite">
        <div className="rounded-xl border border-[#c6ded0] bg-[#eef5f1] p-3.5 flex items-start gap-2.5 text-sm text-[#1e463d]">
          <CheckCircleFilled className="text-base text-[#1f7a4d] shrink-0 mt-0.5" aria-hidden="true" />
          <p className="m-0 leading-relaxed">
            Nếu tài khoản đủ điều kiện, hệ thống sẽ gửi email hướng dẫn đặt lại mật khẩu. Vui lòng kiểm tra hộp thư đến hoặc thư rác.
          </p>
        </div>

        <div className="flex flex-col w-full">
          {onSwitchToReset ? (
            <button
              type="button"
              className="auth-btn-primary"
              onClick={() => onSwitchToReset(getValues('email'))}
            >
              <span>Nhập mã đặt lại mật khẩu</span>
              <ArrowRightOutlined />
            </button>
          ) : (
            <Link to="/reset-password" className="auth-btn-primary no-underline">
              <span>Nhập mã đặt lại mật khẩu</span>
              <ArrowRightOutlined />
            </Link>
          )}

          <div className="auth-switch-line">
            <span>Đã nhớ mật khẩu?</span>
            {onSwitchToLogin ? (
              <button
                type="button"
                className="auth-switch-btn"
                onClick={() => onSwitchToLogin(getValues('email'))}
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

      <div className="auth-field-group auth-stagger-item auth-stagger-3">
        <label htmlFor={`${id}-email`} className="auth-field-label">
          Email
        </label>
        <div className="auth-input-container">
          <span className="auth-input-icon" aria-hidden="true">
            <MailOutlined />
          </span>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                id={`${id}-email`}
                type="email"
                autoComplete="email"
                inputMode="email"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="ten@example.com"
                disabled={busy}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? `${id}-email-error` : undefined}
                className={`auth-input ${errors.email ? 'is-invalid' : ''}`}
              />
            )}
          />
        </div>
        {errors.email && (
          <p className="auth-field-error" id={`${id}-email-error`} role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="auth-stagger-item auth-stagger-4 flex flex-col w-full">
        <button
          type="submit"
          className="auth-btn-primary"
          disabled={busy}
          aria-disabled={busy}
        >
          {busy ? (
            <>
              <LoadingOutlined aria-hidden="true" />
              <span>Đang gửi yêu cầu...</span>
            </>
          ) : (
            <>
              <span>Gửi hướng dẫn đặt lại mật khẩu</span>
              <ArrowRightOutlined />
            </>
          )}
        </button>

        <div className="auth-switch-line">
          <span>Đã nhớ mật khẩu?</span>
          {onSwitchToLogin ? (
            <button
              type="button"
              className="auth-switch-btn"
              onClick={() => onSwitchToLogin(getValues('email'))}
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
