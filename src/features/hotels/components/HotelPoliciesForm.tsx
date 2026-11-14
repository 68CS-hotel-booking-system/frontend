import { useEffect } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, App, Button, TimePicker } from 'antd'
import dayjs from 'dayjs'
import { Controller, useForm } from 'react-hook-form'
import { applyApiFieldErrors } from '@/shared/lib/form-errors'
import { errorMessage } from '@/shared/api/api-error'
import { buildHotelPatch } from '../model/hotel-update'
import type { ManagementHotelDetail } from '../model/hotel'
import { useUpdateManagementHotelMutation } from '../hooks/use-update-hotel-mutation'

const schema = z.object({ checkInTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Nhập giờ HH:mm.'), checkOutTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Nhập giờ HH:mm.') })
export function HotelPoliciesForm({ hotel }: { hotel: ManagementHotelDetail }) {
  const { message } = App.useApp()
  const mutation = useUpdateManagementHotelMutation(hotel.id)
  const { control, reset, handleSubmit, setError, formState: { errors, isDirty } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { checkInTime: hotel.checkInTime.slice(0, 5), checkOutTime: hotel.checkOutTime.slice(0, 5) } })
  useEffect(() => { reset({ checkInTime: hotel.checkInTime.slice(0, 5), checkOutTime: hotel.checkOutTime.slice(0, 5) }) }, [hotel.checkInTime, hotel.checkOutTime, reset])
  return <div className="surface-card space-y-5">
    <form className="space-y-4" onSubmit={handleSubmit(async (values) => {
      if (mutation.isPending) return
      try { await mutation.mutateAsync(buildHotelPatch(hotel, values)); reset(values); void message.success('Đã lưu giờ nhận/trả phòng.') }
      catch (error) { applyApiFieldErrors(error, setError); setError('root', { message: errorMessage(error) }) }
    })}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label>Giờ nhận phòng tiêu chuẩn<Controller name="checkInTime" control={control} render={({ field }) => <TimePicker className="w-full" value={field.value ? dayjs(`2000-01-01T${field.value}`) : null} onBlur={field.onBlur} onChange={(value) => field.onChange(value?.format('HH:mm') ?? '')} format="HH:mm" allowClear={false} showNow={false} needConfirm={false} disabled={mutation.isPending} aria-label="Giờ nhận phòng tiêu chuẩn" />} />{errors.checkInTime && <span role="alert">{errors.checkInTime.message}</span>}</label>
        <label>Giờ trả phòng tiêu chuẩn<Controller name="checkOutTime" control={control} render={({ field }) => <TimePicker className="w-full" value={field.value ? dayjs(`2000-01-01T${field.value}`) : null} onBlur={field.onBlur} onChange={(value) => field.onChange(value?.format('HH:mm') ?? '')} format="HH:mm" allowClear={false} showNow={false} needConfirm={false} disabled={mutation.isPending} aria-label="Giờ trả phòng tiêu chuẩn" />} />{errors.checkOutTime && <span role="alert">{errors.checkOutTime.message}</span>}</label>
      </div>
      {errors.root && <p role="alert">{errors.root.message}</p>}
      <Button type="primary" htmlType="submit" disabled={!isDirty} loading={mutation.isPending}>Lưu giờ nhận/trả phòng</Button>
    </form>
    <Alert type="info" showIcon title="Các chính sách khác chưa khả dụng" description="Bạn có thể cập nhật giờ nhận và trả phòng tại đây. Chính sách hủy, trẻ em và ghi chú lưu trú chưa thể chỉnh sửa trong màn hình này." />
  </div>
}
