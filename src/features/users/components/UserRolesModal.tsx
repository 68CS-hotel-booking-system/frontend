import { useState } from 'react'
import { App as AntApp, Button, Input, Modal, Space, Table, Tag } from 'antd'
import {
  useGrantRoleMutation,
  useRevokeRoleMutation,
  useRolesQuery,
  useUserRolesQuery,
} from '../hooks/use-user-roles'
import type { RoleResponse } from '../types/user-roles'

interface UserRolesModalProps {
  open: boolean
  onClose: () => void
  initialUserId?: string
}

export function UserRolesModal({
  open,
  onClose,
  initialUserId = '99999999-9999-4999-8999-999999999901',
}: UserRolesModalProps) {
  const { message } = AntApp.useApp()
  const [userIdInput, setUserIdInput] = useState(initialUserId)
  const [targetUserId, setTargetUserId] = useState(initialUserId)

  const rolesQuery = useRolesQuery()
  const userRolesQuery = useUserRolesQuery(targetUserId)

  const grantMutation = useGrantRoleMutation(targetUserId)
  const revokeMutation = useRevokeRoleMutation(targetUserId)

  const userRolesList = userRolesQuery.data?.roles ?? []

  const handleGrant = async (role: RoleResponse) => {
    try {
      await grantMutation.mutateAsync(role.id)
      void message.success(`Đã cấp vai trò "${role.roleName}" cho người dùng.`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể cấp vai trò.'
      void message.error(msg)
    }
  }

  const handleRevoke = async (role: RoleResponse) => {
    try {
      await revokeMutation.mutateAsync(role.id)
      void message.success(`Đã thu hồi vai trò "${role.roleName}" của người dùng.`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể thu hồi vai trò.'
      void message.error(msg)
    }
  }

  const columns = [
    {
      title: 'Mã ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Mã vai trò (Role Key)',
      dataIndex: 'roleKey',
      key: 'roleKey',
      render: (roleKey: string) => <Tag color="blue">{roleKey}</Tag>,
    },
    {
      title: 'Tên hiển thị',
      dataIndex: 'roleName',
      key: 'roleName',
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_: unknown, record: RoleResponse) => {
        const isGranted = userRolesList.includes(record.roleKey)
        return isGranted ? (
          <Tag color="green">Đã phân quyền</Tag>
        ) : (
          <Tag color="default">Chưa cấp</Tag>
        )
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, record: RoleResponse) => {
        const isGranted = userRolesList.includes(record.roleKey)
        const isPending = grantMutation.isPending || revokeMutation.isPending

        return isGranted ? (
          <Button
            danger
            size="small"
            disabled={isPending}
            onClick={() => void handleRevoke(record)}
          >
            Thu hồi quyền
          </Button>
        ) : (
          <Button
            type="primary"
            size="small"
            disabled={isPending}
            onClick={() => void handleGrant(record)}
          >
            Cấp vai trò
          </Button>
        )
      },
    },
  ]

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={720}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            admin_panel_settings
          </span>
          <span>Phân quyền &amp; Quản trị vai trò tài khoản</span>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
        <div>
          <label
            htmlFor="target-user-id-input"
            style={{
              display: 'block',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--atelier-on-surface-variant)',
              marginBottom: 6,
            }}
          >
            Mã định danh người dùng (User UUID)
          </label>
          <Space.Compact style={{ width: '100%' }}>
            <Input
              id="target-user-id-input"
              value={userIdInput}
              onChange={(e) => setUserIdInput(e.target.value.trim())}
              placeholder="Nhập UUID người dùng cần kiểm tra hoặc cấp quyền"
            />
            <Button
              type="primary"
              onClick={() => setTargetUserId(userIdInput)}
            >
              Tra cứu vai trò
            </Button>
          </Space.Compact>
        </div>

        <Table
          rowKey="id"
          loading={rolesQuery.isLoading || userRolesQuery.isLoading}
          dataSource={rolesQuery.data ?? []}
          columns={columns}
          pagination={false}
          size="middle"
        />
      </div>
    </Modal>
  )
}
