import { useState } from 'react'
import { Alert, Button, Empty, Form, Input, Modal, Pagination, Select, Space, Table, Tag, Typography } from 'antd'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { errorMessage } from '@/shared/api/api-error'
import { applyApiFieldErrors } from '@/shared/lib/form-errors'
import { ErrorState } from '@/shared/ui/ErrorState'
import { useHotelStaff } from '../hooks/use-hotel-staff'
import { assignmentSchema, type Assignment, type Member, type StaffHotel } from '../api/staff-api'

export function HotelStaffPanel({ hotel }: { hotel: StaffHotel }) {
  const [page, setPage] = useState(0)
  const [editing, setEditing] = useState<Member | 'new' | null>(null)
  const [saved, setSaved] = useState(false)
  const { query, mutation } = useHotelStaff(hotel.id, page)
  return <section aria-label={'Nhân sự ' + hotel.name}>
    <Space wrap style={{ marginBottom: 20 }}>
      <Typography.Title level={2} style={{ margin: 0 }}>{hotel.name}</Typography.Title>
      <Button type="primary" onClick={() => { setSaved(false); setEditing('new') }}>Thêm nhân sự</Button>
    </Space>
    <p>Quản trị viên phân công quản lý. Chủ khách sạn và quản lý được phân công lễ tân trong khách sạn của mình.</p>
    <p className="account-table-hint">Vuốt ngang bảng để xem trạng thái và sửa phân công.</p>
    {saved && <Alert type="success" showIcon title="Đã cập nhật phân công nhân sự." style={{ marginBottom: 16 }} />}
    {query.isError ? <ErrorState error={query.error} onRetry={() => void query.refetch()} /> :
      <div className="account-table"><Table<Member> rowKey={(member) => member.userId + member.memberRole} loading={query.isPending}
        dataSource={query.data?.content ?? []} scroll={{ x: 580 }} pagination={false}
        locale={{ emptyText: <Empty description="Khách sạn chưa có nhân sự được phân công." /> }}
        columns={[
          { title: 'Mã tài khoản', dataIndex: 'userId', render: (id: string) => <Typography.Text className="account-member-id" copyable>{id}</Typography.Text> },
          { title: 'Vai trò', dataIndex: 'memberRole', render: (role: string) => role === 'HOTEL_MANAGER' ? 'Quản lý' : 'Lễ tân' },
          { title: 'Trạng thái', dataIndex: 'status', render: (status: string) => <Tag color={status === 'ACTIVE' ? 'green' : 'default'}>{status === 'ACTIVE' ? 'Đang làm việc' : 'Đã thu hồi'}</Tag> },
          { title: 'Thao tác', render: (_, member) => <Button disabled={!hotel.canAssignManager && member.memberRole === 'HOTEL_MANAGER'}
            onClick={() => { setSaved(false); setEditing(member) }}>Sửa phân công</Button> },
        ]} /></div>}
    {query.data && <Pagination current={page + 1} pageSize={20} total={query.data.totalElements}
      showSizeChanger={false} onChange={(next) => setPage(next - 1)} style={{ marginTop: 20 }} />}
    {editing && <AssignmentForm key={typeof editing === 'string' ? editing : editing.userId}
      hotel={hotel} member={editing === 'new' ? undefined : editing}
      pending={mutation.isPending} error={mutation.error} onClose={() => setEditing(null)}
      onSubmit={async (value) => { await mutation.mutateAsync(value); setEditing(null); setSaved(true) }} />}
  </section>
}
function AssignmentForm({ hotel, member, pending, error, onClose, onSubmit }: {
  hotel: StaffHotel; member?: Member; pending: boolean; error: unknown;
  onClose: () => void; onSubmit: (value: Assignment) => Promise<void>;
}) {
  const form = useForm<Assignment>({
    resolver: zodResolver(assignmentSchema), defaultValues: {
      userId: member?.userId ?? '', memberRole: member?.memberRole ?? 'RECEPTIONIST',
      status: member?.status ?? 'ACTIVE', expectedVersion: member?.version ?? null,
    },
  })
  return <Modal open title={member ? 'Sửa phân công' : 'Thêm nhân sự'} footer={null}
    onCancel={onClose} closable={!pending} mask={{ closable: !pending }}>
    <form onSubmit={form.handleSubmit(async (values) => {
      try { await onSubmit(values) } catch (problem) { applyApiFieldErrors(problem, form.setError, ['userId','memberRole','status']) }
    })}>
      <p>Chọn tài khoản đã xác minh email. Mã tài khoản có trong hồ sơ cá nhân hoặc danh sách quản trị.</p>
      <Form.Item label="Mã tài khoản" htmlFor="staff-user" layout="vertical" required
        validateStatus={form.formState.errors.userId ? 'error' : ''} help={form.formState.errors.userId?.message}>
        <Controller name="userId" control={form.control} render={({ field }) => <Input {...field} id="staff-user" readOnly={Boolean(member)} />} />
      </Form.Item>
      <Form.Item label="Vai trò tại khách sạn" htmlFor="staff-role" layout="vertical">
        <Controller name="memberRole" control={form.control} render={({ field }) =>
          <Select {...field} id="staff-role" disabled={Boolean(member)} options={[
            { value: 'RECEPTIONIST', label: 'Lễ tân' },
            ...(hotel.canAssignManager ? [{ value: 'HOTEL_MANAGER', label: 'Quản lý khách sạn' }] : []),
          ]} />} />
      </Form.Item>
      <Form.Item label="Trạng thái phân công" htmlFor="staff-status" layout="vertical">
        <Controller name="status" control={form.control} render={({ field }) =>
          <Select {...field} id="staff-status" options={[{ value: 'ACTIVE', label: 'Đang làm việc' }, { value: 'REVOKED', label: 'Thu hồi phân công' }]} />} />
      </Form.Item>
      {error ? <Alert type="error" showIcon title={errorMessage(error)} style={{ marginBottom: 16 }} /> : null}
      <Space><Button onClick={onClose} disabled={pending}>Hủy</Button><Button type="primary" htmlType="submit" loading={pending}>Lưu phân công</Button></Space>
    </form>
  </Modal>
}
