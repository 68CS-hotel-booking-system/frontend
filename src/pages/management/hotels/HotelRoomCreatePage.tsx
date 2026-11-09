import { useState } from 'react'
import { useDataMode } from '@/shared/lib/data-mode-context'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  message,
} from 'antd'
import { useNavigate, useSearchParams } from 'react-router'
import { ArrowLeftOutlined, BuildOutlined, AppstoreAddOutlined, SaveOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useHotelWorkspace } from '@/features/hotels'
import { ErrorState } from '@/shared/ui/ErrorState'
import { EmptyState } from '@/shared/ui/EmptyState'
import { PageHeader } from '@/shared/ui/PageHeader'
import {
  useManagementRoomMutations,
  useManagementRoomTypesQuery,
} from '@/features/rooms'

// Schema cho Tạo Phòng Vật Lý (HT20)
const createPhysicalRoomSchema = z.object({
  roomNumber: z.string().min(1, 'Số phòng không được để trống').max(20, 'Số phòng tối đa 20 ký tự'),
  roomTypeId: z.string().uuid('Vui lòng chọn loại phòng'),
  floor: z.string().max(20, 'Tầng tối đa 20 ký tự').optional(),
  operationalFrom: z.any().refine((val) => Boolean(val), 'Vui lòng chọn ngày bắt đầu phục vụ'),
  operationalUntil: z.any().optional(),
})

type CreatePhysicalRoomFormValues = z.infer<typeof createPhysicalRoomSchema>

// Schema cho Tạo Loại Phòng (HT16)
const createRoomTypeSchema = z.object({
  name: z.string().min(1, 'Tên loại phòng không được để trống').max(100, 'Tên quá dài'),
  description: z.string().max(500, 'Mô tả tối đa 500 ký tự').optional(),
  maxAdults: z.number().int().min(1, 'Tối thiểu 1 người lớn').max(10, 'Tối đa 10 người lớn'),
  maxChildren: z.number().int().min(0, 'Tối thiểu 0 trẻ em').max(10, 'Tối đa 10 trẻ em'),
})

type CreateRoomTypeFormValues = z.infer<typeof createRoomTypeSchema>

export function HotelRoomCreatePage() {
  const { hotel, hotelId } = useHotelWorkspace()
  const { mode } = useDataMode()
  const navigate = useNavigate()
  const { createRoom, createRoomType } = useManagementRoomMutations(hotelId)
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') === 'room-type' ? 'room-type' : 'room'
  const [activeTab, setActiveTab] = useState<'room' | 'room-type'>(initialTab)

  const roomTypesQuery = useManagementRoomTypesQuery(hotelId, mode === 'api')
  const roomTypes = roomTypesQuery.data ?? []

  // Form 1: Tạo phòng vật lý
  const roomForm = useForm<CreatePhysicalRoomFormValues>({
    resolver: zodResolver(createPhysicalRoomSchema),
    defaultValues: {
      roomNumber: '',
      roomTypeId: roomTypes[0]?.id || '',
      floor: '1',
      operationalFrom: dayjs(),
      operationalUntil: null,
    },
  })

  // Form 2: Tạo loại phòng
  const roomTypeForm = useForm<CreateRoomTypeFormValues>({
    resolver: zodResolver(createRoomTypeSchema),
    defaultValues: {
      name: '',
      description: '',
      maxAdults: 2,
      maxChildren: 1,
    },
  })

  if (!hotel) return null
  if (mode === 'mock') return <EmptyState title="Quản lý phòng dùng API thật" description="Chuyển sang nguồn API để xem và quản lý phòng. Chế độ mẫu chưa mô phỏng các thao tác này." />

  const breadcrumbItems = [
    { label: 'Khách sạn', to: '/hotels' },
    { label: hotel.name, to: `/hotels/${hotelId}` },
    { label: 'Phòng', to: `/hotels/${hotelId}/rooms` },
    { label: activeTab === 'room' ? 'Thêm phòng mới' : 'Thêm loại phòng mới' },
  ]

  const onSubmitRoom = async (values: CreatePhysicalRoomFormValues) => {
    try {
      const fromDate = dayjs(values.operationalFrom).toISOString()
      const untilDate = values.operationalUntil ? dayjs(values.operationalUntil).toISOString() : undefined

      await createRoom.mutateAsync({
        roomTypeId: values.roomTypeId,
        roomNumber: values.roomNumber.trim(),
        floor: values.floor?.trim() || undefined,
        operationalFrom: fromDate,
        operationalUntil: untilDate,
      })

      message.success(`Đã tạo phòng ${values.roomNumber} thành công!`)
      navigate(`/hotels/${hotelId}/rooms`)
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Tạo phòng vật lý thất bại.')
    }
  }

  const onSubmitRoomType = async (values: CreateRoomTypeFormValues) => {
    try {
      await createRoomType.mutateAsync(values)
      message.success('Đã tạo loại phòng mới thành công!')
      navigate(`/hotels/${hotelId}/rooms`)
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Tạo loại phòng thất bại.')
    }
  }

  return (
    <div className="hotel-room-create-page max-w-3xl space-y-6">
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        kicker="QUẢN LÝ PHÒNG"
        title={activeTab === 'room' ? 'Thêm phòng vật lý mới' : 'Thêm hạng / loại phòng mới'}
        description={
          activeTab === 'room'
            ? 'Tạo số phòng cụ thể gắn với tầng và hạng phòng để đưa vào phục vụ đón khách lưu trú.'
            : 'Định nghĩa tên hạng phòng, số lượng người lớn và trẻ em tối đa có thể lưu trú.'
        }
        extra={
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(`/hotels/${hotelId}/rooms`)}
          >
            Quay lại danh sách
          </Button>
        }
      />

      {/* Bộ chuyển đổi giữa Tạo phòng vật lý và Tạo loại phòng */}
      <div className="bg-white p-3 rounded-2xl border border-[#dce7e3] flex items-center justify-between">
        <Radio.Group
          value={activeTab}
          onChange={(e) => {
            const next = e.target.value as 'room' | 'room-type'
            setActiveTab(next)
            setSearchParams({ tab: next })
          }}
          buttonStyle="solid"
          size="middle"
        >
          <Radio.Button value="room" className="!rounded-l-lg">
            <BuildOutlined className="mr-1.5" /> Thêm phòng vật lý
          </Radio.Button>
          <Radio.Button value="room-type" className="!rounded-r-lg">
            <AppstoreAddOutlined className="mr-1.5" /> Thêm loại phòng mới
          </Radio.Button>
        </Radio.Group>
      </div>

      {activeTab === 'room' && roomTypesQuery.isError && <ErrorState error={roomTypesQuery.error} onRetry={() => void roomTypesQuery.refetch()} />}
      {activeTab === 'room' ? (
        <div className="bg-white p-6 rounded-2xl border border-[#dce7e3] shadow-xs">
          <Form layout="vertical" onFinish={roomForm.handleSubmit(onSubmitRoom)}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Form.Item
                label="Số phòng / Tên phòng"
                required
                validateStatus={roomForm.formState.errors.roomNumber ? 'error' : undefined}
                help={roomForm.formState.errors.roomNumber?.message}
              >
                <Input
                  placeholder="VD: 101, P.202, VILLA-01..."
                  maxLength={20}
                  {...roomForm.register('roomNumber')}
                />
              </Form.Item>

              <Form.Item
                label="Tầng"
                validateStatus={roomForm.formState.errors.floor ? 'error' : undefined}
                help={roomForm.formState.errors.floor?.message}
              >
                <Input
                  placeholder="VD: 1, 2, 3, Tầng trệt..."
                  maxLength={20}
                  {...roomForm.register('floor')}
                />
              </Form.Item>
            </div>

            <Form.Item
              label="Hạng / Loại phòng"
              required
              validateStatus={roomForm.formState.errors.roomTypeId ? 'error' : undefined}
              help={roomForm.formState.errors.roomTypeId?.message}
            >
              <Controller
                control={roomForm.control}
                name="roomTypeId"
                render={({ field }) => (
                  <Select
                    placeholder="Chọn hạng phòng cho phòng này"
                    value={field.value || undefined}
                    onChange={field.onChange}
                    loading={roomTypesQuery.isPending}
                    options={roomTypes.map((rt) => ({
                      value: rt.id,
                      label: `${rt.name} (${rt.maxAdults} người lớn, ${rt.maxChildren} trẻ em)`,
                    }))}
                  />
                )}
              />
              {roomTypes.length === 0 && !roomTypesQuery.isPending && (
                <div className="text-xs text-orange-600 mt-1.5">
                  Khách sạn chưa có loại phòng nào. Bạn hãy chuyển sang tab{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab('room-type')}
                    className="font-bold underline text-[#0b5f53] cursor-pointer"
                  >
                    "Thêm loại phòng mới"
                  </button>{' '}
                  để tạo trước.
                </div>
              )}
            </Form.Item>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Form.Item
                label="Thời điểm bắt đầu phục vụ"
                required
                validateStatus={roomForm.formState.errors.operationalFrom ? 'error' : undefined}
                help={roomForm.formState.errors.operationalFrom?.message as string | undefined}
              >
                <Controller
                  control={roomForm.control}
                  name="operationalFrom"
                  render={({ field }) => (
                    <DatePicker
                      className="w-full"
                      format="DD/MM/YYYY"
                      value={field.value ? dayjs(field.value) : undefined}
                      onChange={(date) => field.onChange(date)}
                    />
                  )}
                />
              </Form.Item>

              <Form.Item
                label="Thời điểm kết thúc phục vụ (Tùy chọn)"
                validateStatus={roomForm.formState.errors.operationalUntil ? 'error' : undefined}
                help={roomForm.formState.errors.operationalUntil?.message as string | undefined}
              >
                <Controller
                  control={roomForm.control}
                  name="operationalUntil"
                  render={({ field }) => (
                    <DatePicker
                      className="w-full"
                      format="DD/MM/YYYY"
                      placeholder="Để trống nếu hoạt động vô thời hạn"
                      value={field.value ? dayjs(field.value) : undefined}
                      onChange={(date) => field.onChange(date)}
                    />
                  )}
                />
              </Form.Item>
            </div>

            <div className="pt-4 border-t border-[#dce7e3] flex justify-end gap-3">
              <Button onClick={() => navigate(`/hotels/${hotelId}/rooms`)}>
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={roomForm.formState.isSubmitting}
                icon={<SaveOutlined />}
                disabled={roomTypes.length === 0}
                className="!bg-[#0b5f53]"
              >
                Tạo phòng vật lý
              </Button>
            </div>
          </Form>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-2xl border border-[#dce7e3] shadow-xs">
          <Form layout="vertical" onFinish={roomTypeForm.handleSubmit(onSubmitRoomType)}>
            <p className="text-xs text-[#5f736e]">Backend tạo loại phòng với sức chứa tổng mặc định 2, chưa nhận tổng sức chứa hoặc giá cơ bản. Sau khi tạo, mở Chỉnh sửa để đặt sức chứa tổng và giá.</p>
            <Form.Item
              label="Tên loại phòng"
              required
              validateStatus={roomTypeForm.formState.errors.name ? 'error' : undefined}
              help={roomTypeForm.formState.errors.name?.message}
            >
              <Input
                placeholder="VD: Phòng Deluxe Hướng Biển, Phòng Suite Tổng Thống..."
                {...roomTypeForm.register('name')}
              />
            </Form.Item>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Form.Item
                label="Số người lớn tối đa"
                required
                validateStatus={roomTypeForm.formState.errors.maxAdults ? 'error' : undefined}
                help={roomTypeForm.formState.errors.maxAdults?.message}
              >
                <Controller
                  control={roomTypeForm.control}
                  name="maxAdults"
                  render={({ field }) => (
                    <InputNumber
                      min={1}
                      max={10}
                      className="w-full"
                      value={field.value}
                      onChange={(val) => field.onChange(val ?? 1)}
                    />
                  )}
                />
              </Form.Item>

              <Form.Item
                label="Số trẻ em tối đa"
                validateStatus={roomTypeForm.formState.errors.maxChildren ? 'error' : undefined}
                help={roomTypeForm.formState.errors.maxChildren?.message}
              >
                <Controller
                  control={roomTypeForm.control}
                  name="maxChildren"
                  render={({ field }) => (
                    <InputNumber
                      min={0}
                      max={10}
                      className="w-full"
                      value={field.value}
                      onChange={(val) => field.onChange(val ?? 0)}
                    />
                  )}
                />
              </Form.Item>
            </div>

            <Form.Item
              label="Mô tả loại phòng"
              validateStatus={roomTypeForm.formState.errors.description ? 'error' : undefined}
              help={roomTypeForm.formState.errors.description?.message}
            >
              <Input.TextArea
                rows={4}
                placeholder="Mô tả không gian, loại giường, diện tích m2 và các đặc điểm nổi bật..."
                {...roomTypeForm.register('description')}
              />
            </Form.Item>

            <div className="pt-4 border-t border-[#dce7e3] flex justify-end gap-3">
              <Button onClick={() => navigate(`/hotels/${hotelId}/rooms`)}>
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={roomTypeForm.formState.isSubmitting}
                icon={<SaveOutlined />}
                className="!bg-[#0b5f53]"
              >
                Tạo loại phòng
              </Button>
            </div>
          </Form>
        </div>
      )}
    </div>
  )
}
