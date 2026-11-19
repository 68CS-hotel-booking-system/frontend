import { useId, useRef, type ReactNode } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, Button, Input } from 'antd'
import { Link, useLocation } from 'react-router'
import { z } from 'zod'
import { ApiError, errorMessage } from '@/shared/api/api-error'
import { applyApiFieldErrors } from '@/shared/lib/form-errors'
import { forgotPasswordRequestSchema, resetPasswordRequestSchema, type ForgotPasswordRequest } from '../api/auth-contracts'
import { useAuthAction } from '../hooks/use-auth-action'
import { useAuthLinkToken } from '../hooks/use-auth-link-token'
import '@/shared/styles/password-recovery.css'

const resetFields = resetPasswordRequestSchema.pick({ newPassword: true })
  .extend({ confirmPassword: z.string().min(1, 'Vui lòng nhập lại mật khẩu mới.') })
  .refine(values => values.newPassword.trim().length > 0, {
    path: ['newPassword'], message: 'Mật khẩu không được chỉ có khoảng trắng.',
  })
  .refine(values => values.newPassword === values.confirmPassword || !values.confirmPassword, {
    path: ['confirmPassword'], message: 'Hai mật khẩu chưa khớp.',
  })

const linkErrors: Record<string, string> = {
  TOKEN_INVALID: 'Liên kết đặt lại mật khẩu không hợp lệ.',
  TOKEN_EXPIRED: 'Liên kết đặt lại mật khẩu đã hết hạn.',
  TOKEN_ALREADY_USED: 'Liên kết đặt lại mật khẩu đã được sử dụng.',
}

function RecoveryCard({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  const titleId = useId()
  return <div className="password-recovery">
    <section className="password-recovery-card" aria-labelledby={titleId}>
      <header aria-live="polite">
        <h1 id={titleId}>{title}</h1>
        <p>{description}</p>
      </header>
      {children}
    </section>
  </div>
}

export function ForgotPasswordView() {
  const emailId = useId()
  const { state } = useLocation()
  const initialEmail = typeof state?.recoveryEmail === 'string' ? state.recoveryEmail : ''
  const request = useAuthAction('forgot-password')
  const { control, handleSubmit, reset, setError, formState: { errors, isSubmitting } } =
    useForm<ForgotPasswordRequest>({
      resolver: zodResolver(forgotPasswordRequestSchema),
      defaultValues: { email: initialEmail },
    })

  async function submit(values: ForgotPasswordRequest) {
    try {
      await request.mutateAsync(values)
    } catch (error) {
      if (!applyApiFieldErrors(error, setError, ['email'])) {
        setError('root.server', { message: errorMessage(error) })
      }
    }
  }

  return <RecoveryCard
    title={request.isSuccess ? 'Kiểm tra hộp thư' : 'Quên mật khẩu'}
    description={request.isSuccess
      ? 'Nếu email này khớp với tài khoản đủ điều kiện, bạn sẽ nhận được liên kết đặt lại mật khẩu. Hãy kiểm tra cả thư rác.'
      : 'Nhập email dùng để đăng ký StayHub. Chúng mình sẽ gửi liên kết để bạn tạo mật khẩu mới.'}
  >
    {request.isSuccess ? (
      <div className="password-recovery-actions">
        <Button onClick={() => {
          reset({ email: '' })
          request.reset()
        }}>Dùng email khác</Button>
        <Link to="/login">Về đăng nhập</Link>
      </div>
    ) : (
      <form className="password-recovery-form" onSubmit={handleSubmit(submit)} noValidate aria-busy={isSubmitting}>
        {errors.root?.server?.message && <Alert type="error" showIcon title={errors.root.server.message} />}
        <div className="password-recovery-field">
          <label htmlFor={emailId}>Email</label>
          <Controller name="email" control={control} render={({ field }) =>
            <Input {...field} id={emailId} type="email" autoComplete="email" spellCheck={false} maxLength={255}
              readOnly={isSubmitting} status={errors.email ? 'error' : undefined}
              aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? `${emailId}-error` : undefined} />
          } />
          {errors.email?.message && <p id={`${emailId}-error`} className="password-recovery-error" role="alert">{errors.email.message}</p>}
        </div>
        <Button type="primary" htmlType="submit" loading={isSubmitting}>Gửi email đặt lại mật khẩu</Button>
        <Link className="password-recovery-back" to="/login">Về đăng nhập</Link>
      </form>
    )}
  </RecoveryCard>
}

export function ResetPasswordView() {
  const fieldId = useId()
  const inFlight = useRef(false)
  const token = useAuthLinkToken()
  const request = useAuthAction('reset-password')
  const { control, handleSubmit, setError, formState: { errors, isSubmitting } } =
    useForm<z.infer<typeof resetFields>>({
      resolver: zodResolver(resetFields),
      defaultValues: { newPassword: '', confirmPassword: '' },
    })
  const errorCode = request.error instanceof ApiError ? request.error.code : undefined
  const linkError = !token ? 'Hãy mở liên kết đặt lại mật khẩu trong email của bạn.'
    : errorCode ? linkErrors[errorCode] : undefined

  async function submit({ newPassword }: z.infer<typeof resetFields>) {
    if (!token || inFlight.current) return
    inFlight.current = true
    try {
      await request.mutateAsync({ token, newPassword })
    } catch (error) {
      if (!applyApiFieldErrors(error, setError, ['newPassword'])) {
        setError('root.server', { message: errorMessage(error) })
      }
    } finally {
      inFlight.current = false
    }
  }

  if (linkError) return <RecoveryCard title="Cần liên kết đặt lại mật khẩu" description={linkError}>
    <div className="password-recovery-actions">
      <Link className="ref-btn ref-btn-primary" to="/forgot-password">Yêu cầu liên kết mới</Link>
      <Link to="/login">Về đăng nhập</Link>
    </div>
  </RecoveryCard>

  if (request.isSuccess) return <RecoveryCard title="Đã đặt lại mật khẩu" description="Bạn có thể đăng nhập bằng mật khẩu mới.">
    <div className="password-recovery-actions">
      <Link className="ref-btn ref-btn-primary" to="/login" replace>Đăng nhập</Link>
    </div>
  </RecoveryCard>

  return <RecoveryCard title="Đặt lại mật khẩu" description="Tạo mật khẩu mới cho tài khoản StayHub của bạn.">
    <form className="password-recovery-form" onSubmit={event => void handleSubmit(submit)(event)} noValidate aria-busy={isSubmitting}>
      {errors.root?.server?.message && <Alert type="error" showIcon title={errors.root.server.message} />}
      <div className="password-recovery-field">
        <label htmlFor={`${fieldId}-password`}>Mật khẩu mới</label>
        <Controller name="newPassword" control={control} render={({ field }) =>
          <Input.Password {...field} id={`${fieldId}-password`} autoComplete="new-password" maxLength={128}
            readOnly={isSubmitting} status={errors.newPassword ? 'error' : undefined}
            aria-invalid={Boolean(errors.newPassword)} aria-describedby={`${fieldId}-password-help`} />
        } />
        <p id={`${fieldId}-password-help`} className={errors.newPassword ? 'password-recovery-error' : 'password-recovery-hint'}
          role={errors.newPassword ? 'alert' : undefined}>{errors.newPassword?.message || 'Dùng từ 15 đến 128 ký tự.'}</p>
      </div>
      <div className="password-recovery-field">
        <label htmlFor={`${fieldId}-confirm`}>Nhập lại mật khẩu mới</label>
        <Controller name="confirmPassword" control={control} render={({ field }) =>
          <Input.Password {...field} id={`${fieldId}-confirm`} autoComplete="new-password" maxLength={128}
            readOnly={isSubmitting} status={errors.confirmPassword ? 'error' : undefined}
            aria-invalid={Boolean(errors.confirmPassword)}
            aria-describedby={errors.confirmPassword ? `${fieldId}-confirm-error` : undefined} />
        } />
        {errors.confirmPassword?.message && <p id={`${fieldId}-confirm-error`} className="password-recovery-error" role="alert">{errors.confirmPassword.message}</p>}
      </div>
      <Button type="primary" htmlType="submit" loading={isSubmitting}>Lưu mật khẩu mới</Button>
      <Link className="password-recovery-back" to="/login">Về đăng nhập</Link>
    </form>
  </RecoveryCard>
}
