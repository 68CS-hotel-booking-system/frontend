import { useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, Button, Input, Tooltip } from 'antd'
import { Controller, useForm } from 'react-hook-form'
import { errorMessage } from '@/shared/api/api-error'
import { applyApiFieldErrors } from '@/shared/lib/form-errors'
import { AccountIcon } from '@/shared/ui/AccountIcon'
import { useProfileMutation } from '../hooks/use-profile'
import { profileRequestSchema, type CurrentUser, type UpdateProfileRequest } from '../api/auth-contracts'

export function ProfileForm({ user }: { user: CurrentUser }) {
  const mutation = useProfileMutation()
  const [saved, setSaved] = useState(false)
  const submitting = useRef(false)
  const form = useForm<UpdateProfileRequest>({
    resolver: zodResolver(profileRequestSchema),
    defaultValues: { fullName: user.fullName, phone: user.phone ?? '', expectedVersion: user.version },
  })
  const submit = async (values: UpdateProfileRequest) => {
    if (submitting.current) return
    submitting.current = true
    setSaved(false)
    try {
      const result = await mutation.mutateAsync(values)
      form.reset({ fullName: result.fullName, phone: result.phone ?? '', expectedVersion: result.version })
      setSaved(true)
    } catch (error) {
      applyApiFieldErrors(error, form.setError, ['fullName', 'phone'])
    } finally {
      submitting.current = false
    }
  }
  const errors = form.formState.errors
  return <form onSubmit={event => void form.handleSubmit(submit)(event)} className="account-form account-profile-form" aria-labelledby="profile-form-title" noValidate>
    <h2 id="profile-form-title">Hồ sơ của bạn</h2>
    <div className="account-photo-row">
      <span className="account-avatar account-avatar--large" aria-hidden="true">{user.fullName.trim().charAt(0).toUpperCase() || 'N'}</span>
      <div className="account-photo-actions">
        <Tooltip title="Tính năng đổi ảnh chưa khả dụng."><span className="account-photo-button"><Button htmlType="button" disabled aria-describedby="profile-photo-unavailable">Đổi ảnh</Button></span></Tooltip>
        <p>JPG hoặc PNG. Tối đa 5 MB.</p>
        <span id="profile-photo-unavailable" className="account-sr-only">Tính năng đổi ảnh chưa khả dụng.</span>
      </div>
    </div>
    <hr />
    <div className="account-field">
      <label htmlFor="profile-name">Họ và tên<span className="account-sr-only"> (bắt buộc)</span></label>
      <Controller name="fullName" control={form.control} render={({ field }) =>
        <Input {...field} id="profile-name" autoComplete="name" maxLength={100} required readOnly={mutation.isPending}
          status={errors.fullName ? 'error' : undefined} aria-invalid={Boolean(errors.fullName)} aria-describedby={errors.fullName ? 'profile-name-error' : undefined} />} />
      {errors.fullName && <p className="account-field-error" id="profile-name-error" role="alert">{errors.fullName.message}</p>}
    </div>
    <div className="account-field-grid">
      <div className="account-field">
        <label htmlFor="profile-email">Email</label>
        <Input id="profile-email" value={user.email} readOnly autoComplete="email" aria-describedby="profile-email-hint" />
        <p id="profile-email-hint">Email dùng để nhận xác nhận đặt phòng.</p>
      </div>
      <div className="account-field">
        <label htmlFor="profile-phone">Số điện thoại<span className="account-sr-only"> (bắt buộc)</span></label>
        <Controller name="phone" control={form.control} render={({ field }) =>
          <Input {...field} id="profile-phone" type="tel" autoComplete="tel" maxLength={30} placeholder="Thêm số điện thoại" required readOnly={mutation.isPending}
            status={errors.phone ? 'error' : undefined} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? 'profile-phone-error' : undefined} />} />
        {errors.phone && <p className="account-field-error" id="profile-phone-error" role="alert">{errors.phone.message}</p>}
      </div>
    </div>
    <div className="account-field-grid" title="Tính năng này chưa khả dụng.">
      <div className="account-field">
        <label htmlFor="profile-birth-date">Ngày sinh</label>
        <Input id="profile-birth-date" placeholder="dd/mm/yyyy" disabled suffix={<AccountIcon name="calendar" />} aria-describedby="profile-details-unavailable" />
      </div>
      <div className="account-field">
        <label htmlFor="profile-gender">Giới tính</label>
        <Input id="profile-gender" placeholder="Chọn giới tính" disabled suffix={<AccountIcon name="down" />} aria-describedby="profile-details-unavailable" />
      </div>
      <span id="profile-details-unavailable" className="account-sr-only">Ngày sinh và giới tính chưa khả dụng.</span>
    </div>
    <p className="account-privacy-note"><AccountIcon name="lock-small" />Thông tin của bạn được bảo mật.</p>
    {mutation.isError && <Alert type="error" showIcon title={errorMessage(mutation.error)} />}
    {saved && !form.formState.isDirty && <Alert type="success" showIcon title="Đã lưu hồ sơ." role="status" />}
    <hr />
    <div className="account-form-actions">
      <Button htmlType="button" type="text" disabled={mutation.isPending} onClick={() => {
        form.reset({ fullName: user.fullName, phone: user.phone ?? '', expectedVersion: user.version })
        mutation.reset()
        setSaved(false)
      }}>Hủy</Button>
      <Button htmlType="submit" type="primary" loading={mutation.isPending} disabled={!form.formState.isDirty}>Lưu thay đổi</Button>
    </div>
  </form>
}
