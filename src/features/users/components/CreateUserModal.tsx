import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Form, Input, Modal, Select } from 'antd'
import { useId } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { type CreateUserFormValues, createUserSchema } from '../model/create-user-form-schema'

interface CreateUserModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (values: CreateUserFormValues) => Promise<boolean>
}

function CreateUserForm({
  onClose,
  onSubmit,
}: {
  onClose: () => void
  onSubmit: (values: CreateUserFormValues) => Promise<boolean>
}) {
  const id = useId()
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      role: 'CUSTOMER',
    },
  })

  const handleFormSubmit = async (data: CreateUserFormValues) => {
    if (await onSubmit(data)) onClose()
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} style={{ marginTop: '16px' }}>
      <Form.Item
        label="Họ và tên"
        htmlFor={id + '-name'}
        validateStatus={errors.fullName ? 'error' : ''}
        help={errors.fullName?.message}
        required
        layout="vertical"
      >
        <Controller
          name="fullName"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id={id + '-name'}
              autoComplete="name"
              placeholder="Ví dụ: Nguyễn Văn An"
              style={{ borderRadius: '8px', height: '38px' }}
            />
          )}
        />
      </Form.Item>

      <Form.Item
        label="Địa chỉ email"
        htmlFor={id + '-email'}
        validateStatus={errors.email ? 'error' : ''}
        help={errors.email?.message}
        required
        layout="vertical"
      >
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              type="email"
              id={id + '-email'}
              autoComplete="email"
              placeholder="nguyenvanan@stayhub.vn"
              style={{ borderRadius: '8px', height: '38px' }}
            />
          )}
        />
      </Form.Item>

      <Form.Item
        label="Số điện thoại"
        htmlFor={id + '-phone'}
        validateStatus={errors.phone ? 'error' : ''}
        help={errors.phone?.message}
        required
        layout="vertical"
      >
        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              placeholder="0912345678"
              id={id + '-phone'}
              autoComplete="tel"
              style={{ borderRadius: '8px', height: '38px' }}
            />
          )}
        />
      </Form.Item>

      <Form.Item
        label="Vai trò"
        htmlFor={id + '-role'}
        validateStatus={errors.role ? 'error' : ''}
        help={errors.role?.message}
        required
        layout="vertical"
      >
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              id={id + '-role'}
              style={{ width: '100%', height: '38px' }}
              options={[
                { value: 'CUSTOMER', label: 'Khách hàng' },
                { value: 'HOTEL_OWNER', label: 'Chủ khách sạn' },
                { value: 'ADMIN', label: 'Quản trị viên' },
              ]}
            />
          )}
        />
      </Form.Item>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '8px',
          marginTop: '24px',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            padding: '6px 14px',
            fontSize: '13px',
            borderRadius: '8px',
            border: '1px solid #E3E6E9',
            backgroundColor: '#ffffff',
            cursor: 'pointer',
          }}
        >
          Hủy bỏ
        </button>
        <Button type="primary" htmlType="submit" loading={isSubmitting}>
          Tạo người dùng
        </Button>
      </div>
    </form>
  )
}

export function CreateUserModal({ open, onClose, onSubmit }: CreateUserModalProps) {
  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            className="material-symbols-outlined"
            style={{ color: '#0E6B6F', fontSize: '22px' }}
          >
            person_add
          </span>
          <span style={{ fontSize: '16px', fontWeight: 600, color: '#17212B' }}>
            Thêm người dùng mới
          </span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
    >
      <CreateUserForm onClose={onClose} onSubmit={onSubmit} />
    </Modal>
  )
}
