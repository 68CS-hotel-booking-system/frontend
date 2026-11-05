import { useState } from 'react'
import { Modal, Select } from 'antd'
import type { AdminUser, UserRole } from '../model/user'

interface ChangeRoleModalProps {
  user: AdminUser | null
  open: boolean
  onClose: () => void
  onSaveRole: (userId: string, newRole: UserRole) => void
}

function RoleSelectForm({
  user,
  onSaveRole,
  onClose,
}: {
  user: AdminUser
  onSaveRole: (userId: string, newRole: UserRole) => void
  onClose: () => void
}) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role)

  const handleSave = () => {
    onSaveRole(user.id, selectedRole)
    onClose()
  }

  return (
    <>
      <div style={{ marginTop: '16px' }}>
        <p style={{ marginBottom: '12px', fontSize: '13px', color: '#5F6B76' }}>
          Thay đổi vai trò quản trị cho <strong>{user.fullName}</strong> ({user.email}):
        </p>
        <Select
          value={selectedRole}
          onChange={(val) => setSelectedRole(val as UserRole)}
          style={{ width: '100%', height: '38px' }}
          options={[
            { value: 'CUSTOMER', label: 'Khách hàng' },
            { value: 'HOTEL_OWNER', label: 'Chủ khách sạn' },
            { value: 'ADMIN', label: 'Quản trị viên' },
          ]}
        />
      </div>

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
          Hủy
        </button>
        <button
          type="button"
          onClick={handleSave}
          style={{
            padding: '6px 16px',
            fontSize: '13px',
            fontWeight: 500,
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#0E6B6F',
            color: '#ffffff',
            cursor: 'pointer',
          }}
        >
          Lưu thay đổi
        </button>
      </div>
    </>
  )
}

export function ChangeRoleModal({
  user,
  open,
  onClose,
  onSaveRole,
}: ChangeRoleModalProps) {
  if (!user) return null

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined" style={{ color: '#0E6B6F', fontSize: '22px' }}>
            manage_accounts
          </span>
          <span style={{ fontSize: '16px', fontWeight: 600 }}>Đổi vai trò người dùng</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <RoleSelectForm
        key={user.id + user.role}
        user={user}
        onSaveRole={onSaveRole}
        onClose={onClose}
      />
    </Modal>
  )
}
