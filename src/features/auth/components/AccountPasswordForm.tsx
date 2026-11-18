import { useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, App, Button, Input } from 'antd'
import { Controller, useForm, useWatch } from 'react-hook-form'
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

const passwordTips = [
  { label: 'Ít nhất 15 ký tự', meets: (value: string) => value.length >= 15 },
  { label: 'Có chữ hoa và chữ thường', meets: (value: string) => /\p{Lu}/u.test(value) && /\p{Ll}/u.test(value) },
  { label: 'Có ít nhất một chữ số', meets: (value: string) => /\p{Nd}/u.test(value) },
  { label: 'Có ký tự đặc biệt (! @ # $…)', meets: (value: string) => /[\p{P}\p{S}]/u.test(value) },
]

export function AccountPasswordForm() {
  const mutation = useAuthAction('password')
  const { message } = App.useApp()
  const submitting = useRef(false)
  const [visible, setVisible] = useState<Partial<Record<keyof AccountPasswordValues, boolean>>>({})
  const form = useForm<AccountPasswordValues>({
    resolver: zodResolver(accountPasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })
  const newPassword = useWatch({ control: form.control, name: 'newPassword' })
  const score = passwordTips.filter(tip => tip.meets(newPassword)).length
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
  return <form className="account-form account-password-form security-card" onSubmit={event => void form.handleSubmit(submit)(event)} aria-labelledby="password-form-title" noValidate>
    <h2 id="password-form-title">Mật khẩu</h2>
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
            onClick={() => setVisible(value => ({ ...value, [name]: !value[name] }))}><AccountIcon name={visible[name] ? 'eye-off' : 'eye'} /></button>} />} />
        {hint && <>
          <div className="security-meter" data-score={score} aria-hidden="true">
            {passwordTips.map(tip => <span key={tip.label} />)}
          </div>
          <p id={hint}>{newPassword ? `Đạt ${score}/4 gợi ý. Mật khẩu cần từ 15 đến 128 ký tự.` : 'Nhập mật khẩu mới để xem độ mạnh. Mật khẩu cần từ 15 đến 128 ký tự.'}</p>
          <ul className="security-password-tips">
            {passwordTips.map(tip => <li key={tip.label} data-met={tip.meets(newPassword)}>
              <AccountIcon name="check" /><span>{tip.label}</span>
            </li>)}
          </ul>
        </>}
        {error && <p className="account-field-error" id={`account-${name}-error`} role="alert">{error.message}</p>}
      </div>
    })}
    {mutation.isError && <Alert type="error" showIcon title={errorMessage(mutation.error)} />}
    <div className="security-actions">
      <Button htmlType="submit" type="primary" loading={mutation.isPending} disabled={!form.formState.isDirty}>Cập nhật mật khẩu</Button>
      <p>Sau khi đổi mật khẩu, bạn cần đăng nhập lại trên các thiết bị.</p>
    </div>
  </form>
}
