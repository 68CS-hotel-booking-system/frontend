import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, Button, Form, Input, Typography } from 'antd'
import { Controller, useForm } from 'react-hook-form'
import { errorMessage } from '@/shared/api/api-error'
import { applyApiFieldErrors } from '@/shared/lib/form-errors'
import { useProfileMutation } from '../hooks/use-profile'
import { profileRequestSchema, type CurrentUser, type UpdateProfileRequest } from '../api/auth-contracts'

export function ProfileForm({ user }: { user: CurrentUser }) {
  const mutation = useProfileMutation()
  const [saved, setSaved] = useState(false)
  const form = useForm<UpdateProfileRequest>({
    resolver: zodResolver(profileRequestSchema),
    defaultValues: { fullName: user.fullName, phone: user.phone ?? '', expectedVersion: user.version },
  })
  const submit = form.handleSubmit(async (values) => {
    setSaved(false)
    try {
      const result = await mutation.mutateAsync(values)
      form.reset({ fullName: result.fullName, phone: result.phone ?? '', expectedVersion: result.version })
      setSaved(true)
    } catch (error) {
      applyApiFieldErrors(error, form.setError, ['fullName', 'phone'])
    }
  })
  return <form onSubmit={submit} className="account-form">
    <Typography.Title level={2}>Thông tin cá nhân</Typography.Title>
    <Typography.Paragraph>Thông tin liên hệ dùng cho các lần đặt phòng tiếp theo.</Typography.Paragraph>
    <Typography.Paragraph>Mã tài khoản: <Typography.Text copyable className="account-member-id">{user.id}</Typography.Text></Typography.Paragraph>
    <Form.Item label="Email" htmlFor="profile-email" layout="vertical">
      <Input id="profile-email" value={user.email} readOnly />
    </Form.Item>
    <Form.Item label="Họ và tên" htmlFor="profile-name" layout="vertical" required
      validateStatus={form.formState.errors.fullName ? 'error' : ''} help={form.formState.errors.fullName?.message}>
      <Controller name="fullName" control={form.control} render={({ field }) =>
        <Input {...field} id="profile-name" autoComplete="name" maxLength={100} />} />
    </Form.Item>
    <Form.Item label="Số điện thoại" htmlFor="profile-phone" layout="vertical" required
      validateStatus={form.formState.errors.phone ? 'error' : ''} help={form.formState.errors.phone?.message}>
      <Controller name="phone" control={form.control} render={({ field }) =>
        <Input {...field} id="profile-phone" type="tel" autoComplete="tel" maxLength={30} />} />
    </Form.Item>
    {mutation.isError && <Alert type="error" showIcon title={errorMessage(mutation.error)} />}
    {saved && <Alert type="success" showIcon title="Đã lưu hồ sơ." />}
    <Button htmlType="submit" type="primary" loading={mutation.isPending} disabled={!form.formState.isDirty}>Lưu thay đổi</Button>
  </form>
}
