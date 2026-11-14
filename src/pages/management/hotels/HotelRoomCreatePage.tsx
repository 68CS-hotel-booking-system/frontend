import { useMemo, useState } from 'react'
import '@/shared/styles/management-pricing.css'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Alert,
  App,
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Segmented,
  Select,
  Switch,
} from 'antd'
import { useNavigate, useSearchParams } from 'react-router'
import { ArrowLeftOutlined, BuildOutlined, AppstoreAddOutlined, SaveOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useHotelWorkspace } from '@/features/hotels'
import { PageHeader } from '@/shared/ui/PageHeader'
import { formatCurrencyAmount } from '@/shared/lib/format'
import {
  roomReadinessOptions,
  useManagementRoomMutations,
  useManagementRoomTypesQuery,
  type UpdateRoomTypePayload,
} from '@/features/rooms'

// Schema cho Tạo Phòng Vật Lý (HT20)
const createPhysicalRoomSchema = z.object({
  roomNumber: z.string().trim().min(1, 'Số phòng không được để trống').max(20, 'Số phòng tối đa 20 ký tự'),
  roomTypeId: z.string().uuid('Vui lòng chọn loại phòng'),
  floor: z.string().trim().max(20, 'Tầng tối đa 20 ký tự').optional(),
  operationMode: z.enum(['now', 'scheduled']),
  readiness: z.enum(['ready', 'dirty']),
  operationalFrom: z.custom<dayjs.Dayjs>((value) => dayjs.isDayjs(value) && value.isValid(), 'Vui lòng chọn ngày bắt đầu phục vụ').nullish(),
  operationalUntil: z.custom<dayjs.Dayjs>((value) => dayjs.isDayjs(value) && value.isValid(), 'Ngày kết thúc không hợp lệ').nullish(),
}).superRefine((values, ctx) => {
  if (values.operationMode === 'scheduled' && (!values.operationalFrom || !values.operationalFrom.isAfter(dayjs()))) ctx.addIssue({ code: 'custom', path: ['operationalFrom'], message: 'Chọn thời điểm phục vụ trong tương lai' })
  const from = values.operationMode === 'scheduled' ? values.operationalFrom : dayjs()
  if (values.operationalUntil && from && !values.operationalUntil.isAfter(from)) ctx.addIssue({ code: 'custom', path: ['operationalUntil'], message: 'Thời điểm kết thúc phải sau thời điểm bắt đầu' })
})

type CreatePhysicalRoomFormValues = z.infer<typeof createPhysicalRoomSchema>

// Schema cho Tạo Loại Phòng (HT16 + Cấu hình bổ sung)
const createRoomTypeSchema = z.object({
  name: z.string().trim().min(1, 'Tên loại phòng không được để trống').max(100, 'Tên loại phòng tối đa 100 ký tự'),
  description: z.string().trim().max(1000, 'Mô tả tối đa 1000 ký tự').optional().or(z.literal('')),
  maxAdults: z.number({ message: 'Vui lòng nhập số người lớn' }).int().min(1, 'Tối thiểu 1 người lớn').max(32767, 'Vượt quá giới hạn cho phép'),
  maxChildren: z.number({ message: 'Vui lòng nhập số trẻ em' }).int().min(0, 'Số trẻ em không được âm').max(32767, 'Vượt quá giới hạn cho phép'),
  basePrice: z
    .number()
    .int('Giá cơ bản phải là số nguyên')
    .min(0, 'Giá cơ bản không được âm')
    .max(Number.MAX_SAFE_INTEGER, 'Giá quá lớn')
    .nullable()
    .optional(),
  active: z.boolean(),
})

type CreateRoomTypeFormValues = z.infer<typeof createRoomTypeSchema>

export function HotelRoomCreatePage() {
  const { hotel, hotelId } = useHotelWorkspace()
  const { message } = App.useApp()
  const navigate = useNavigate()
  const { createRoom, createRoomType, updateRoomType } = useManagementRoomMutations(hotelId)
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') === 'room-type' ? 'room-type' : 'room'
  const [activeTab, setActiveTab] = useState<'room' | 'room-type'>(initialTab)

  const roomTypesQuery = useManagementRoomTypesQuery(hotelId)
  const roomTypes = useMemo(() => roomTypesQuery.data ?? [], [roomTypesQuery.data])

  // Trạng thái theo dõi luồng tạo 2 bước cho loại phòng
  const [createdRoomTypeId, setCreatedRoomTypeId] = useState<string | null>(null)
  const [roomTypeError, setRoomTypeError] = useState<string | null>(null)
  const [isSubmittingRoomType, setIsSubmittingRoomType] = useState(false)

  // Form 1: Tạo phòng vật lý
  const roomForm = useForm<CreatePhysicalRoomFormValues>({
    resolver: zodResolver(createPhysicalRoomSchema),
    defaultValues: {
      roomNumber: '',
      roomTypeId: searchParams.get('roomTypeId') ?? '',
      operationMode: 'now',
      readiness: 'ready',
      floor: '',
      operationalFrom: null,
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
      maxChildren: 0,
      basePrice: null,
      active: true,
    },
  })

  // Theo dõi số người để hiển thị tóm tắt sức chứa thân thiện
  const watchedAdults = useWatch({ control: roomTypeForm.control, name: 'maxAdults' }) ?? 2
  const watchedChildren = useWatch({ control: roomTypeForm.control, name: 'maxChildren' }) ?? 0
  const totalOccupancy = watchedAdults + watchedChildren
  const watchedBasePrice = useWatch({ control: roomTypeForm.control, name: 'basePrice' })
  const watchedActive = useWatch({ control: roomTypeForm.control, name: 'active' })

  const operationMode = useWatch({ control: roomForm.control, name: 'operationMode' })
  const chosenTypeId = useWatch({ control: roomForm.control, name: 'roomTypeId' })
  const chosenType = roomTypes.find((type) => type.id === chosenTypeId)

  if (!hotel) return null

  const breadcrumbItems = [
    { label: 'Phòng', to: `/hotels/${hotelId}/rooms` },
    { label: activeTab === 'room' ? 'Thêm phòng vật lý' : 'Tạo hạng phòng' },
  ]

  // Submit tạo phòng vật lý
  const onSubmitRoom = async (values: CreatePhysicalRoomFormValues) => {
    try {
      const fromDate = values.operationMode === 'scheduled' ? values.operationalFrom?.toISOString() : undefined
      const untilDate = values.operationalUntil ? dayjs(values.operationalUntil).toISOString() : undefined

      await createRoom.mutateAsync({
        roomTypeId: values.roomTypeId,
        roomNumber: values.roomNumber.trim(),
        floor: values.floor?.trim() || undefined,
        operationalFrom: fromDate,
        operationalUntil: untilDate,
        readiness: values.readiness === 'ready' ? 'READY' : 'DIRTY',
      })

      message.success(`Đã tạo phòng ${values.roomNumber} thành công!`)
      navigate(`/hotels/${hotelId}/rooms?roomTypeId=${values.roomTypeId}`)
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Tạo phòng vật lý thất bại.')
    }
  }

  // Submit tạo loại phòng (luồng 2 bước mượt mà trong 1 lần nhấn)
  const onSubmitRoomType = async (values: CreateRoomTypeFormValues) => {
    setIsSubmittingRoomType(true)
    setRoomTypeError(null)

    let targetRoomTypeId = createdRoomTypeId

    try {
      // BƯỚC 1: Gọi POST nếu loại phòng chưa được tạo trước đó
      if (!targetRoomTypeId) {
        const created = await createRoomType.mutateAsync({
          name: values.name.trim(),
          description: values.description?.trim() || undefined,
          maxAdults: values.maxAdults,
          maxChildren: values.maxChildren,
        })
        targetRoomTypeId = created.id
        setCreatedRoomTypeId(created.id)
      }

      // BƯỚC 2: Gọi PATCH cấu hình bổ sung (sức chứa tổng đã duyệt, trạng thái mở bán, giá cơ bản nếu có)
      const patchPayload: UpdateRoomTypePayload = {
        name: values.name.trim(),
        description: values.description?.trim() || undefined,
        maxAdults: values.maxAdults,
        maxChildren: values.maxChildren,
        maxOccupancy: totalOccupancy,
        active: values.active,
      }

      if (values.basePrice !== null && values.basePrice !== undefined) {
        patchPayload.basePrice = values.basePrice
      }

      await updateRoomType.mutateAsync({
        roomTypeId: targetRoomTypeId,
        payload: patchPayload,
      })

      message.success(`Đã tạo và thiết lập loại phòng "${values.name}" thành công!`)
      navigate(`/hotels/${hotelId}/rooms/new?tab=room&roomTypeId=${targetRoomTypeId}`)
      roomForm.setValue('roomTypeId', targetRoomTypeId)
      setActiveTab('room')
    } catch (error) {
      if (targetRoomTypeId) {
        setRoomTypeError(
          'Loại phòng đã được tạo trong hệ thống, nhưng chưa hoàn tất lưu giá cơ bản hoặc trạng thái mở bán. Vui lòng kiểm tra và bấm "Thử lại lưu cấu hình".',
        )
      } else {
        setRoomTypeError(error instanceof Error ? error.message : 'Tạo loại phòng thất bại.')
      }
    } finally {
      setIsSubmittingRoomType(false)
    }
  }

  return (
    <div className="hotel-room-create-page w-full max-w-4xl space-y-6">
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        kicker="QUẢN LÝ PHÒNG &amp; HẠNG PHÒNG"
        title={activeTab === 'room' ? 'Thêm phòng vật lý' : 'Tạo hạng phòng'}
        description={
          activeTab === 'room'
            ? 'Khởi tạo các số phòng thực tế (ví dụ: 101, 102...) và gán vào một hạng phòng đã có trong khách sạn.'
            : 'Định nghĩa tên hạng phòng, sức chứa lưu trú, giá cơ bản và trạng thái mở bán kinh doanh.'
        }
        extra={
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(`/hotels/${hotelId}/rooms`)}
            className="!rounded-xl"
          >
            Quay lại danh sách
          </Button>
        }
      />

      <div className="max-w-md">
        <Segmented block value={activeTab} disabled={isSubmittingRoomType || roomForm.formState.isSubmitting}
          onChange={(value) => { setActiveTab(value as 'room' | 'room-type'); setSearchParams({ tab: value }) }}
          options={[{ label: 'Phòng vật lý', value: 'room', icon: <BuildOutlined /> }, { label: 'Hạng phòng', value: 'room-type', icon: <AppstoreAddOutlined /> }]} />
      </div>

      {activeTab === 'room' ? (
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#dce7e3]">
          {roomTypesQuery.isPending ? <p role="status">Đang tải hạng phòng…</p> : roomTypesQuery.isError ? <Alert type="error" title="Chưa tải được hạng phòng" action={<Button onClick={() => void roomTypesQuery.refetch()}>Thử lại</Button>} /> : roomTypes.length === 0 ? (
            <div className="py-8 text-center bg-[#f7fbfa] rounded-xl border border-dashed border-[#dce7e3]">
              <p className="text-sm font-semibold text-[#12211d] mb-1">
                Khách sạn chưa có loại phòng nào
              </p>
              <p className="text-xs text-[#5f736e] max-w-md mx-auto mb-4">
                Bạn cần tạo ít nhất một hạng phòng (ví dụ: Phòng Deluxe, Standard...) trước khi tạo các số phòng vật lý thực tế.
              </p>
              <Button
                type="primary"
                onClick={() => {
                  setActiveTab('room-type')
                  setSearchParams({ tab: 'room-type' })
                }}
                className="!bg-[#0b5f53]"
              >
                Chuyển sang tạo loại phòng ngay
              </Button>
            </div>
          ) : (
            <Form layout="vertical" onFinish={roomForm.handleSubmit(onSubmitRoom)}>
              {chosenType && <Alert style={{ marginBottom: 20, background: '#eff9f5', borderColor: '#cfe5dd', color: '#12211d' }} type="info" showIcon title={`Tạo phòng thuộc hạng: ${chosenType.name}`} description="Phòng kế thừa giá cơ bản và tiện ích chung của hạng này. Tiện ích riêng có thể bổ sung sau." />}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Form.Item
                  label="Hạng phòng"
                  required
                  validateStatus={roomForm.formState.errors.roomTypeId ? 'error' : undefined}
                  help={roomForm.formState.errors.roomTypeId?.message}
                >
                  <Controller
                    control={roomForm.control}
                    name="roomTypeId"
                    render={({ field }) => (
                      <Select
                        {...field}
                        placeholder="Chọn loại phòng"
                        options={roomTypes.filter((type) => type.active).map((rt) => ({
                          value: rt.id,
                          label: `${rt.name} (${rt.maxAdults} người lớn, ${rt.maxChildren} trẻ em)`,
                        }))}
                      />
                    )}
                  />
                </Form.Item>

                <Form.Item
                  label="Số phòng"
                  required
                  validateStatus={roomForm.formState.errors.roomNumber ? 'error' : undefined}
                  help={roomForm.formState.errors.roomNumber?.message}
                >
                  <Controller
                    control={roomForm.control}
                    name="roomNumber"
                    render={({ field }) => (
                      <Input {...field} placeholder="VD: 101, 102, 201..." maxLength={20} />
                    )}
                  />
                </Form.Item>
              </div>

              <Form.Item label="Bắt đầu phục vụ"><Controller control={roomForm.control} name="operationMode" render={({ field }) => <Segmented {...field} options={[{ value: 'now', label: 'Ngay bây giờ' }, { value: 'scheduled', label: 'Lên lịch' }]} />} /></Form.Item>
              <Form.Item label="Trạng thái phòng" help="Sẵn sàng đón khách độc lập với thời gian đưa phòng vào phục vụ."><Controller control={roomForm.control} name="readiness" render={({ field }) => <Select {...field} options={roomReadinessOptions} />} /></Form.Item>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Form.Item
                  label="Tầng"
                  validateStatus={roomForm.formState.errors.floor ? 'error' : undefined}
                  help={roomForm.formState.errors.floor?.message}
                >
                  <Controller
                    control={roomForm.control}
                    name="floor"
                    render={({ field }) => (
                      <Input {...field} placeholder="VD: 1, 2, 3..." maxLength={20} />
                    )}
                  />
                </Form.Item>

                {operationMode === 'scheduled' && <Form.Item
                  label="Thời điểm bắt đầu phục vụ"
                  required
                  validateStatus={roomForm.formState.errors.operationalFrom ? 'error' : undefined}
                  help={roomForm.formState.errors.operationalFrom?.message}
                >
                  <Controller
                    control={roomForm.control}
                    name="operationalFrom"
                    render={({ field }) => (
                      <DatePicker
                        className="w-full"
                        showTime format="DD/MM/YYYY HH:mm"
                        value={field.value}
                        onChange={(date) => field.onChange(date)}
                      />
                    )}
                  />
                </Form.Item>}

                <Form.Item
                  label="Thời điểm kết thúc phục vụ (tùy chọn)"
                  validateStatus={roomForm.formState.errors.operationalUntil ? 'error' : undefined}
                  help={roomForm.formState.errors.operationalUntil?.message}
                >
                  <Controller
                    control={roomForm.control}
                    name="operationalUntil"
                    render={({ field }) => (
                      <DatePicker
                        className="w-full"
                        showTime format="DD/MM/YYYY HH:mm"
                        placeholder="Để trống nếu vô thời hạn"
                        value={field.value}
                        onChange={(date) => field.onChange(date)}
                      />
                    )}
                  />
                </Form.Item>
              </div>

              <div className="pt-4 border-t border-[#dce7e3] flex flex-wrap justify-end gap-3">
                <Button onClick={() => navigate(`/hotels/${hotelId}/rooms`)}>
                  Hủy
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={roomForm.formState.isSubmitting || createRoom.isPending}
                  icon={<SaveOutlined />}
                  disabled={roomTypes.length === 0}
                  className="!bg-[#0b5f53]"
                >
                  Tạo phòng vật lý
                </Button>
              </div>
            </Form>
          )}
        </div>
      ) : (
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#dce7e3]">
          {roomTypeError && (
            <Alert
              type="error"
              showIcon
              closable
              onClose={() => setRoomTypeError(null)}
              title="Hạng phòng chưa hoàn tất cấu hình"
              description={roomTypeError}
              className="mb-4"
            />
          )}

          <Form layout="vertical" onFinish={roomTypeForm.handleSubmit(onSubmitRoomType)} aria-busy={isSubmittingRoomType}>
            <h2 className="mb-4 !text-base font-semibold text-[#12211d]">Thông tin & sức chứa</h2>
            <Form.Item
              label="Tên hạng phòng" htmlFor="create-room-type-name"
              required
              validateStatus={roomTypeForm.formState.errors.name ? 'error' : undefined}
              help={roomTypeForm.formState.errors.name?.message}
            >
              <Controller
                control={roomTypeForm.control}
                name="name"
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Ví dụ: Deluxe hướng biển"
                    id="create-room-type-name"
                    aria-label="Tên hạng phòng"
                    maxLength={100}
                    disabled={isSubmittingRoomType}
                  />
                )}
              />
            </Form.Item>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Form.Item
                label="Số người lớn tối đa" htmlFor="create-room-type-adults"
                required
                validateStatus={roomTypeForm.formState.errors.maxAdults ? 'error' : undefined}
                help={roomTypeForm.formState.errors.maxAdults?.message}
              >
                <Controller
                  control={roomTypeForm.control}
                  name="maxAdults"
                  render={({ field }) => (
                    <InputNumber
                      id="create-room-type-adults"
                      min={1}
                      max={32767}
                      className="w-full"
                      value={field.value}
                      onChange={(val) => field.onChange(val ?? 1)}
                      disabled={isSubmittingRoomType}
                    />
                  )}
                />
              </Form.Item>

              <Form.Item
                label="Số trẻ em tối đa" htmlFor="create-room-type-children"
                required
                validateStatus={roomTypeForm.formState.errors.maxChildren ? 'error' : undefined}
                help={roomTypeForm.formState.errors.maxChildren?.message}
              >
                <Controller
                  control={roomTypeForm.control}
                  name="maxChildren"
                  render={({ field }) => (
                    <InputNumber
                      id="create-room-type-children"
                      min={0}
                      max={32767}
                      className="w-full"
                      value={field.value}
                      onChange={(val) => field.onChange(val ?? 0)}
                      disabled={isSubmittingRoomType}
                    />
                  )}
                />
              </Form.Item>
            </div>

            {/* Dòng tóm tắt sức chứa tự động theo quy tắc đã được duyệt */}
            <div className="mb-6 text-sm text-[#5f736e]">
              Tối đa <strong>{watchedAdults} người lớn</strong> và <strong>{watchedChildren} trẻ em</strong> (Sức chứa tổng: {totalOccupancy} khách)
            </div>

            <div className="mb-5 border-t border-[#dce7e3] pt-5">
              <h2 className="mb-1 !text-base font-semibold text-[#12211d]">Giá cơ bản & trạng thái</h2>
              <p className="mb-4 text-sm leading-relaxed text-[#5f736e]">Giá cho một phòng mỗi đêm. Các ngày chưa đặt giá riêng sẽ dùng mức giá này.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Form.Item
                label="Giá cơ bản (VND / phòng / đêm)" htmlFor="create-room-type-base-price"
                validateStatus={roomTypeForm.formState.errors.basePrice ? 'error' : undefined}
                help={
                  roomTypeForm.formState.errors.basePrice?.message ??
                  'Bạn có thể chỉnh lại giá cơ bản sau khi tạo hạng phòng.'
                }
              >
                <Controller
                  control={roomTypeForm.control}
                  name="basePrice"
                  render={({ field }) => (
                    <InputNumber
                      controls={false}
                      keyboard={false}
                      changeOnWheel={false}
                      inputMode="numeric"
                      id="create-room-type-base-price"
                      min={0}
                      max={Number.MAX_SAFE_INTEGER}
                      precision={0}
                      formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(val) => (val ? Number(val.replace(/\$\s?|(,*)/g, '')) : (null as unknown as number))}
                      suffix="VND"
                      placeholder="Nhập giá cơ bản"
                      className="w-full"
                      value={field.value}
                      onChange={(val) => field.onChange(val)}
                      disabled={isSubmittingRoomType}
                    />
                  )}
                />
              </Form.Item>

              <Form.Item label="Trạng thái hạng phòng">
                <label htmlFor="create-room-type-active" className="inline-flex min-h-11 cursor-pointer items-center gap-3">
                  <Controller
                    control={roomTypeForm.control}
                    name="active"
                    render={({ field }) => (
                      <Switch
                        id="create-room-type-active"
                        checked={field.value}
                        onChange={field.onChange}
                        aria-label="Cho phép mở bán hạng phòng"
                        disabled={isSubmittingRoomType}
                      />
                    )}
                  />
                  <span className="text-sm text-[#344a44]">{watchedActive ? 'Mở bán' : 'Tạm ngưng'}</span>
                </label>
              </Form.Item>
            </div>

            <div className="rounded-xl bg-[#f4f8f7] p-4 text-sm">
              <div className="flex flex-wrap justify-between gap-2">
                <span className="font-medium text-[#344a44]">Giá mặc định trên lịch</span>
                <strong className="tabular-nums text-[#12211d]">{(watchedBasePrice ?? 0) > 0 ? `${formatCurrencyAmount(watchedBasePrice!, 'VND')} / đêm` : 'Chưa thiết lập'}</strong>
              </div>
              <p className="mb-0 mt-2 leading-relaxed text-[#5f736e]">Sau khi tạo, vào <strong>Giá & Tồn kho</strong> để xem lịch 7 ngày hoặc đặt giá riêng cho ngày lễ, cuối tuần.</p>
              {watchedActive && !(watchedBasePrice && watchedBasePrice > 0) && <p className="mb-0 mt-2 text-[#8a5a00]">Chưa có giá cơ bản: mỗi đêm muốn bán cần được đặt giá riêng hợp lệ.</p>}
            </div>
            </div>

            <Form.Item
              label="Mô tả hạng phòng (không bắt buộc)" htmlFor="create-room-type-description"
              validateStatus={roomTypeForm.formState.errors.description ? 'error' : undefined}
              help={roomTypeForm.formState.errors.description?.message}
            >
              <Controller
                control={roomTypeForm.control}
                name="description"
                render={({ field }) => (
                  <Input.TextArea
                    id="create-room-type-description"
                    {...field}
                    rows={4}
                    placeholder="Mô tả không gian, loại giường, diện tích m2 và các tiện ích đặc trưng của hạng phòng..."
                    maxLength={1000}
                    showCount
                    disabled={isSubmittingRoomType}
                  />
                )}
              />
            </Form.Item>

            <div className="pt-4 border-t border-[#dce7e3] flex flex-wrap justify-end gap-3">
              <Button onClick={() => navigate(`/hotels/${hotelId}/rooms`)} disabled={isSubmittingRoomType}>
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isSubmittingRoomType}
                className="!bg-[#0b5f53]"
              >
                {createdRoomTypeId ? 'Thử lại lưu cấu hình' : 'Tạo hạng phòng'}
              </Button>
            </div>
          </Form>
        </div>
      )}
    </div>
  )
}
