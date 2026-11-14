import { useState } from 'react'
import {
  AppstoreOutlined,
  BuildOutlined,
  EditOutlined,
  EllipsisOutlined,
  EyeOutlined,
  PlusOutlined,
  UserOutlined,
} from '@ant-design/icons'
import {
  Alert,
  App,
  Button,
  Dropdown,
  Form,
  Input,
  Modal,
  Radio,
  Select,
  Table,
  Tag,
  Tabs,
} from 'antd'
import dayjs from 'dayjs'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { useCurrentUser } from '@/features/auth'
import { useHotelReviewRequests } from '@/features/hotel-review-requests'
import { HotelAmenitiesManager, useHotelWorkspace } from '@/features/hotels'
import {
  RoomOperationalStatusTag,
  roomReadinessOptions,
  readinessPatchStatus,
  EditRoomTypeModal,
  RoomTypeDetailsModal,
  buildRoomEditPayload,
  useManagementRoomMutations,
  useManagementRoomTypesQuery,
  useManagementRoomsQuery,
} from '@/features/rooms'
import type { ManagementRoom, ManagementRoomType } from '@/features/rooms'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { PageHeader } from '@/shared/ui/PageHeader'
import { PageLoading } from '@/shared/ui/PageLoading'
import { formatCurrencyAmount } from '@/shared/lib/format'

export function HotelRoomsPage() {
  const { hotel, hotelId } = useHotelWorkspace()
  const { message, modal } = App.useApp()
  const navigate = useNavigate()
  const { isAdmin } = useCurrentUser()
  const latestReview = useHotelReviewRequests(hotelId, 0, 1, !isAdmin)
  const profileLocked = isAdmin || !latestReview.isSuccess || latestReview.data.content[0]?.status === 'PENDING'
  const { updateRoom } = useManagementRoomMutations(hotelId)
  const { roomId: linkedRoomTypeId } = useParams<{ roomId: string }>()
  const [params] = useSearchParams()
  const [activeTab, setActiveTab] = useState<'rooms' | 'types'>(linkedRoomTypeId || params.get('tab') === 'types' ? 'types' : 'rooms')
  const [detailRoomTypeId, setDetailRoomTypeId] = useState<string | null>(null)
  const [editTypeTab, setEditTypeTab] = useState<'info' | 'amenities'>('info')
  const [editRoomTab, setEditRoomTab] = useState<'info' | 'amenities'>('info')
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<string | undefined>(params.get('roomTypeId') ?? undefined)

  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)

  // Queries
  const roomTypesQuery = useManagementRoomTypesQuery(hotelId)
  const roomTypes = roomTypesQuery.data ?? []

  const roomsQuery = useManagementRoomsQuery(hotelId, {
    roomTypeId: selectedRoomTypeId,
    page: currentPage,
    size: pageSize,
  })
  const roomPage = roomsQuery.data
  const physicalRooms = roomPage?.items ?? []

  // Modal Sửa phòng vật lý
  const [editingRoom, setEditingRoom] = useState<ManagementRoom | null>(null)
  const [isUpdatingRoom, setIsUpdatingRoom] = useState(false)
  const [roomEditForm] = Form.useForm()

  // Modal Sửa loại phòng
  const [editingRoomType, setEditingRoomType] = useState<ManagementRoomType | null>(null)

  const selectedDetailId = linkedRoomTypeId ?? detailRoomTypeId
  const detailRoomType = roomTypes.find((type) => type.id === selectedDetailId)
  const closeDetails = () => {
    setDetailRoomTypeId(null)
    if (linkedRoomTypeId) navigate(`/hotels/${hotelId}/rooms?tab=types`, { replace: true })
  }
  const editType = (type: ManagementRoomType, tab: 'info' | 'amenities') => {
    if (profileLocked) return
    setEditTypeTab(tab)
    setEditingRoomType(type)
  }
  const editRoom = (room: ManagementRoom, tab: 'info' | 'amenities') => {
    if (profileLocked) return
    setEditRoomTab(tab)
    setEditingRoom(room)
    roomEditForm.resetFields()
    roomEditForm.setFieldsValue({ roomNumber: room.roomNumber, floor: room.floor, status: room.readiness })
  }

  if (!hotel) return null

  const breadcrumbItems = [
    { label: 'Khách sạn', to: '/hotels' },
    { label: hotel.name, to: `/hotels/${hotelId}` },
    { label: 'Phòng' },
    { label: activeTab === 'rooms' ? 'Phòng vật lý' : 'Loại phòng' },
  ]

  // Render readiness badge
  const renderReadinessTag = (readiness: string, roomId: string, roomNumber: string) => {
    return (
      <Select
        disabled={isAdmin}
        aria-label={`Trạng thái phòng ${roomNumber}`}
        size="small"
        value={readiness}
        className="!w-44 text-xs"
        onChange={async (newStatus) => {
                      if (newStatus !== 'ready' && newStatus !== 'dirty') return
          try {
            await updateRoom.mutateAsync({ roomId, payload: { status: readinessPatchStatus(newStatus) } })
            message.success('Đã cập nhật trạng thái phòng!')
          } catch (error) {
            message.error(error instanceof Error ? error.message : 'Cập nhật trạng thái thất bại.')
          }
        }}
        options={roomReadinessOptions}
      />
    )
  }

  // Handle submit Sửa phòng vật lý
  const handleSaveRoomEdit = async () => {
    if (!editingRoom) return
    try {
      const values = await roomEditForm.validateFields()
      setIsUpdatingRoom(true)
      await updateRoom.mutateAsync({ roomId: editingRoom.id, payload: buildRoomEditPayload(editingRoom, values) })
      message.success(`Đã cập nhật phòng ${values.roomNumber}!`)
      setEditingRoom(null)
    } catch (error) {
      if (error && typeof error === 'object' && 'errorFields' in error) return
      message.error(error instanceof Error ? error.message : 'Cập nhật phòng thất bại.')
    } finally {
      setIsUpdatingRoom(false)
    }
  }

  return (
    <div className="hotel-rooms-page max-w-5xl mx-auto space-y-6">
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        kicker="QUẢN LÝ PHÒNG &amp; LƯU TRÚ"
        title="Quản lý buồng phòng &amp; Hạng phòng"
        description="Theo dõi danh sách các phòng vật lý thực tế, trạng thái phòng (sẵn sàng hoặc chưa sẵn sàng) và các hạng phòng phục vụ kinh doanh."
        extra={
          <Button
            type="primary" disabled={profileLocked}
            icon={<PlusOutlined />}
            onClick={() =>
              navigate(
                `/hotels/${hotelId}/rooms/new?tab=${
                  activeTab === 'rooms'
                    ? roomTypes.length === 0
                      ? 'room-type'
                      : 'room'
                    : 'room-type'
                }${activeTab === 'rooms' && selectedRoomTypeId ? `&roomTypeId=${selectedRoomTypeId}` : ''}`
              )
            }
            className="!bg-[#0b5f53] !rounded-xl font-semibold"
          >
            {activeTab === 'rooms'
              ? roomTypes.length === 0
                ? 'Thêm loại phòng trước'
                : 'Thêm phòng vật lý mới'
              : 'Thêm loại phòng mới'}
          </Button>
        }
      />

      {/* Tabs / Segmented switcher */}
      <div className="bg-white p-3 rounded-2xl border border-[#dce7e3] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <Radio.Group
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value)}
          buttonStyle="solid"
          size="middle"
        >
          <Radio.Button value="rooms" className="!rounded-l-lg">
            <BuildOutlined className="mr-1.5" /> Danh sách phòng vật lý ({roomPage?.totalItems ?? 0})
          </Radio.Button>
          <Radio.Button value="types" className="!rounded-r-lg">
            <AppstoreOutlined className="mr-1.5" /> Hạng / Loại phòng ({roomTypes.length})
          </Radio.Button>
        </Radio.Group>

        {activeTab === 'rooms' && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-[#5f736e] whitespace-nowrap">Lọc theo loại:</span>
            <Select
              allowClear
              placeholder="Tất cả loại phòng"
              value={selectedRoomTypeId}
              onChange={(value) => { setSelectedRoomTypeId(value); setCurrentPage(0) }}
              className="w-full sm:w-52"
              size="small"
              options={roomTypes.map((rt) => ({ value: rt.id, label: rt.name }))}
            />
          </div>
        )}
      </div>

      <p className="text-sm text-[#526760]" role="note">
        {activeTab === 'types'
          ? 'Hạng phòng: thông tin, giá cơ bản và tiện ích chung cho tất cả phòng thuộc hạng. Có thể cấu hình tiện ích ngay cả khi chưa tạo phòng vật lý.'
          : 'Phòng vật lý: quản lý từng số phòng và tiện ích bổ sung riêng. Tiện ích chung được kế thừa từ hạng phòng.'}
      </p>
      {!isAdmin && latestReview.isError && <Alert showIcon type="warning" title="Chưa tải được trạng thái xét duyệt" description="Các thao tác sửa hồ sơ tạm khóa để tránh thay đổi bản đang chờ duyệt. Bạn vẫn có thể cập nhật trạng thái phòng." action={<Button onClick={() => void latestReview.refetch()}>Thử lại</Button>} />}
      {/* TAB 1: DANH SÁCH PHÒNG VẬT LÝ */}
      {activeTab === 'rooms' && (
        <>
          {roomsQuery.isPending ? (
            <PageLoading />
          ) : roomsQuery.isError ? (
            <ErrorState
              error={roomsQuery.error}
              onRetry={() => void roomsQuery.refetch()}
            />
          ) : physicalRooms.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-[#dce7e3] text-center shadow-xs">
              {roomTypes.length === 0 ? (
                <EmptyState
                  title="Chưa có loại phòng nào"
                  description="Khách sạn cần có ít nhất 1 loại phòng (hạng phòng như Standard, Deluxe...) trước khi có thể khởi tạo các số phòng vật lý thực tế."
                  action={
                    <Button
                      type="primary" disabled={profileLocked}
                      icon={<PlusOutlined />}
                      onClick={() => {
                        setActiveTab('types')
                        navigate(`/hotels/${hotelId}/rooms/new?tab=room-type`)
                      }}
                      className="!bg-[#0b5f53] !rounded-xl font-semibold mt-3"
                    >
                      Thêm loại phòng đầu tiên
                    </Button>
                  }
                />
              ) : (
                <EmptyState
                  title="Chưa có phòng vật lý nào"
                  description={
                    selectedRoomTypeId
                      ? 'Không có phòng nào thuộc loại phòng đã chọn.'
                      : 'Hãy tạo các số phòng vật lý thực tế của khách sạn (ví dụ: Phòng 101, 102...) để đưa vào vận hành đón khách.'
                  }
                  action={
                    <Button
                      type="primary" disabled={profileLocked}
                      icon={<PlusOutlined />}
                      onClick={() => navigate(`/hotels/${hotelId}/rooms/new?tab=room${selectedRoomTypeId ? `&roomTypeId=${selectedRoomTypeId}` : ''}`)}
                      className="!bg-[#0b5f53] !rounded-xl font-semibold mt-3"
                    >
                      Thêm phòng vật lý mới
                    </Button>
                  }
                />
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#dce7e3] overflow-hidden shadow-xs">
              <Table
                scroll={{ x: 900 }}
                dataSource={physicalRooms}
                rowKey="id"
                pagination={{ current: currentPage + 1, pageSize, total: roomPage?.totalItems ?? 0, showSizeChanger: true, onChange: (page, size) => { setCurrentPage(page - 1); setPageSize(size) } }}
                columns={[
                  {
                    title: 'Số phòng',
                    dataIndex: 'roomNumber',
                    key: 'roomNumber',
                    render: (roomNumber: string) => (
                      <span className="font-bold text-[#12211d] text-sm">{roomNumber}</span>
                    ),
                  },
                  {
                    title: 'Tầng',
                    dataIndex: 'floor',
                    key: 'floor',
                    render: (floor: string | null) => (
                      <span className="text-xs text-[#5f736e]">
                        {floor ? `Tầng ${floor}` : '—'}
                      </span>
                    ),
                  },
                  {
                    title: 'Loại phòng',
                    dataIndex: 'roomTypeId',
                    key: 'roomTypeId',
                    render: (roomTypeId: string) => {
                      const found = roomTypes.find((rt) => rt.id === roomTypeId)
                      return (
                        <span className="text-xs text-[#12211d] font-medium">
                          {found ? found.name : roomTypeId.slice(0, 8)}
                        </span>
                      )
                    },
                  },
                  {
                    title: 'Trạng thái phòng',
                    dataIndex: 'readiness',
                    key: 'readiness',
                    render: (readiness: string, record) => renderReadinessTag(readiness, record.id, record.roomNumber),
                  },
                  {
                    title: 'Vận hành',
                    dataIndex: 'operationalFrom',
                    key: 'operationalFrom',
                    render: (_: string, record) => <div className="space-y-1"><RoomOperationalStatusTag status={record.operationalStatus} /><div className="text-xs text-[#526760]">Từ {dayjs(record.operationalFrom).format('DD/MM/YYYY HH:mm')}{record.operationalUntil && <><br />Đến {dayjs(record.operationalUntil).format('DD/MM/YYYY HH:mm')}</>}</div></div>,
                  },
                  {
                    title: 'Thao tác',
                    width: 96,
                    key: 'action',
                    align: 'right',
                    render: (_, record) => (
                      <Dropdown
                        trigger={['click']}
                        placement="bottomRight"
                        menu={{
                          items: [
                            { key: 'edit', label: 'Sửa', disabled: profileLocked, icon: <EditOutlined /> },
                            { key: 'amenities', label: 'Tiện ích riêng', disabled: profileLocked, icon: <AppstoreOutlined /> },
                          ],
                          onClick: ({ key }) => {
                            if (key === 'edit') editRoom(record, 'info')
                            else if (key === 'amenities') editRoom(record, 'amenities')
                          },
                        }}
                      >
                        <Button
                          type="text"
                          icon={<EllipsisOutlined className="text-lg" />}
                          aria-label={`Thao tác phòng ${record.roomNumber}`}
                          title="Thao tác phòng"
                        />
                      </Dropdown>
                    ),
                  },
                ]}
              />
            </div>
          )}
        </>
      )}

      {/* TAB 2: HẠNG / LOẠI PHÒNG */}
      {activeTab === 'types' && (
        <>
          {roomTypesQuery.isPending ? (
            <PageLoading />
          ) : roomTypesQuery.isError ? (
            <ErrorState
              error={roomTypesQuery.error}
              onRetry={() => void roomTypesQuery.refetch()}
            />
          ) : roomTypes.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-[#dce7e3] text-center shadow-xs">
              <EmptyState
                title="Chưa có loại phòng nào"
                description="Hãy tạo loại phòng đầu tiên để khách sạn có thể thiết lập giá và tạo phòng vật lý."
                action={
                  <Button
                    type="primary" disabled={profileLocked}
                    icon={<PlusOutlined />}
                    onClick={() => navigate(`/hotels/${hotelId}/rooms/new?tab=room-type`)}
                    className="!bg-[#0b5f53] mt-3"
                  >
                    Thêm loại phòng mới
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#dce7e3] overflow-hidden shadow-xs">
              <Table
                scroll={{ x: 900 }}
                dataSource={roomTypes}
                rowKey="id"
                pagination={false}
                columns={[
                  {
                    title: 'Tên loại phòng',
                    dataIndex: 'name',
                    key: 'name',
                    render: (name: string, record) => (
                      <div>
                        <Button type="link" onClick={() => setDetailRoomTypeId(record.id)} className="!p-0 !h-auto !whitespace-normal !text-left font-bold !text-[#12211d]">
                          {name}
                        </Button>
                        {record.description && (
                          <div className="text-xs text-[#5f736e] line-clamp-1 mt-0.5">
                            {record.description}
                          </div>
                        )}
                      </div>
                    ),
                  },
                  {
                    title: 'Giá cơ bản / đêm',
                    dataIndex: 'basePrice',
                    key: 'basePrice',
                    render: (value: number | undefined) => <span className="tabular-nums">{value === undefined ? 'Chưa tải được giá' : value > 0 ? formatCurrencyAmount(value, 'VND') : 'Chưa thiết lập'}</span>,
                  },
                  {
                    title: 'Sức chứa',
                    key: 'capacity',
                    render: (_, record) => (
                      <div className="text-xs text-[#344a44] flex items-center gap-1.5">
                        <UserOutlined />
                        <span>{record.maxAdults} người lớn</span>
                        {(record.maxChildren ?? 0) > 0 && <span>· {record.maxChildren} trẻ em</span>}
                      </div>
                    ),
                  },
                  {
                    title: 'Trạng thái',
                    dataIndex: 'active',
                    key: 'active',
                    render: (active: boolean) => (
                      <Tag color={active ? 'green' : 'default'} className="!rounded-md text-xs">
                        {active ? 'Đang kích hoạt' : 'Tạm ngưng'}
                      </Tag>
                    ),
                  },
                  {
                    title: 'Thao tác',
                    width: 96,
                    key: 'action',
                    align: 'right',
                    render: (_, record) => (
                      <Dropdown
                        trigger={['click']}
                        placement="bottomRight"
                        menu={{
                          items: [
                            { key: 'add-room', label: 'Thêm phòng thuộc hạng này', disabled: profileLocked || !record.active, icon: <PlusOutlined /> },
                            { key: 'edit', label: 'Chỉnh sửa', disabled: profileLocked, icon: <EditOutlined /> },
                            { key: 'detail', label: 'Chi tiết', icon: <EyeOutlined /> },
                            { key: 'amenities', label: 'Tiện ích hạng phòng', disabled: profileLocked, icon: <AppstoreOutlined /> },
                          ],
                          onClick: ({ key }) => {
                            if (key === 'add-room') navigate(`/hotels/${hotelId}/rooms/new?tab=room&roomTypeId=${record.id}`)
                            else if (key === 'edit') editType(record, 'info')
                            else if (key === 'detail') setDetailRoomTypeId(record.id)
                            else if (key === 'amenities') editType(record, 'amenities')
                          },
                        }}
                      >
                        <Button
                          type="text"
                          icon={<EllipsisOutlined className="text-lg" />}
                          aria-label={`Thao tác hạng phòng ${record.name}`}
                          title="Thao tác hạng phòng"
                        />
                      </Dropdown>
                    ),
                  },
                ]}
              />
            </div>
          )}
        </>
      )}

      {/* MODAL SỬA PHÒNG VẬT LÝ (HT21: UpdateRoomRequest) */}
      <Modal
        title={`Chỉnh sửa phòng ${editingRoom?.roomNumber || ''}`}
        width={800}
        styles={{ body: { maxHeight: '72vh', overflowY: 'auto' } }}
        footer={editRoomTab === 'amenities' ? null : undefined}
        key={editingRoom?.id ?? 'no-room'}
        open={Boolean(editingRoom) && !profileLocked}
        onCancel={() => setEditingRoom(null)}
        onOk={handleSaveRoomEdit}
        confirmLoading={isUpdatingRoom}
        okText="Lưu thay đổi"
        cancelText="Hủy"
        okButtonProps={{ className: '!bg-[#0b5f53]' }}
      >
        <Tabs activeKey={editRoomTab} onChange={(key) => setEditRoomTab(key as 'info' | 'amenities')} items={[
          { key: 'info', label: 'Thông tin phòng vật lý', forceRender: true, children: <Form form={roomEditForm} layout="vertical" className="mt-4">
          <Form.Item
            label="Số phòng"
            name="roomNumber"
            rules={[{ required: true, message: 'Vui lòng nhập số phòng' }]}
          >
            <Input maxLength={50} />
          </Form.Item>

          <Form.Item label="Tầng" name="floor">
            <Input placeholder="VD: 1, 2, 3..." />
          </Form.Item>

          <section className="mb-5 rounded-xl border border-[#dce7e3] p-4 space-y-3">
            <div><strong>Vận hành: </strong><RoomOperationalStatusTag status={editingRoom?.operationalStatus} /></div>
            <p className="text-sm text-[#526760]">Bắt đầu: {editingRoom && dayjs(editingRoom.operationalFrom).format('DD/MM/YYYY HH:mm')}{editingRoom?.operationalUntil ? ` · Kết thúc: ${dayjs(editingRoom.operationalUntil).format('DD/MM/YYYY HH:mm')}` : ' · Không giới hạn ngày kết thúc'}</p>
            {editingRoom?.operationalStatus && editingRoom.operationalStatus !== 'SCHEDULED' && <Button danger={editingRoom.operationalStatus === 'OPERATING'} loading={updateRoom.isPending} onClick={() => {
              const room = editingRoom
              const active = room.operationalStatus === 'STOPPED'
              modal.confirm({ title: active ? 'Đưa phòng vào sử dụng lại?' : 'Ngừng phục vụ phòng này?', content: 'Thay đổi thời gian phục vụ; không thay đổi trạng thái sẵn sàng.', okText: 'Xác nhận', cancelText: 'Hủy', onOk: async () => {
                try { await updateRoom.mutateAsync({ roomId: room.id, payload: { active } }); setEditingRoom(null); message.success('Đã cập nhật vận hành') }
                catch (error) { message.error(error instanceof Error ? error.message : 'Không cập nhật được phòng'); throw error }
              } })
            }}>{editingRoom.operationalStatus === 'STOPPED' ? 'Đưa vào sử dụng lại' : 'Ngừng phục vụ'}</Button>}
          </section>
          <Form.Item label="Trạng thái phòng" name="status" help="Sẵn sàng đón khách hoặc chưa sẵn sàng; không thay đổi thời gian phục vụ."><Select options={roomReadinessOptions} /></Form.Item>
        </Form> },
          { key: 'amenities', label: 'Tiện ích riêng của phòng', children: editingRoom && <div>
            <p className="text-sm text-[#526760] mb-4">Chỉ bổ sung cho phòng {editingRoom.roomNumber}. Tiện ích chung của hạng phòng được hiển thị để đối chiếu.</p>
            <HotelAmenitiesManager hotelId={hotelId} roomId={editingRoom.id} roomNumber={editingRoom.roomNumber} roomTypeId={editingRoom.roomTypeId} roomTypeName={roomTypes.find((type) => type.id === editingRoom.roomTypeId)?.name} />
          </div> },
        ]} />
      </Modal>

      {selectedDetailId && (detailRoomType ? <RoomTypeDetailsModal
        hotelId={hotelId}
        roomType={detailRoomType}
        readOnly={profileLocked}
        onClose={closeDetails}
        onEdit={() => { closeDetails(); editType(detailRoomType, 'info') }}
        onAmenities={() => { closeDetails(); editType(detailRoomType, 'amenities') }}
        onViewRooms={() => { closeDetails(); setSelectedRoomTypeId(detailRoomType.id); setCurrentPage(0); setActiveTab('rooms') }}
      /> : <Modal open title="Chi tiết hạng phòng" onCancel={closeDetails} footer={<Button onClick={closeDetails}>Đóng</Button>}>
        {roomTypesQuery.isPending ? <PageLoading /> : roomTypesQuery.isError ? <ErrorState error={roomTypesQuery.error} onRetry={() => void roomTypesQuery.refetch()} /> : <EmptyState title="Không tìm thấy hạng phòng" description="Hạng phòng không tồn tại trong khách sạn này." />}
      </Modal>)}
      {/* Modal chỉnh sửa loại phòng */}
      <EditRoomTypeModal
        initialTab={editTypeTab}
        open={Boolean(editingRoomType) && !profileLocked}
        roomType={editingRoomType}
        hotelId={hotelId}
        onClose={() => setEditingRoomType(null)}
      />
    </div>
  )
}
