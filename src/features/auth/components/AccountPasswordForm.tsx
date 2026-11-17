import { useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, App, Button, Input } from 'antd'
import { Controller, useForm } from 'react-hook-form'
import { errorMessage } from '@/shared/api/api-error'
import { applyApiFieldErrors } from '@/shared/lib/form-errors'
import { AccountIcon } from '@/shared/ui/AccountIcon'
import { useAuthAction } from '../hooks/use-auth-action'
import { accountPasswordSchema, type AccountPasswordValues } from '../model/account-password-schema'

const fields = [
  { name: 'currentPassword', label: 'Mật khẩu hiện tại', autoComplete: 'current-password' },
  { name: 'newPassword', label: 'Mật khẩu mới', autoComplete: 'new-password' },
  { name: 'confirmPassword', label: 'Xác nhận mật khẩu mới', autoComplete: 'new-password' },
] as const

export function AccountPasswordForm() {
  const mutation = useAuthAction('password')
  const { message } = App.useApp()
  const submitting = useRef(false)
  const [visible, setVisible] = useState<Partial<Record<keyof AccountPasswordValues, boolean>>>({})
  const form = useForm<AccountPasswordValues>({
    resolver: zodResolver(accountPasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })
  const submit = async ({ currentPassword, newPassword }: AccountPasswordValues) => {
    if (submitting.current) return
    submitting.current = true
    try {
      await mutation.mutateAsync({ currentPassword, newPassword })
      form.reset()
      void message.success('Đã đổi mật khẩu. Vui lòng đăng nhập lại.')
    } catch (error) {
      applyApiFieldErrors(error, form.setError, ['currentPassword', 'newPassword'])
    } finally {
      submitting.current = false
    }
  }
  return <form className="account-form account-password-form" onSubmit={event => void form.handleSubmit(submit)(event)} aria-labelledby="password-form-title" noValidate>
    <h2 id="password-form-title">Đổi mật khẩu</h2>
    {fields.map(({ name, label, autoComplete }) => {
      const error = form.formState.errors[name]
      const hint = name === 'newPassword' ? 'account-password-hint' : undefined
      return <div className="account-field" key={name}>
        <label htmlFor={`account-${name}`}>{label}</label>
        <Controller name={name} control={form.control} render={({ field }) => <Input {...field}
          id={`account-${name}`} type={visible[name] ? 'text' : 'password'} autoComplete={autoComplete} maxLength={128} required
          readOnly={mutation.isPending} status={error ? 'error' : undefined} aria-invalid={Boolean(error)}
          aria-describedby={[hint, error ? `account-${name}-error` : undefined].filter(Boolean).join(' ') || undefined}
          suffix={<button type="button" className="account-password-toggle" aria-label={`${visible[name] ? 'Ẩn' : 'Hiện'} ${label.toLowerCase()}`}
            aria-pressed={Boolean(visible[name])} onClick={() => setVisible(value => ({ ...value, [name]: !value[name] }))}><AccountIcon name="eye" /></button>} />} />
        {hint && <p id={hint}>Sử dụng từ 15 đến 128 ký tự.</p>}
        {error && <p className="account-field-error" id={`account-${name}-error`} role="alert">{error.message}</p>}
      </div>
    })}
    <p className="account-session-note"><AccountIcon name="lock-small" /><span>Sau khi đổi mật khẩu, bạn cần đăng nhập lại trên các thiết bị.</span></p>
    {mutation.isError && <Alert type="error" showIcon title={errorMessage(mutation.error)} />}
    <Button htmlType="submit" type="primary" loading={mutation.isPending}>Cập nhật mật khẩu</Button>
  </form>
}
