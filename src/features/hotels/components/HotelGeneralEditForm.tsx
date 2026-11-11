import { useEffect, useId, useState } from 'react'
import {
  App as AntApp,
  Alert,
  Button,
  Input,
  InputNumber,
  Modal,
  Rate,
  Select,
} from 'antd'
import { Controller, useForm } from 'react-hook-form'
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CompassOutlined,
  CopyOutlined,
  SaveOutlined,
  ShopOutlined,
  UndoOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { useQueryClient } from '@tanstack/react-query'
import { SectionCard } from '@/shared/ui/SectionCard'
import { useDataMode } from '@/shared/lib/data-mode-context'
import { unsupportedApi } from '@/shared/api/unsupported-api'
import { hotelManagementKeys } from '../hooks/hotel-query-keys'
import type { CityItem, ManagementHotelDetail } from '../model/hotel'
import { HotelStatusBadge } from './HotelStatusBadge'

interface HotelGeneralEditFormProps {
  hotel: ManagementHotelDetail
  cities: CityItem[]
}

const CHECK_IN_CHIPS = ['13:00', '14:00', '15:00']
const CHECK_OUT_CHIPS = ['10:00', '11:00', '12:00']

export function HotelGeneralEditForm({ hotel, cities }: HotelGeneralEditFormProps) {
  const formId = useId()
  const { message } = AntApp.useApp()
  const queryClient = useQueryClient()
  const { mode } = useDataMode()
  const isApi = mode === 'api'
  const [copied, setCopied] = useState(false)

  // -------------------------------------------------------------
  // Form 1: Thông tin chung & nhận diện
  // -------------------------------------------------------------
  const formIdentity = useForm({
    defaultValues: {
      name: hotel.name,
      starRating: hotel.starRating,
      cityId: hotel.cityId,
      address: hotel.address,
      latitude: hotel.latitude,
      longitude: hotel.longitude,
    },
  })

  // -------------------------------------------------------------
  // Form 2: Quy định giờ lưu trú
  // -------------------------------------------------------------
  const formPolicies = useForm({
    defaultValues: {
      checkInTime: hotel.checkInTime ? hotel.checkInTime.slice(0, 5) : '14:00',
      checkOutTime: hotel.checkOutTime ? hotel.checkOutTime.slice(0, 5) : '12:00',
    },
  })

  // -------------------------------------------------------------
  // Form 3: Chủ sở hữu
  // -------------------------------------------------------------
  const formOwner = useForm({
    defaultValues: {
      ownerUserId: hotel.ownerUserId,
    },
  })

  // -------------------------------------------------------------
  // Form 4: Mô tả & điểm nổi bật
  // -------------------------------------------------------------
  const formDescription = useForm({
    defaultValues: {
      description: hotel.description ?? '',
    },
  })

  // Đồng bộ lại khi hotel props thay đổi
  useEffect(() => {
    formIdentity.reset({
      name: hotel.name,
      starRating: hotel.starRating,
      cityId: hotel.cityId,
      address: hotel.address,
      latitude: hotel.latitude,
      longitude: hotel.longitude,
    })
    formPolicies.reset({
      checkInTime: hotel.checkInTime ? hotel.checkInTime.slice(0, 5) : '14:00',
      checkOutTime: hotel.checkOutTime ? hotel.checkOutTime.slice(0, 5) : '12:00',
    })
    formOwner.reset({
      ownerUserId: hotel.ownerUserId,
    })
    formDescription.reset({
      description: hotel.description ?? '',
    })
  }, [hotel, formIdentity, formPolicies, formOwner, formDescription])

  // Helper cập nhật cache sau khi lưu thành công
  const updateCachedHotel = async (partial: Partial<ManagementHotelDetail>) => {
    if (isApi) return unsupportedApi('cập nhật hồ sơ khách sạn')
    queryClient.setQueryData(
      hotelManagementKeys.detail(mode, hotel.id),
      (prev: ManagementHotelDetail | undefined) => {
        if (!prev) return prev
        return { ...prev, ...partial }
      },
    )
  }

  // -------------------------------------------------------------
  // Handlers lưu độc lập cho từng Section
  // -------------------------------------------------------------
  const handleSaveIdentity = async (values: typeof formIdentity.formState.defaultValues) => {
    try {
      // TODO: API cập nhật thông tin khách sạn (BE hiện chưa có endpoint PUT /management/hotels/{hotelId})
      await updateCachedHotel({
        name: values?.name ?? hotel.name,
        starRating: values?.starRating ?? hotel.starRating,
        cityId: values?.cityId ?? hotel.cityId,
        cityName: cities.find((c) => c.id === values?.cityId)?.name ?? hotel.cityName,
        address: values?.address ?? hotel.address,
        latitude: values?.latitude ?? hotel.latitude,
        longitude: values?.longitude ?? hotel.longitude,
      })
      formIdentity.reset(values)
      message.success('Đã lưu thông tin định danh & vị trí khách sạn!')
    } catch {
      message.error('Không thể lưu thông tin khách sạn.')
    }
  }

  const handleSavePolicies = async (values: typeof formPolicies.formState.defaultValues) => {
    try {
      // TODO: API cập nhật giờ lưu trú (BE hiện chưa có endpoint PUT /management/hotels/{hotelId})
      await updateCachedHotel({
        checkInTime: `${values?.checkInTime ?? '14:00'}:00`,
        checkOutTime: `${values?.checkOutTime ?? '12:00'}:00`,
      })
      formPolicies.reset(values)
      message.success('Đã lưu quy định giờ nhận và trả phòng!')
    } catch {
      message.error('Không thể lưu quy định giờ lưu trú.')
    }
  }

  const handleSaveOwner = async (values: typeof formOwner.formState.defaultValues) => {
    try {
      await updateCachedHotel({
        ownerUserId: values?.ownerUserId ?? hotel.ownerUserId,
      })
      formOwner.reset(values)
      message.success('Đã lưu thông tin chủ sở hữu cơ sở!')
    } catch {
      message.error('Không thể lưu thông tin chủ sở hữu.')
    }
  }

  const handleSaveDescription = async (values: typeof formDescription.formState.defaultValues) => {
    try {
      await updateCachedHotel({
        description: values?.description ?? '',
      })
      formDescription.reset(values)
      message.success('Đã lưu đoạn mô tả và giới thiệu khách sạn!')
    } catch {
      message.error('Không thể lưu mô tả khách sạn.')
    }
  }

  const handleCopyOwnerId = (idToCopy: string) => {
    if (!idToCopy) return
    void navigator.clipboard.writeText(idToCopy)
    setCopied(true)
    message.success('Đã sao chép Owner User ID vào bộ nhớ tạm!')
    setTimeout(() => setCopied(false), 2000)
  }

  // Bất kỳ form nào đang có thay đổi chưa lưu
  const anyDirty =
    formIdentity.formState.isDirty ||
    formPolicies.formState.isDirty ||
    formOwner.formState.isDirty ||
    formDescription.formState.isDirty

  // Cảnh báo người dùng khi reload hoặc đóng tab nếu còn thay đổi chưa lưu
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (anyDirty) {
        e.preventDefault()
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [anyDirty])

  return (
    <div className="hotel-general-edit-form space-y-6">
      {isApi && <Alert type="info" showIcon title="Thông tin chỉ đọc: backend chưa có API cập nhật hồ sơ, chủ sở hữu và giờ lưu trú." />}
      <fieldset className="space-y-6" disabled={isApi} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
      {/* Banner cảnh báo thay đổi chưa lưu */}
      {anyDirty && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between text-xs text-amber-800">
          <span className="font-medium">
            ⚠️ Bạn đang có các chỉnh sửa chưa lưu trong các thẻ bên dưới. Hãy nhấn <strong>Lưu thay đổi</strong> ở từng mục trước khi rời trang.
          </span>
          <Button
            size="small"
            onClick={() => {
              Modal.confirm({
                title: 'Hủy toàn bộ thay đổi chưa lưu?',
                content: 'Các thông tin bạn vừa chỉnh sửa sẽ được hoàn tác về dữ liệu gốc từ máy chủ.',
                okText: 'Hủy thay đổi',
                okType: 'danger',
                onOk: () => {
                  formIdentity.reset()
                  formPolicies.reset()
                  formOwner.reset()
                  formDescription.reset()
                },
              })
            }}
          >
            Hủy tất cả
          </Button>
        </div>
      )}

      {/* SECTION 1: Thông tin chung & Nhận diện */}
      <form onSubmit={(e) => void formIdentity.handleSubmit(handleSaveIdentity)(e)}>
        <SectionCard
          id="identity-section"
          title="Thông tin chung &amp; Nhận diện"
          description="Tên thương hiệu, xếp hạng tiêu chuẩn sao, địa chỉ cơ sở và tọa độ GPS định vị chính xác."
          extra={<HotelStatusBadge status={hotel.status} />}
          footer={
            <>
              <span className="text-[11px] text-[#5f736e]">
                {formIdentity.formState.isDirty
                  ? 'Có thay đổi chưa lưu ở mục này'
                  : 'Dữ liệu đã được lưu'}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="middle"
                  icon={<UndoOutlined />}
                  disabled={!formIdentity.formState.isDirty}
                  onClick={() => formIdentity.reset()}
                >
                  Hoàn tác
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="middle"
                  icon={<SaveOutlined />}
                  disabled={!formIdentity.formState.isDirty}
                  className="disabled:!bg-[#f0f2f1] disabled:!text-[#8c9e99] disabled:!border-[#dce7e3] !bg-[#0b5f53] hover:!bg-[#08473e] !rounded-lg font-semibold"
                >
                  Lưu thông tin chung
                </Button>
              </div>
            </>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#12211d] mb-1.5">
                  Tên khách sạn <span className="text-rose-500">*</span>
                </label>
                <Controller
                  name="name"
                  control={formIdentity.control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      size="large"
                      prefix={<ShopOutlined className="text-[#5f736e]" />}
                      placeholder="Ví dụ: StayHub Grand Luxury Hotel"
                      className="rounded-lg"
                    />
                  )}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#12211d] mb-1.5">
                  Tỉnh / Thành phố <span className="text-rose-500">*</span>
                </label>
                <Controller
                  name="cityId"
                  control={formIdentity.control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      size="large"
                      showSearch
                      className="w-full"
                      optionFilterProp="label"
                      options={cities.map((c) => ({ value: c.id, label: c.name }))}
                    />
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#12211d] mb-1.5">
                  Địa chỉ chi tiết <span className="text-rose-500">*</span>
                </label>
                <Controller
                  name="address"
                  control={formIdentity.control}
                  render={({ field }) => (
                    <Input {...field} size="large" className="rounded-lg" />
                  )}
                />
              </div>

              <div>
                <label htmlFor={`${formId}-starRating`} className="block text-xs font-bold text-[#12211d] mb-1.5">
                  Tiêu chuẩn sao (1 - 5 sao)
                </label>
                <Controller
                  name="starRating"
                  control={formIdentity.control}
                  render={({ field }) => (
                    <div className="p-2 bg-[#f7fbfa] rounded-lg border border-[#dce7e3] flex items-center justify-between gap-3">
                      <InputNumber
                        id={`${formId}-starRating`}
                        min={1}
                        max={5}
                        value={field.value}
                        onChange={(val) => field.onChange(val)}
                        className="w-20 rounded-lg text-xs"
                      />
                      <Rate
                        value={field.value ?? undefined}
                        onChange={(val) => field.onChange(val)}
                        className="text-amber-500 text-sm"
                      />
                      <span className="text-xs font-bold text-[#0b5f53] shrink-0">
                        {field.value ? `${field.value} Sao` : 'Chưa xếp hạng'}
                      </span>
                    </div>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#eef4f2]">
              <div>
                <label className="block text-xs font-semibold text-[#5f736e] mb-1">
                  Vĩ độ GPS (Latitude)
                </label>
                <Controller
                  name="latitude"
                  control={formIdentity.control}
                  render={({ field }) => (
                    <InputNumber
                      {...field}
                      value={field.value ?? undefined}
                      step={0.0001}
                      className="w-full !rounded-lg"
                      prefix={<CompassOutlined className="text-[#5f736e]" />}
                      placeholder="16.0544"
                    />
                  )}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5f736e] mb-1">
                  Kinh độ GPS (Longitude)
                </label>
                <Controller
                  name="longitude"
                  control={formIdentity.control}
                  render={({ field }) => (
                    <InputNumber
                      {...field}
                      value={field.value ?? undefined}
                      step={0.0001}
                      className="w-full !rounded-lg"
                      prefix={<CompassOutlined className="text-[#5f736e]" />}
                      placeholder="108.2022"
                    />
                  )}
                />
              </div>
            </div>
          </div>
        </SectionCard>
      </form>

      {/* SECTION 2: Quy định giờ lưu trú */}
      <form onSubmit={(e) => void formPolicies.handleSubmit(handleSavePolicies)(e)}>
        <SectionCard
          id="policies-section"
          title="Quy định giờ lưu trú"
          description="Thiết lập khung giờ nhận phòng và trả phòng tiêu chuẩn. Khách lưu trú sẽ dựa vào mốc này để sắp xếp lịch trình."
          footer={
            <>
              <span className="text-[11px] text-[#5f736e]">
                {formPolicies.formState.isDirty
                  ? 'Có thay đổi chưa lưu ở mục này'
                  : 'Dữ liệu đã được lưu'}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="middle"
                  icon={<UndoOutlined />}
                  disabled={!formPolicies.formState.isDirty}
                  onClick={() => formPolicies.reset()}
                >
                  Hoàn tác
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="middle"
                  icon={<SaveOutlined />}
                  disabled={!formPolicies.formState.isDirty}
                  className="disabled:!bg-[#f0f2f1] disabled:!text-[#8c9e99] disabled:!border-[#dce7e3] !bg-[#0b5f53] hover:!bg-[#08473e] !rounded-lg font-semibold"
                >
                  Lưu giờ lưu trú
                </Button>
              </div>
            </>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Giờ nhận phòng */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#12211d]">
                Giờ nhận phòng (Check-in) <span className="text-rose-500">*</span>
              </label>
              <Controller
                name="checkInTime"
                control={formPolicies.control}
                render={({ field }) => (
                  <Input
                    {...field}
                    size="large"
                    prefix={<ClockCircleOutlined className="text-[#5f736e]" />}
                    placeholder="14:00"
                    className="rounded-lg"
                  />
                )}
              />
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[11px] text-[#5f736e] mr-1">Chọn nhanh:</span>
                {CHECK_IN_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => formPolicies.setValue('checkInTime', chip, { shouldDirty: true })}
                    className="px-2 py-0.5 rounded text-[11px] bg-[#f0f4f2] hover:bg-[#d9f0ea] hover:text-[#0b5f53] transition-colors cursor-pointer border-0"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Giờ trả phòng */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#12211d]">
                Giờ trả phòng (Check-out) <span className="text-rose-500">*</span>
              </label>
              <Controller
                name="checkOutTime"
                control={formPolicies.control}
                render={({ field }) => (
                  <Input
                    {...field}
                    size="large"
                    prefix={<ClockCircleOutlined className="text-[#5f736e]" />}
                    placeholder="12:00"
                    className="rounded-lg"
                  />
                )}
              />
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[11px] text-[#5f736e] mr-1">Chọn nhanh:</span>
                {CHECK_OUT_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => formPolicies.setValue('checkOutTime', chip, { shouldDirty: true })}
                    className="px-2 py-0.5 rounded text-[11px] bg-[#f0f4f2] hover:bg-[#d9f0ea] hover:text-[#0b5f53] transition-colors cursor-pointer border-0"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>
      </form>

      {/* SECTION 3: Chủ sở hữu */}
      <form onSubmit={(e) => void formOwner.handleSubmit(handleSaveOwner)(e)}>
        <SectionCard
          id="owner-section"
          title="Chủ sở hữu cơ sở lưu trú"
          description="Tài khoản sở hữu pháp lý và điều hành trực tiếp cơ sở lưu trú này trên StayHub."
          footer={
            <>
              <span className="text-[11px] text-[#5f736e]">
                {formOwner.formState.isDirty
                  ? 'Có thay đổi chưa lưu ở mục này'
                  : 'Dữ liệu đã được lưu'}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="middle"
                  icon={<UndoOutlined />}
                  disabled={!formOwner.formState.isDirty}
                  onClick={() => formOwner.reset()}
                >
                  Hoàn tác
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="middle"
                  icon={<SaveOutlined />}
                  disabled={!formOwner.formState.isDirty}
                  className="disabled:!bg-[#f0f2f1] disabled:!text-[#8c9e99] disabled:!border-[#dce7e3] !bg-[#0b5f53] hover:!bg-[#08473e] !rounded-lg font-semibold"
                >
                  Lưu chủ sở hữu
                </Button>
              </div>
            </>
          }
        >
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-[#12211d] mb-1.5">
                Owner User ID (UUID)
              </label>
              <Controller
                name="ownerUserId"
                control={formOwner.control}
                render={({ field }) => (
                  <Input
                    {...field}
                    size="large"
                    prefix={<UserOutlined className="text-[#5f736e]" />}
                    className="rounded-lg font-mono text-xs"
                    suffix={
                      <Button
                        type="text"
                        size="small"
                        icon={copied ? <CheckCircleOutlined className="text-[#0b5f53]" /> : <CopyOutlined />}
                        onClick={() => handleCopyOwnerId(field.value)}
                        title="Sao chép ID vào bộ nhớ tạm"
                      >
                        {copied ? 'Đã chép' : 'Sao chép'}
                      </Button>
                    }
                  />
                )}
              />
            </div>

            <div className="bg-[#f7fbfa] p-3 rounded-xl border border-[#eef4f2] flex items-center justify-between text-xs">
              <span className="text-[#5f736e]">Tên chủ sở hữu đăng ký:</span>
              <strong className="text-[#12211d]">{hotel.ownerName || 'Chủ cơ sở StayHub'}</strong>
            </div>
          </div>
        </SectionCard>
      </form>

      {/* SECTION 4: Mô tả & Điểm nổi bật */}
      <form onSubmit={(e) => void formDescription.handleSubmit(handleSaveDescription)(e)}>
        <SectionCard
          id="description-section"
          title="Mô tả &amp; Điểm nổi bật"
          description="Đoạn văn giới thiệu không gian lưu trú, phong cách thiết kế, view phòng và các trải nghiệm đặc sắc để thu hút khách hàng."
          footer={
            <>
              <span className="text-[11px] text-[#5f736e]">
                {formDescription.formState.isDirty
                  ? 'Có thay đổi chưa lưu ở mục này'
                  : 'Dữ liệu đã được lưu'}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="middle"
                  icon={<UndoOutlined />}
                  disabled={!formDescription.formState.isDirty}
                  onClick={() => formDescription.reset()}
                >
                  Hoàn tác
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="middle"
                  icon={<SaveOutlined />}
                  disabled={!formDescription.formState.isDirty}
                  className="disabled:!bg-[#f0f2f1] disabled:!text-[#8c9e99] disabled:!border-[#dce7e3] !bg-[#0b5f53] hover:!bg-[#08473e] !rounded-lg font-semibold"
                >
                  Lưu mô tả
                </Button>
              </div>
            </>
          }
        >
          <div>
            <Controller
              name="description"
              control={formDescription.control}
              render={({ field }) => (
                <Input.TextArea
                  {...field}
                  rows={5}
                  showCount
                  maxLength={2000}
                  placeholder="Nhập mô tả chi tiết về khách sạn, tiện nghi xung quanh, khoảng cách tới bãi biển hoặc trung tâm..."
                  className="rounded-lg text-xs leading-relaxed"
                />
              )}
            />
          </div>
        </SectionCard>
      </form>
      </fieldset>
    </div>
  )
}
