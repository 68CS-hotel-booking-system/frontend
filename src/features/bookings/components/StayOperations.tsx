import { useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { Alert, App, Button, Form, Input, Pagination, Popconfirm, Select, Space } from 'antd'
import { useManagementRoomsQuery } from '@/features/rooms'
import { errorMessage } from '@/shared/api/api-error'
import { assignBookingRooms, operateBooking, type BookingDetail, type StayOperation } from '../api/booking-api'
import { useBookingAction } from '../hooks/use-bookings'

const operationSchema = z.object({ reason: z.string().trim().max(500), expectedArrivalAt: z.string() })
export function StayOperations({ booking, hotelId }: { booking: BookingDetail; hotelId: string }) {
  const { message } = App.useApp()
  const { control, handleSubmit, setError, formState: { errors } } = useForm({ resolver: zodResolver(operationSchema), defaultValues: { reason: '', expectedArrivalAt: '' } })
  const mutation = useBookingAction((value: { operation: StayOperation; reason?: string; expectedArrivalAt?: string }) =>
    operateBooking(hotelId, booking.id, value.operation, value.operation === 'late-arrival' ? { expectedArrivalAt: value.expectedArrivalAt, note: value.reason } : value.operation === 'no-show' ? { reason: value.reason } : undefined))
  function run(operation: StayOperation) {
    void handleSubmit((values) => {
      if (operation === 'late-arrival' && !Number.isFinite(Date.parse(values.expectedArrivalAt))) { setError('expectedArrivalAt', { message: 'Chọn thời gian khách dự kiến đến.' }); return }
      mutation.mutate({ operation, reason: values.reason || undefined,
        expectedArrivalAt: values.expectedArrivalAt ? new Date(values.expectedArrivalAt).toISOString() : undefined },
      { onSuccess: () => { void message.success('Đã cập nhật vận hành đơn đặt phòng.') } })
    })()
  }
  return <section>
    <h3>Vận hành lưu trú</h3>
    <Space wrap>
      <Popconfirm title="Xác nhận khách nhận phòng?" onConfirm={() => run('check-in')}><Button disabled={booking.status !== 'CONFIRMED' || mutation.isPending}>Nhận phòng</Button></Popconfirm>
      <Popconfirm title="Xác nhận khách trả phòng?" description="Trạng thái phòng sẽ chuyển sang cần dọn." onConfirm={() => run('check-out')}><Button disabled={booking.status !== 'CHECKED_IN' || mutation.isPending}>Trả phòng</Button></Popconfirm>
      <Popconfirm title="Đánh dấu khách không đến?" onConfirm={() => run('no-show')}><Button danger disabled={booking.status !== 'CONFIRMED' || mutation.isPending}>Khách không đến</Button></Popconfirm>
    </Space>
    <Form layout="vertical" disabled={mutation.isPending} style={{ marginTop: 20 }}>
      <Form.Item label="Lý do / ghi chú" htmlFor="stay-operation-note" validateStatus={errors.reason ? 'error' : undefined} help={errors.reason?.message}>
        <Controller name="reason" control={control} render={({ field }) => <Input.TextArea {...field} id="stay-operation-note" maxLength={500} />} />
      </Form.Item>
      <Form.Item label="Thời gian khách dự kiến đến muộn" htmlFor="late-arrival" validateStatus={errors.expectedArrivalAt ? 'error' : undefined} help={errors.expectedArrivalAt?.message}>
        <Controller name="expectedArrivalAt" control={control} render={({ field }) => <Input {...field} id="late-arrival" type="datetime-local" />} />
      </Form.Item>
      <Button disabled={booking.status !== 'CONFIRMED' || mutation.isPending} onClick={() => run('late-arrival')}>Ghi nhận đến muộn</Button>
    </Form>
    {mutation.isError && <Alert type="error" showIcon title="Không thể cập nhật lưu trú" description={errorMessage(mutation.error)} />}
    <RoomAssignments booking={booking} hotelId={hotelId} />
  </section>
}
function RoomAssignments({ booking, hotelId }: { booking: BookingDetail; hotelId: string }) {
  const schema = z.object({ reason: z.string().trim().max(255), assignments: z.array(z.object({ bookingItemId: z.uuid(), roomIds: z.array(z.guid()) })) })
    .superRefine((values, ctx) => {
      const ids = values.assignments.flatMap((item) => item.roomIds)
      if (new Set(ids).size !== ids.length) ctx.addIssue({ code: 'custom', path: ['reason'], message: 'Một phòng vật lý chỉ được gán một lần trong đơn.' })
      values.assignments.forEach((item, index) => { if (item.roomIds.length !== booking.items[index].quantity) ctx.addIssue({ code: 'custom', path: ['assignments', index, 'roomIds'], message: `Chọn đúng ${booking.items[index].quantity} phòng.` }) })
    })
  const { control, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: {
    reason: '', assignments: booking.items.map((item) => ({ bookingItemId: item.id, roomIds: [] as string[] })),
  } })
  const mutation = useBookingAction((values: z.infer<typeof schema>) => assignBookingRooms(hotelId, booking.id, values.assignments, values.reason || undefined))
  return <Form layout="vertical" component="form" noValidate style={{ marginTop: 28 }} onSubmitCapture={handleSubmit((values) => mutation.mutate(values))} disabled={mutation.isPending}>
    <h3>Phân công / đổi phòng vật lý</h3>
    <p className="muted">Chọn đủ phòng cho mỗi hạng. Hệ thống kiểm tra phòng đang sử dụng và xung đột lịch trước khi lưu. Khi đổi phòng, nhập lý do.</p>
    {booking.items.map((item, index) => <Form.Item key={item.id} label={`${item.roomTypeName} — ${item.quantity} phòng`} validateStatus={errors.assignments?.[index]?.roomIds ? 'error' : undefined} help={errors.assignments?.[index]?.roomIds?.message}>
      <Controller name={`assignments.${index}.roomIds`} control={control} render={({ field }) => <RoomPicker hotelId={hotelId} roomTypeId={item.roomTypeId} value={field.value} onChange={field.onChange} />} />
    </Form.Item>)}
    <Form.Item label="Lý do đổi phòng" htmlFor="room-change-reason" validateStatus={errors.reason ? 'error' : undefined} help={errors.reason?.message}>
      <Controller name="reason" control={control} render={({ field }) => <Input {...field} id="room-change-reason" maxLength={255} />} />
    </Form.Item>
    <Button type="primary" htmlType="submit" loading={mutation.isPending} disabled={!['CONFIRMED', 'CHECKED_IN'].includes(booking.status)}>Lưu phân công phòng</Button>
    {mutation.isSuccess && <Alert type="success" title="Đã lưu phân công phòng." />}
    {mutation.isError && <Alert type="error" title="Không thể phân công phòng" description={errorMessage(mutation.error)} />}
  </Form>
}
function RoomPicker({ hotelId, roomTypeId, value, onChange }: { hotelId: string; roomTypeId: string; value: string[]; onChange: (value: string[]) => void }) {
  const [page, setPage] = useState(0)
  const query = useManagementRoomsQuery(hotelId, { roomTypeId, page, size: 50 })
  return <Space orientation="vertical" style={{ width: '100%' }}>
    <Select aria-label="Chọn phòng vật lý" mode="multiple" value={value} onChange={onChange} loading={query.isFetching} style={{ width: '100%' }}
      options={query.data?.items.map((room) => ({ value: room.id, label: `${room.roomNumber} · ${room.readiness === 'ready' ? 'Sẵn sàng' : 'Cần dọn'}` }))} />
    {query.data && query.data.totalItems > 50 && <Pagination size="small" current={page + 1} pageSize={50} total={query.data.totalItems} onChange={(next) => setPage(next - 1)} showSizeChanger={false} />}
    {query.isError && <Alert type="error" title={errorMessage(query.error)} action={<Button onClick={() => void query.refetch()}>Thử lại</Button>} />}
  </Space>
}
