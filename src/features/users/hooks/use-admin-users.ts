import { useState, useMemo } from 'react'
import { message } from 'antd'
import { INITIAL_MOCK_USERS } from '../mocks/mock-users'
import type { AdminUser, UserFilterTab, UserRole } from '../model/user'
import type { CreateUserFormValues } from '../model/create-user-form-schema'

/** Existing admin preview behavior; these actions do not call backend user APIs. */
export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>(INITIAL_MOCK_USERS)
  const [selectedIds, setSelectedIds] = useState<string[]>(['1', '2', '3'])
  const [activeTab, setActiveTab] = useState<UserFilterTab>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('ALL')
  const [dateFilter, setDateFilter] = useState<string>('ALL')
  const [previewState, setPreviewState] = useState<'loading' | 'empty' | 'error'>('error')
  const [isRetrying, setIsRetrying] = useState(false)

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<AdminUser | null>(null)
  const [selectedUserForRole, setSelectedUserForRole] = useState<AdminUser | null>(null)

  // Tính số lượng cho từng tab
  const tabCounts = useMemo(() => {
    return {
      all: 1248,
      active: 1102,
      pending: 86,
      inactive: 42,
      locked: 18,
    }
  }, [])

  // Lọc danh sách hiển thị
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Lọc theo Tab
      if (activeTab === 'active' && u.status !== 'ACTIVE') return false
      if (activeTab === 'pending' && u.status !== 'PENDING') return false
      if (activeTab === 'inactive' && u.status !== 'INACTIVE') return false
      if (activeTab === 'locked' && u.status !== 'LOCKED') return false

      // Lọc theo Vai trò
      if (roleFilter !== 'ALL' && u.role !== roleFilter) return false

      // Lọc theo Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase()
        const matchName = u.fullName.toLowerCase().includes(query)
        const matchEmail = u.email.toLowerCase().includes(query)
        const matchPhone = u.phone.includes(query)
        if (!matchName && !matchEmail && !matchPhone) return false
      }

      return true
    })
  }, [users, activeTab, roleFilter, searchTerm])

  // Xử lý chọn Checkbox
  const handleToggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredUsers.map((u) => u.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const isAllSelected =
    filteredUsers.length > 0 &&
    filteredUsers.every((u) => selectedIds.includes(u.id))
  const isIndeterminate =
    selectedIds.length > 0 &&
    !isAllSelected &&
    filteredUsers.some((u) => selectedIds.includes(u.id))

  // Thao tác với từng user
  const handleToggleLockUser = (user: AdminUser) => {
    const nextStatus = user.status === 'LOCKED' ? 'ACTIVE' : 'LOCKED'
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u)),
    )
    message.success(
      nextStatus === 'LOCKED'
        ? `Đã khóa tài khoản ${user.fullName}`
        : `Đã mở khóa tài khoản ${user.fullName}`,
    )
  }

  const handleResendEmail = (user: AdminUser) => {
    message.info(`Đã gửi lại email xác thực tới ${user.email}`)
  }

  const handleSaveRole = (userId: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
    )
    message.success('Đã cập nhật vai trò người dùng thành công!')
  }

  // Bulk actions
  const handleBulkResendEmail = () => {
    message.success(`Đã gửi email xác thực tới ${selectedIds.length} tài khoản được chọn`)
  }

  const handleBulkLock = () => {
    setUsers((prev) =>
      prev.map((u) =>
        selectedIds.includes(u.id) ? { ...u, status: 'LOCKED' } : u,
      ),
    )
    message.warning(`Đã khóa ${selectedIds.length} tài khoản được chọn`)
  }

  // Thêm người dùng mới
  const handleCreateUser = (values: CreateUserFormValues) => {
    const initials = values.fullName
      .split(' ')
      .filter(Boolean)
      .slice(-2)
      .map((w) => w[0].toUpperCase())
      .join('')

    const newUser: AdminUser = {
      id: String(Date.now()),
      fullName: values.fullName,
      email: values.email,
      phone: values.phone,
      role: values.role,
      status: 'PENDING',
      joinedDate: new Date().toLocaleDateString('vi-VN'),
      avatarInitials: initials || 'ND',
      avatarBg: '#E2E8F0',
      avatarColor: '#334155',
    }

    setUsers((prev) => [newUser, ...prev])
    message.success(`Đã thêm người dùng ${values.fullName} thành công!`)
  }

  const handleExportCSV = () => {
    message.info('Đang xuất danh sách người dùng ra định dạng CSV...')
  }

  const handleRetryConnection = () => {
    setIsRetrying(true)
    setTimeout(() => {
      setIsRetrying(false)
      message.success('Đã kết nối lại thành công!')
    }, 1200)
  }

    return {
    selectedIds,
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    dateFilter,
    setDateFilter,
    previewState,
    setPreviewState,
    isRetrying,
    isCreateModalOpen,
    setIsCreateModalOpen,
    selectedUserForDetail,
    setSelectedUserForDetail,
    selectedUserForRole,
    setSelectedUserForRole,
    tabCounts,
    filteredUsers,
    handleToggleSelectAll,
    handleToggleSelectRow,
    isAllSelected,
    isIndeterminate,
    handleToggleLockUser,
    handleResendEmail,
    handleSaveRole,
    handleBulkResendEmail,
    handleBulkLock,
    handleCreateUser,
    handleExportCSV,
    handleRetryConnection,
  }
}
