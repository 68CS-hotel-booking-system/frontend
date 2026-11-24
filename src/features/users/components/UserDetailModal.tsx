import { Modal, Descriptions, Tag } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { formatPhoneNumber } from '@/shared/lib/format'
import type { AdminUser } from '../model/user'

interface UserDetailModalProps {
  user: AdminUser | null
  open: boolean
  onClose: () => void
  title?: string
}

export function UserDetailModal({
  user,
  open,
  onClose,
  title = 'Thông tin người dùng',
}: UserDetailModalProps) {
  if (!user) return null

  const getRoleLabel = (role: string) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN':
      case 'ROLE_ADMIN':
        return 'Quản trị viên'
      case 'HOTEL_OWNER':
      case 'ROLE_HOTEL_OWNER':
      case 'OWNER':
      case 'ROLE_OWNER':
        return 'Chủ khách sạn'
      case 'CUSTOMER':
      case 'ROLE_CUSTOMER':
      case 'USER':
      case 'ROLE_USER':
        return 'Khách hàng'
      default:
        return role
    }
  }

  const getStatusLabel = (status: AdminUser['status']) => {
    switch (status) {
      case 'ACTIVE':
        return <Tag color="green">Đã xác thực</Tag>
      case 'PENDING':
        return <Tag color="gold">Chờ xác thực</Tag>
      case 'INACTIVE':
        return <Tag color="default">Chưa hoạt động</Tag>
      case 'LOCKED':
        return <Tag color="red">Đã khóa</Tag>
    }
  }

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <UserOutlined className="text-[#0b5f53] text-lg" aria-hidden="true" />
          <span className="text-base font-semibold text-[#12211d]">{title}</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
    >
      <div style={{ marginTop: '16px' }}>
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Họ và tên">{user.fullName}</Descriptions.Item>
          <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">{formatPhoneNumber(user.phone)}</Descriptions.Item>
          <Descriptions.Item label="Vai trò">{user.roles.map(getRoleLabel).join(', ') || '—'}</Descriptions.Item>
          <Descriptions.Item label="Trạng thái">{getStatusLabel(user.status)}</Descriptions.Item>
          <Descriptions.Item label="Ngày tham gia">{user.joinedDate}</Descriptions.Item>
        </Descriptions>
      </div>
    </Modal>
  )
}
