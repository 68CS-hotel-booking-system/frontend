import { message } from 'antd'
import type { UserFilterTab } from '@/features/users'
import { CreateUserModal, UserActionMenu, UserDetailModal, ChangeRoleModal, useAdminUsers } from '@/features/users'

export function AdminUsersPage() {
  const {
    users,
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
  } = useAdminUsers()
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* PAGE TITLE ROW */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 600,
              color: '#17212B',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            Quản lý người dùng
          </h1>
          <p
            style={{
              fontSize: '13px',
              color: '#5F6B76',
              marginTop: '4px',
              marginBottom: 0,
            }}
          >
            Theo dõi tài khoản, vai trò và trạng thái người dùng trên hệ thống StayHub.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="admin-btn-primary"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            add
          </span>
          <span>Thêm người dùng</span>
        </button>
      </div>

      {/* MAIN TABLE CONTAINER */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #E3E6E9',
          borderRadius: '12px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* TAB ROW WITH SMOOTH UNDERLINE INDICATOR */}
        <div
          style={{
            padding: '0 20px',
            borderBottom: '1px solid #E3E6E9',
            overflowX: 'auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              minWidth: 'max-content',
            }}
          >
            {[
              { id: 'all' as UserFilterTab, label: 'Tất cả', count: tabCounts.all },
              { id: 'active' as UserFilterTab, label: 'Đang hoạt động', count: tabCounts.active },
              { id: 'pending' as UserFilterTab, label: 'Chờ xác thực', count: tabCounts.pending },
              { id: 'inactive' as UserFilterTab, label: 'Chưa hoạt động', count: tabCounts.inactive },
              { id: 'locked' as UserFilterTab, label: 'Đã khóa', count: tabCounts.locked },
            ].map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '14px 0',
                    fontSize: '13px',
                    border: 'none',
                    borderBottom: isActive ? '2px solid #0E6B6F' : '2px solid transparent',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#0E6B6F' : '#5F6B76',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{tab.label}</span>
                  <span
                    style={{
                      padding: '2px 6px',
                      fontSize: '11px',
                      borderRadius: '9999px',
                      backgroundColor: isActive ? 'rgba(14, 107, 111, 0.08)' : '#F5F6F7',
                      color: isActive ? '#0E6B6F' : '#5F6B76',
                      fontWeight: isActive ? 500 : 400,
                    }}
                  >
                    {tab.count.toLocaleString('vi-VN')}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* TOOLBAR ROW */}
        <div
          style={{
            padding: '16px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            borderBottom: '1px solid #E3E6E9',
            backgroundColor: '#ffffff',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '10px',
              flex: 1,
              minWidth: '280px',
            }}
          >
            {/* Search box with teal focus ring */}
            <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
              <span
                className="material-symbols-outlined"
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '18px',
                  color: '#5F6B76',
                  pointerEvents: 'none',
                }}
              >
                search
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo tên, email hoặc số điện thoại"
                style={{
                  width: '100%',
                  paddingLeft: '36px',
                  paddingRight: '12px',
                  paddingTop: '8px',
                  paddingBottom: '8px',
                  fontSize: '13px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #E3E6E9',
                  borderRadius: '8px',
                  color: '#17212B',
                  outline: 'none',
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#0E6B6F'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(14, 107, 111, 0.15)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#E3E6E9'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Filter: Vai trò */}
            <div style={{ position: 'relative' }}>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{
                  appearance: 'none',
                  paddingLeft: '12px',
                  paddingRight: '32px',
                  paddingTop: '8px',
                  paddingBottom: '8px',
                  fontSize: '13px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #E3E6E9',
                  borderRadius: '8px',
                  color: '#17212B',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="ALL">Tất cả vai trò</option>
                <option value="CUSTOMER">Khách hàng</option>
                <option value="HOTEL_OWNER">Chủ khách sạn</option>
                <option value="ADMIN">Quản trị viên</option>
              </select>
              <span
                className="material-symbols-outlined"
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '16px',
                  color: '#5F6B76',
                  pointerEvents: 'none',
                }}
              >
                expand_more
              </span>
            </div>

            {/* Filter: Ngày tham gia */}
            <div style={{ position: 'relative' }}>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                style={{
                  appearance: 'none',
                  paddingLeft: '12px',
                  paddingRight: '32px',
                  paddingTop: '8px',
                  paddingBottom: '8px',
                  fontSize: '13px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #E3E6E9',
                  borderRadius: '8px',
                  color: '#17212B',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="ALL">Tất cả thời gian</option>
                <option value="7D">7 ngày gần đây</option>
                <option value="30D">30 ngày gần đây</option>
                <option value="YTD">Năm nay</option>
              </select>
              <span
                className="material-symbols-outlined"
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '16px',
                  color: '#5F6B76',
                  pointerEvents: 'none',
                }}
              >
                expand_more
              </span>
            </div>
          </div>

          {/* Toolbar Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                fontSize: '13px',
                fontWeight: 500,
                color: '#17212B',
                backgroundColor: '#ffffff',
                border: '1px solid #E3E6E9',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F5F6F7'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#5F6B76' }}>
                swap_vert
              </span>
              <span>Sắp xếp: Mới nhất</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                fontSize: '13px',
                fontWeight: 500,
                color: '#17212B',
                backgroundColor: '#ffffff',
                border: '1px solid #E3E6E9',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F5F6F7'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#5F6B76' }}>
                download
              </span>
              <span>Xuất CSV</span>
            </button>
          </div>
        </div>

        {/* BULK ACTION BAR */}
        <div
          id="bulk-action-bar"
          style={{
            overflow: 'hidden',
            maxHeight: selectedIds.length > 0 ? '80px' : '0px',
            opacity: selectedIds.length > 0 ? 1 : 0,
            transform: selectedIds.length > 0 ? 'translateY(0)' : 'translateY(-8px)',
            transition: 'max-height 0.28s ease, opacity 0.24s ease, transform 0.28s ease',
          }}
        >
          <div
            style={{
              padding: '10px 20px',
              backgroundColor: '#E6F4F5',
              borderBottom: '1px solid rgba(14, 107, 111, 0.15)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              fontSize: '13px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#0E6B6F',
                fontWeight: 500,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                check_circle
              </span>
              <span>
                Đã chọn <strong style={{ fontWeight: 600 }}>{selectedIds.length}</strong> tài khoản
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={handleBulkResendEmail}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 500,
                  backgroundColor: '#ffffff',
                  color: '#17212B',
                  border: '1px solid #E3E6E9',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                Gửi lại email xác thực
              </button>
              <button
                type="button"
                onClick={handleBulkLock}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 500,
                  backgroundColor: '#FDECEA',
                  color: '#B42318',
                  border: '1px solid rgba(180, 35, 24, 0.2)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                Khóa tài khoản
              </button>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr
                style={{
                  backgroundColor: '#FAFBFB',
                  borderBottom: '1px solid #E3E6E9',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#5F6B76',
                }}
              >
                <th style={{ width: '44px', padding: '14px 16px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    className="custom-checkbox"
                    aria-label="Chọn tất cả"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isIndeterminate
                    }}
                    onChange={handleToggleSelectAll}
                  />
                </th>
                <th style={{ padding: '14px 12px', fontWeight: 500 }}>Người dùng</th>
                <th style={{ width: '140px', padding: '14px 12px', fontWeight: 500, textAlign: 'right' }}>
                  Số điện thoại
                </th>
                <th style={{ width: '140px', padding: '14px 12px', fontWeight: 500 }}>
                  Vai trò
                </th>
                <th style={{ width: '160px', padding: '14px 12px', fontWeight: 500 }}>
                  Trạng thái
                </th>
                <th style={{ width: '120px', padding: '14px 12px', fontWeight: 500 }}>
                  Ngày tham gia
                </th>
                <th
                  style={{
                    width: '56px',
                    padding: '14px 12px',
                    textAlign: 'right',
                    fontWeight: 500,
                  }}
                >
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody style={{ fontSize: '13px' }}>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: '#5F6B76' }}>
                    Không có người dùng nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isSelected = selectedIds.includes(user.id)
                  return (
                    <tr
                      key={user.id}
                      className={isSelected ? 'row-selected' : ''}
                      style={{
                        height: '64px',
                        borderBottom: '1px solid #E3E6E9',
                        backgroundColor: isSelected ? 'rgba(14, 107, 111, 0.04)' : '#ffffff',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = '#F8FAFA'
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = '#ffffff'
                      }}
                    >
                      <td style={{ width: '44px', padding: '0 16px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          className="custom-checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectRow(user.id)}
                        />
                      </td>

                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              backgroundColor: user.avatarBg,
                              color: user.avatarColor,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '13px',
                              fontWeight: 600,
                              flexShrink: 0,
                            }}
                          >
                            {user.avatarInitials}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                            <span
                              style={{
                                fontSize: '14px',
                                fontWeight: 500,
                                color: '#17212B',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                cursor: 'pointer',
                              }}
                              onClick={() => setSelectedUserForDetail(user)}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = '#0E6B6F'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = '#17212B'
                              }}
                            >
                              {user.fullName}
                            </span>
                            <span
                              style={{
                                fontSize: '13px',
                                color: '#5F6B76',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '0 12px', color: '#17212B', textAlign: 'right' }} className="tabular-nums">
                        {user.phone}
                      </td>

                      <td style={{ padding: '0 12px', color: '#17212B' }}>
                        {user.role === 'HOTEL_OWNER' && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <span
                              style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--admin-status-pending, #8A5A00)',
                              }}
                            />
                            Chủ khách sạn
                          </span>
                        )}
                        {user.role === 'ADMIN' && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <span
                              style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--admin-teal, #0E6B6F)',
                              }}
                            />
                            Quản trị viên
                          </span>
                        )}
                        {user.role === 'CUSTOMER' && <span>Khách hàng</span>}
                      </td>

                      <td style={{ padding: '0 12px' }}>
                        {user.status === 'ACTIVE' && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '4px 10px',
                              borderRadius: '9999px',
                              fontSize: '12px',
                              fontWeight: 500,
                              backgroundColor: '#E6F4EC',
                              color: '#1F7A4D',
                            }}
                          >
                            <span
                              className="active-dot-pulse"
                              style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: '#1F7A4D',
                              }}
                            />
                            Đang hoạt động
                          </span>
                        )}

                        {user.status === 'PENDING' && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '4px 10px',
                              borderRadius: '9999px',
                              fontSize: '12px',
                              fontWeight: 500,
                              backgroundColor: '#FFF3D6',
                              color: '#8A5A00',
                            }}
                          >
                            <span
                              style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: '#8A5A00',
                              }}
                            />
                            Chờ xác thực
                          </span>
                        )}

                        {user.status === 'INACTIVE' && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '4px 10px',
                              borderRadius: '9999px',
                              fontSize: '12px',
                              fontWeight: 500,
                              backgroundColor: '#EEF0F2',
                              color: '#4B5560',
                            }}
                          >
                            <span
                              style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: '#4B5560',
                              }}
                            />
                            Chưa hoạt động
                          </span>
                        )}

                        {user.status === 'LOCKED' && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '4px 10px',
                              borderRadius: '9999px',
                              fontSize: '12px',
                              fontWeight: 500,
                              backgroundColor: '#FDECEA',
                              color: '#B42318',
                            }}
                          >
                            <span
                              style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: '#B42318',
                              }}
                            />
                            Đã khóa
                          </span>
                        )}
                      </td>

                      <td
                        style={{ padding: '0 12px', color: '#5F6B76' }}
                        className="tabular-nums"
                      >
                        {user.joinedDate}
                      </td>

                      <td style={{ padding: '0 12px', textAlign: 'right' }}>
                        <UserActionMenu
                          user={user}
                          onToggleLock={handleToggleLockUser}
                          onResendEmail={handleResendEmail}
                          onChangeRole={(u) => setSelectedUserForRole(u)}
                          onViewDetail={(u) => setSelectedUserForDetail(u)}
                        />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        <div
          style={{
            padding: '16px',
            borderTop: '1px solid #E3E6E9',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            fontSize: '13px',
            color: '#5F6B76',
            backgroundColor: '#ffffff',
            flexWrap: 'wrap',
          }}
        >
          {/* Left Info & Page size selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>
              Hiển thị <span style={{ color: '#17212B', fontWeight: 500 }} className="tabular-nums">1–{filteredUsers.length}</span> trong{' '}
              <span style={{ color: '#17212B', fontWeight: 500 }} className="tabular-nums">{users.length}</span> tài khoản
            </span>
            <div style={{ position: 'relative' }}>
              <select
                defaultValue="20"
                style={{
                  appearance: 'none',
                  paddingLeft: '10px',
                  paddingRight: '26px',
                  paddingTop: '4px',
                  paddingBottom: '4px',
                  fontSize: '12px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #E3E6E9',
                  borderRadius: '8px',
                  color: '#17212B',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="20">20 / trang</option>
                <option value="50">50 / trang</option>
                <option value="100">100 / trang</option>
              </select>
              <span
                className="material-symbols-outlined"
                style={{
                  position: 'absolute',
                  right: '6px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '14px',
                  color: '#5F6B76',
                  pointerEvents: 'none',
                }}
              >
                expand_more
              </span>
            </div>
          </div>

          {/* Right Pagination Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              type="button"
              disabled
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: '1px solid #E3E6E9',
                color: '#5F6B76',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.4,
                cursor: 'not-allowed',
                background: 'transparent',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                chevron_left
              </span>
            </button>

            <button
              type="button"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(14, 107, 111, 0.1)',
                color: '#0E6B6F',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                border: 'none',
                cursor: 'pointer',
              }}
              className="tabular-nums"
            >
              1
            </button>

            <button
              type="button"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'transparent',
                color: '#17212B',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                border: 'none',
                cursor: 'pointer',
              }}
              className="tabular-nums"
            >
              2
            </button>

            <button
              type="button"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'transparent',
                color: '#17212B',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                border: 'none',
                cursor: 'pointer',
              }}
              className="tabular-nums"
            >
              3
            </button>

            <span
              style={{
                width: '24px',
                textAlign: 'center',
                color: '#5F6B76',
                userSelect: 'none',
              }}
              className="tabular-nums"
            >
              ...
            </span>

            <button
              type="button"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'transparent',
                color: '#17212B',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                border: 'none',
                cursor: 'pointer',
              }}
              className="tabular-nums"
            >
              63
            </button>

            <button
              type="button"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: '1px solid #E3E6E9',
                color: '#17212B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                background: 'transparent',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                chevron_right
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* SYSTEM STATES PREVIEW SECTION */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #E3E6E9',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '12px 20px',
            borderBottom: '1px solid #E3E6E9',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            backgroundColor: '#FAFBFB',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#5F6B76' }}>
              preview
            </span>
            <span style={{ fontSize: '13px', fontWeight: 500, color: '#17212B' }}>
              Xem trước các trạng thái hệ thống
            </span>
          </div>

          <div
            style={{
              display: 'inline-flex',
              padding: '4px',
              backgroundColor: '#EEF0F2',
              borderRadius: '8px',
              gap: '2px',
            }}
          >
            {(['loading', 'empty', 'error'] as const).map((type) => {
              const isActive = previewState === type
              const label =
                type === 'loading'
                  ? 'Đang tải dữ liệu'
                  : type === 'empty'
                    ? 'Dữ liệu trống'
                    : 'Lỗi kết nối'
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setPreviewState(type)}
                  style={{
                    padding: '4px 12px',
                    fontSize: '12px',
                    fontWeight: 500,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    backgroundColor: isActive ? '#ffffff' : 'transparent',
                    color: isActive ? '#0E6B6F' : '#5F6B76',
                    border: isActive ? '1px solid #E3E6E9' : '1px solid transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        {/* 1. LOADING SKELETON */}
        {previewState === 'loading' && (
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[1, 2].map((i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderBottom: '1px solid rgba(227, 230, 233, 0.6)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    className="skeleton-shimmer"
                    style={{ width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0 }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div
                      className="skeleton-shimmer"
                      style={{ width: i === 1 ? '128px' : '112px', height: '14px', borderRadius: '4px' }}
                    />
                    <div
                      className="skeleton-shimmer-subtle"
                      style={{ width: i === 1 ? '176px' : '160px', height: '10px', borderRadius: '4px' }}
                    />
                  </div>
                </div>

                <div
                  className="skeleton-shimmer-subtle"
                  style={{ width: '96px', height: '12px', borderRadius: '4px' }}
                />
                <div
                  className="skeleton-shimmer-subtle"
                  style={{ width: '80px', height: '20px', borderRadius: '9999px' }}
                />
                <div
                  className="skeleton-shimmer"
                  style={{ width: '96px', height: '20px', borderRadius: '9999px' }}
                />
                <div
                  className="skeleton-shimmer-subtle"
                  style={{ width: '64px', height: '12px', borderRadius: '4px' }}
                />
              </div>
            ))}
          </div>
        )}

        {/* 2. EMPTY STATE */}
        {previewState === 'empty' && (
          <div
            style={{
              padding: '32px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#EEF0F2',
                color: '#5F6B76',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                person_search
              </span>
            </div>
            <h4
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#17212B',
                margin: '0 0 4px',
              }}
            >
              Không tìm thấy người dùng phù hợp
            </h4>
            <p
              style={{
                fontSize: '12px',
                color: '#5F6B76',
                maxWidth: '380px',
                margin: '0 0 16px',
                lineHeight: 1.5,
              }}
            >
              Vui lòng điều chỉnh lại bộ lọc hoặc từ khóa tìm kiếm theo tên, email, số điện thoại.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('')
                setRoleFilter('ALL')
                setDateFilter('ALL')
                setActiveTab('all')
                message.info('Đã đặt lại bộ lọc tìm kiếm')
              }}
              style={{
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 500,
                color: '#17212B',
                backgroundColor: '#ffffff',
                border: '1px solid #E3E6E9',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              Đặt lại bộ lọc
            </button>
          </div>
        )}

        {/* 3. CONNECTION ERROR */}
        {previewState === 'error' && (
          <div
            style={{
              padding: '32px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#FDECEA',
                color: '#B42318',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
                border: '1px solid rgba(180, 35, 24, 0.2)',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                cloud_off
              </span>
            </div>
            <h4
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#17212B',
                margin: '0 0 4px',
              }}
            >
              Không tải được danh sách người dùng
            </h4>
            <p
              style={{
                fontSize: '12px',
                color: '#5F6B76',
                maxWidth: '380px',
                margin: '0 0 16px',
                lineHeight: 1.5,
              }}
            >
              Đã xảy ra sự cố khi kết nối với máy chủ dữ liệu StayHub. Vui lòng thử lại sau.
            </p>
            <button
              type="button"
              onClick={handleRetryConnection}
              disabled={isRetrying}
              className="admin-btn-primary"
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: '15px',
                  display: 'inline-block',
                  animation: isRetrying ? 'spin 1s linear infinite' : 'none',
                }}
              >
                refresh
              </span>
              <span>{isRetrying ? 'Đang thử lại...' : 'Tải lại dữ liệu'}</span>
            </button>
          </div>
        )}
      </div>

      {/* MODALS */}
      <CreateUserModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateUser}
      />

      <UserDetailModal
        user={selectedUserForDetail}
        open={Boolean(selectedUserForDetail)}
        onClose={() => setSelectedUserForDetail(null)}
      />

      <ChangeRoleModal
        user={selectedUserForRole}
        open={Boolean(selectedUserForRole)}
        onClose={() => setSelectedUserForRole(null)}
        onSaveRole={handleSaveRole}
      />
    </div>
  )
}
