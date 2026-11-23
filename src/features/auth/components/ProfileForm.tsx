import { useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, Button, Input } from 'antd'
import { Controller, useForm } from 'react-hook-form'
import { ApiError, errorMessage } from '@/shared/api/api-error'
import { applyApiFieldErrors } from '@/shared/lib/form-errors'
import { acceptedImageTypes, imageUploadError } from '@/shared/lib/image-upload'
import { AccountIcon } from '@/shared/ui/AccountIcon'
import { useProfileMutation } from '../hooks/use-profile'
import { useCurrentUser } from '../hooks/use-current-user'
import { useUploadUserAvatar } from '../hooks/use-user-avatar'
import { UserAvatar } from './UserAvatar'
import { profileRequestSchema, type CurrentUser, type UpdateProfileRequest } from '../api/auth-contracts'
import '@/shared/styles/customer-profile.css'

const phoneCodes = [
  { value: '', label: 'Đầy đủ' },
  { value: '+84', label: '+84 VN' },
  { value: '+1', label: '+1 US' },
  { value: '+82', label: '+82 KR' },
  { value: '+81', label: '+81 JP' },
]

export function ProfileForm({ user }: { user: CurrentUser }) {
  const mutation = useProfileMutation()
  const currentUser = useCurrentUser()
  const avatarUpload = useUploadUserAvatar(user.id)
  const photoInput = useRef<HTMLInputElement>(null)
  const [photoError, setPhotoError] = useState<string>()
  const [saved, setSaved] = useState(false)
  const submitting = useRef(false)
  const form = useForm<UpdateProfileRequest>({
    resolver: zodResolver(profileRequestSchema),
    defaultValues: { fullName: user.fullName, phone: user.phone ?? '', expectedVersion: user.version },
  })
  const submit = async (values: UpdateProfileRequest) => {
    if (submitting.current) return
    if (phoneCodes.some(code => code.value === values.phone)) {
      form.setError('phone', { message: 'Nhập số điện thoại sau mã quốc gia.' }, { shouldFocus: true })
      return
    }
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
  const staleProfile = mutation.error instanceof ApiError && mutation.error.code === 'STALE_USER_VERSION'
  return <form onSubmit={event => void form.handleSubmit(submit)(event)} className="account-form account-profile-form" aria-labelledby="profile-form-title" noValidate>
    <section className="profile-card" aria-labelledby="profile-form-title">
      <h2 id="profile-form-title">Hồ sơ của bạn</h2>
      <div className="account-photo-row">
        <span className="account-avatar account-avatar--large" aria-hidden="true"><UserAvatar userId={user.id} name={user.fullName} /></span>
        <div className="account-photo-actions">
          <input ref={photoInput} type="file" accept={acceptedImageTypes} hidden onChange={event => {
            const file = event.currentTarget.files?.[0]
            event.currentTarget.value = ''
            if (!file || avatarUpload.isPending) return
            avatarUpload.reset()
            const error = imageUploadError(file)
            setPhotoError(error ?? undefined)
            if (!error) avatarUpload.mutate(file)
          }} />
          <span className="account-photo-button"><Button htmlType="button" loading={avatarUpload.isPending} aria-describedby="profile-photo-hint" icon={<AccountIcon name="upload" />} onClick={() => photoInput.current?.click()}>Đổi ảnh</Button></span>
          <p id="profile-photo-hint">JPG, PNG hoặc WebP, tối đa 5 MB.</p>
          {(photoError || avatarUpload.isError) && <p className="account-field-error" role="alert">{photoError || errorMessage(avatarUpload.error)}</p>}
          {avatarUpload.isSuccess && <p role="status">Đã cập nhật ảnh đại diện.</p>}
        </div>
      </div>
      <div className="account-field-grid profile-grid">
        <div className="account-field">
          <label htmlFor="profile-name">Họ và tên<span className="account-sr-only"> (bắt buộc)</span></label>
          <Controller name="fullName" control={form.control} render={({ field }) =>
            <Input {...field} id="profile-name" autoComplete="name" maxLength={100} required readOnly={mutation.isPending}
              status={errors.fullName ? 'error' : undefined} aria-invalid={Boolean(errors.fullName)} aria-describedby={errors.fullName ? 'profile-name-error' : undefined} />} />
          {errors.fullName && <p className="account-field-error" id="profile-name-error" role="alert">{errors.fullName.message}</p>}
        </div>
        <div className="account-field">
          <div className="profile-label-row"><label htmlFor="profile-email">Email</label>
            <span className={`profile-verified${user.emailVerified ? ' is-verified' : ''}`}>{user.emailVerified && <AccountIcon name="badge-check" />}{user.emailVerified ? 'Đã xác minh' : 'Chưa xác minh'}</span>
          </div>
          <Input id="profile-email" type="email" suffix={<AccountIcon name="lock-small" />} value={user.email} readOnly autoComplete="email" aria-describedby="profile-email-hint" />
          <p id="profile-email-hint">Email dùng để nhận xác nhận đặt phòng.</p>
        </div>
        <div className="account-field">
          <label htmlFor="profile-phone">Số điện thoại<span className="account-sr-only"> (bắt buộc)</span></label>
          <Controller name="phone" control={form.control} render={({ field }) => {
            const prefix = phoneCodes.find(code => code.value && field.value.startsWith(code.value))?.value ?? ''
            const number = field.value.slice(prefix.length)
            return <div className="profile-phone-row">
              <select className="profile-select" aria-label="Mã quốc gia" value={prefix} autoComplete="tel-country-code" disabled={mutation.isPending}
                onChange={event => {
                  const code = event.target.value
                  field.onChange(code && number.startsWith('+') ? code : code + number)
                }}>
                {phoneCodes.map(code => <option key={code.value} value={code.value}>{code.label}</option>)}
              </select>
              <Input {...field} id="profile-phone" type="tel" inputMode="tel" autoComplete={prefix ? 'tel-national' : 'tel'}
                value={number} maxLength={30 - prefix.length} onChange={event => {
                  const value = event.target.value
                  field.onChange(value.startsWith('+') ? value : prefix + value)
                }} placeholder="Thêm số điện thoại" required readOnly={mutation.isPending}
                status={errors.phone ? 'error' : undefined} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? 'profile-phone-error' : 'profile-phone-hint'} />
            </div>
          }} />
          <p id="profile-phone-hint">Dùng để chủ nhà liên hệ khi nhận phòng.</p>
          {errors.phone && <p className="account-field-error" id="profile-phone-error" role="alert">{errors.phone.message}</p>}
        </div>
      </div>
      <p className="account-privacy-note"><AccountIcon name="lock-small" />Bạn có thể cập nhật ảnh đại diện, họ tên và số điện thoại.</p>
    </section>
    {mutation.isError && <Alert type="error" showIcon title={errorMessage(mutation.error)}
      action={staleProfile && <Button loading={currentUser.isFetching} onClick={() => {
        void currentUser.refetch().then(result => {
          if (!result.isSuccess) return
          form.reset({ fullName: result.data.fullName, phone: result.data.phone ?? '', expectedVersion: result.data.version })
          mutation.reset()
          setSaved(false)
        })
      }}>Tải lại hồ sơ</Button>} />}
    {saved && !form.formState.isDirty && <Alert type="success" showIcon title="Đã lưu hồ sơ." role="status" />}
    <div className="account-form-actions">
      <div className="profile-actions-left">
        <Button htmlType="button" type="text" disabled={mutation.isPending} onClick={() => {
          form.reset({ fullName: user.fullName, phone: user.phone ?? '', expectedVersion: user.version })
          mutation.reset()
          setSaved(false)
        }}>Hủy</Button>
        <span className="profile-save-status">{mutation.isPending ? 'Đang lưu…' : form.formState.isDirty ? 'Có thay đổi chưa lưu' : saved ? 'Đã lưu' : 'Chưa có thay đổi'}</span>
      </div>
      <Button htmlType="submit" type="primary" loading={mutation.isPending} disabled={!form.formState.isDirty}>Lưu thay đổi</Button>
    </div>
  </form>
}
