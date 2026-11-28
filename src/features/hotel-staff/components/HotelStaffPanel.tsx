import { useState } from 'react'
import {
  Alert,
  Button,
  Empty,
  Form,
  Input,
  Modal,
  Pagination,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { ApiError, errorMessage } from '@/shared/api/api-error'
import { applyApiFieldErrors } from '@/shared/lib/form-errors'
import { ErrorState } from '@/shared/ui/ErrorState'
import { useHotelStaff } from '../hooks/use-hotel-staff'
import {
  addMemberSchema,
  type AddMemberPayload,
  type Member,
  type StaffHotel,
} from '../api/staff-api'

function formatDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

export function HotelStaffPanel({ hotel }: { hotel: StaffHotel }) {
  const [page, setPage] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [notice, setNotice] = useState<{ type: 'success' | 'warning' | 'error'; text: string } | null>(null)
  const { query, addMutation, statusMutation } = useHotelStaff(hotel.id, page)

  async function handleToggleStatus(member: Member) {
    setNotice(null)
    const nextStatus = member.status === 'ACTIVE' ? 'REVOKED' : 'ACTIVE'
    try {
      await statusMutation.mutateAsync({
        memberId: member.id,
        status: nextStatus,
        expectedVersion: member.version,
      })
      setNotice({
        type: 'success',
        text:
          nextStatus === 'REVOKED'
            ? 'Đã thu hồi phân công nhân sự.'
            : 'Đã kích hoạt lại phân công nhân sự.',
      })
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setNotice({
          type: 'warning',
          text: `${errorMessage(error)} Danh sách đã được tải lại.`,
        })
        void query.refetch()
      } else {
        setNotice({ type: 'error', text: errorMessage(error) })
      }
    }
  }

  return (
    <section aria-label={'Nhân sự ' + hotel.name} className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Typography.Title level={3} style={{ margin: 0 }}>
            {hotel.name}
          </Typography.Title>
          <p className="muted mt-1 mb-0">
            Chủ khách sạn phân công quản lý và lễ tân. Quản lý khách sạn chỉ phân công lễ tân.
            Nhân sự đăng nhập tại cổng quản trị bằng tài khoản đã xác minh email.
          </p>
        </div>
        <Button
          type="primary"
          onClick={() => {
            setNotice(null)
            addMutation.reset()
            setModalOpen(true)
          }}
        >
          Thêm nhân sự
        </Button>
      </div>

      {notice && (
        <Alert
          type={notice.type}
          showIcon
          closable
          onClose={() => setNotice(null)}
          title={notice.text}
        />
      )}

      {query.isError ? (
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
      ) : (
        <div className="account-table">
          <Table<Member>
            rowKey="id"
            loading={query.isPending}
            dataSource={query.data?.content ?? []}
            scroll={{ x: 680 }}
            pagination={false}
            locale={{
              emptyText: <Empty description="Khách sạn chưa có nhân sự được phân công." />,
            }}
            columns={[
              {
                title: 'Nhân sự',
                key: 'staff',
                render: (_, member) => (
                  <div>
                    <div className="font-medium text-[#12211d]">
                      {member.fullName || 'Chưa cập nhật tên'}
                    </div>
                    <div className="text-xs text-[#5f736e]">{member.email}</div>
                  </div>
                ),
              },
              {
                title: 'Vai trò',
                dataIndex: 'memberRole',
                render: (role: Member['memberRole']) =>
                  role === 'HOTEL_MANAGER' ? 'Quản lý khách sạn' : 'Lễ tân',
              },
              {
                title: 'Trạng thái',
                dataIndex: 'status',
                render: (status: Member['status']) => (
                  <Tag color={status === 'ACTIVE' ? 'green' : 'default'}>
                    {status === 'ACTIVE' ? 'Đang làm việc' : 'Đã thu hồi'}
                  </Tag>
                ),
              },
              {
                title: 'Ngày phân công',
                dataIndex: 'assignedAt',
                render: (assignedAt: string) => formatDateTime(assignedAt),
              },
              {
                title: 'Thao tác',
                key: 'actions',
                render: (_, member) => {
                  const locked = !hotel.canAssignManager && member.memberRole === 'HOTEL_MANAGER'
                  const isRevoking = member.status === 'ACTIVE'
                  return (
                    <Popconfirm
                      title={
                        isRevoking
                          ? 'Thu hồi quyền nhân sự này?'
                          : 'Kích hoạt lại phân công nhân sự này?'
                      }
                      description={
                        isRevoking
                          ? 'Nhân sự sẽ mất quyền truy cập vận hành của khách sạn ngay lập tức.'
                          : 'Nhân sự sẽ có lại quyền vận hành với vai trò hiện tại.'
                      }
                      okText={isRevoking ? 'Thu hồi' : 'Kích hoạt lại'}
                      cancelText="Hủy"
                      disabled={locked || statusMutation.isPending}
                      onConfirm={() => void handleToggleStatus(member)}
                    >
                      <Button
                        danger={isRevoking}
                        disabled={locked}
                        loading={statusMutation.isPending}
                      >
                        {isRevoking ? 'Thu hồi' : 'Kích hoạt lại'}
                      </Button>
                    </Popconfirm>
                  )
                },
              },
            ]}
          />
        </div>
      )}

      {query.data && query.data.totalElements > 20 && (
        <Pagination
          current={page + 1}
          pageSize={20}
          total={query.data.totalElements}
          showSizeChanger={false}
          onChange={(next) => setPage(next - 1)}
        />
      )}

      {modalOpen && (
        <AddMemberModal
          hotel={hotel}
          pending={addMutation.isPending}
          error={addMutation.error}
          onClose={() => setModalOpen(false)}
          onSubmit={async (values) => {
            await addMutation.mutateAsync(values)
            setModalOpen(false)
            setNotice({ type: 'success', text: 'Đã phân công nhân sự thành công.' })
          }}
        />
      )}
    </section>
  )
}

function AddMemberModal({
  hotel,
  pending,
  error,
  onClose,
  onSubmit,
}: {
  hotel: StaffHotel
  pending: boolean
  error: unknown
  onClose: () => void
  onSubmit: (value: AddMemberPayload) => Promise<void>
}) {
  const form = useForm<AddMemberPayload>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: {
      email: '',
      memberRole: 'RECEPTIONIST',
    },
  })

  return (
    <Modal
      open
      title="Thêm nhân sự"
      footer={null}
      onCancel={onClose}
      closable={!pending}
      mask={{ closable: !pending }}
    >
      <form
        onSubmit={form.handleSubmit(async (values) => {
          try {
            await onSubmit(values)
          } catch (problem) {
            applyApiFieldErrors(problem, form.setError, ['email', 'memberRole'])
          }
        })}
      >
        <p className="muted mb-4">
          Nhập email của tài khoản đang hoạt động và đã xác minh email trên hệ thống StayHub.
        </p>

        <Form.Item
          label="Email tài khoản"
          htmlFor="staff-email"
          layout="vertical"
          required
          validateStatus={form.formState.errors.email ? 'error' : ''}
          help={form.formState.errors.email?.message}
        >
          <Controller
            name="email"
            control={form.control}
            render={({ field }) => (
              <Input
                {...field}
                id="staff-email"
                type="email"
                placeholder="nhanvien@example.com"
                disabled={pending}
              />
            )}
          />
        </Form.Item>

        <Form.Item label="Vai trò tại khách sạn" htmlFor="staff-role" layout="vertical">
          <Controller
            name="memberRole"
            control={form.control}
            render={({ field }) => (
              <Select
                {...field}
                id="staff-role"
                disabled={pending}
                options={[
                  { value: 'RECEPTIONIST', label: 'Lễ tân' },
                  ...(hotel.canAssignManager
                    ? [{ value: 'HOTEL_MANAGER', label: 'Quản lý khách sạn' }]
                    : []),
                ]}
              />
            )}
          />
        </Form.Item>

        {error ? (
          <Alert type="error" showIcon title={errorMessage(error)} style={{ marginBottom: 16 }} />
        ) : null}

        <Space>
          <Button onClick={onClose} disabled={pending}>
            Hủy
          </Button>
          <Button type="primary" htmlType="submit" loading={pending}>
            Thêm nhân sự
          </Button>
        </Space>
      </form>
    </Modal>
  )
}
