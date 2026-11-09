import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  App as AntApp,
  Button,
  Input,
  Modal,
  Rate,
  Select,
} from 'antd'
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CopyOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  ShopOutlined,
} from '@ant-design/icons'
import { useCurrentUser } from '@/features/auth'
import { applyApiFieldErrors } from '@/shared/lib/form-errors'
import { useCitiesQuery } from '../hooks/use-cities-query'
import { useCreateAdminHotelMutation } from '../hooks/use-create-hotel-mutation'
import type { ManagementHotelDetail } from '../model/hotel'
import {
  quickCreateHotelSchema,
  type QuickCreateHotelFormValues,
} from '../model/quick-create-hotel-schema'

export interface QuickCreateHotelFormProps {
  onSuccess: (created: ManagementHotelDetail) => void
  onCancel: () => void
}

const STAR_LABELS: Record<number, string> = {
  1: '1 Sao · Tiêu chuẩn',
  2: '2 Sao · Tiện nghi',
  3: '3 Sao · Chất lượng',
  4: '4 Sao · Cao cấp',
  5: '5 Sao · Đẳng cấp',
}

export function QuickCreateHotelForm({ onSuccess, onCancel }: QuickCreateHotelFormProps) {
  const { message } = AntApp.useApp()
  const { currentUser, isAdmin } = useCurrentUser()
  const citiesQuery = useCitiesQuery()
  const createMutation = useCreateAdminHotelMutation()
  const [copied, setCopied] = useState(false)

  const cities = citiesQuery.data ?? []

  const {
    control,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<QuickCreateHotelFormValues>({
    resolver: zodResolver(quickCreateHotelSchema),
    defaultValues: {
      name: '',
      starRating: 4,
      cityId: '',
      ownerUserId: currentUser?.id ?? '',
    },
  })

  // Synchronize current user ID if initially undefined
  useEffect(() => {
    if (currentUser?.id) {
      setValue('ownerUserId', currentUser.id, { shouldValidate: true })
    }
  }, [currentUser?.id, setValue])

  const handleCopyOwnerId = (idToCopy: string) => {
    if (!idToCopy) return
    void navigator.clipboard.writeText(idToCopy)
    setCopied(true)
    message.success('Đã sao chép Owner User ID vào bộ nhớ tạm!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCancelClick = () => {
    if (isDirty) {
      Modal.confirm({
        title: 'Rời trang khi chưa lưu?',
        content: 'Bạn có các thay đổi chưa được tạo. Nếu rời đi bây giờ, thông tin vừa nhập sẽ bị hủy.',
        okText: 'Rời khỏi trang',
        okType: 'danger',
        cancelText: 'Tiếp tục chỉnh sửa',
        onOk: () => onCancel(),
      })
    } else {
      onCancel()
    }
  }

  const onSubmit = async (values: QuickCreateHotelFormValues) => {
    const selectedCity = cities.find((c) => c.id === values.cityId)
    const fallbackAddress = selectedCity ? `Khu vực ${selectedCity.name}` : 'Chưa cập nhật địa chỉ'
    const isSelfOwner = !values.ownerUserId || values.ownerUserId === currentUser?.id
    const effectiveOwnerId = !isAdmin && isSelfOwner ? '' : values.ownerUserId.trim()

    try {
      const created = await createMutation.mutateAsync({
        name: values.name.trim(),
        slug: '',
        starRating: values.starRating,
        cityId: values.cityId,
        ownerUserId: effectiveOwnerId,
        address: fallbackAddress,
        checkInTime: '14:00',
        checkOutTime: '12:00',
        description: '',
        latitude: null,
        longitude: null,
      })

      message.success(`Đã tạo khách sạn "${created.name}" thành công!`)
      onSuccess(created)
    } catch (err) {
      applyApiFieldErrors(err, setError, ['name', 'cityId', 'ownerUserId', 'starRating'])
    }
  }

  const busy = isSubmitting || createMutation.isPending

  return (
    <div className="quick-create-hotel-container">
      {/* 1. Khung hướng dẫn quy trình tạo hồ sơ rút gọn */}
      <div className="bg-[#f2faf7] border border-[#c4e7dc] rounded-xl p-4 mb-6 flex items-start gap-3">
        <InfoCircleOutlined className="text-[#0b5f53] text-lg mt-0.5 shrink-0" />
        <div className="text-xs text-[#1e3d36] leading-relaxed">
          <p className="font-bold text-[#08473e] m-0 mb-1">Quy trình tạo hồ sơ nhanh</p>
          <p className="m-0">
            Khách sạn mới sẽ được khởi tạo với trạng thái <strong>Bản nháp (DRAFT)</strong>.
            Sau bước tạo cơ bản này, hệ thống sẽ đưa bạn vào trang quản lý để hoàn thiện hình ảnh,
            tiện ích, danh sách phòng và bảng giá trước khi gửi phê duyệt.
          </p>
        </div>
      </div>

      <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} noValidate>
        <div className="space-y-6">
          {/* Tên khách sạn */}
          <div>
            <label className="block text-xs font-bold text-[#12211d] uppercase tracking-wider mb-1.5">
              Tên khách sạn chính thức <span className="text-rose-500">*</span>
            </label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  size="large"
                  placeholder="Ví dụ: The Grand Da Nang Riverside & Spa"
                  maxLength={255}
                  showCount
                  disabled={busy}
                  status={errors.name ? 'error' : ''}
                  prefix={<ShopOutlined className="text-[#5f736e]" />}
                  className="rounded-lg"
                />
              )}
            />
            {errors.name && (
              <p className="text-xs text-rose-500 mt-1 font-medium">{errors.name.message}</p>
            )}
          </div>

          {/* Tiêu chuẩn sao & Tỉnh/Thành phố */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Tiêu chuẩn sao */}
            <div>
              <label className="block text-xs font-bold text-[#12211d] uppercase tracking-wider mb-1.5">
                Tiêu chuẩn sao <span className="text-rose-500">*</span>
              </label>
              <Controller
                name="starRating"
                control={control}
                render={({ field }) => (
                  <div className="p-3 bg-[#f7fbfa] rounded-lg border border-[#dce7e3] flex items-center justify-between">
                    <Rate
                      value={field.value}
                      onChange={field.onChange}
                      disabled={busy}
                      className="text-amber-500"
                    />
                    <span className="text-xs font-semibold text-[#0b5f53]">
                      {STAR_LABELS[field.value] ?? `${field.value} Sao`}
                    </span>
                  </div>
                )}
              />
              {errors.starRating && (
                <p className="text-xs text-rose-500 mt-1 font-medium">{errors.starRating.message}</p>
              )}
            </div>

            {/* Tỉnh / Thành phố */}
            <div>
              <label className="block text-xs font-bold text-[#12211d] uppercase tracking-wider mb-1.5">
                Tỉnh / Thành phố <span className="text-rose-500">*</span>
              </label>
              <Controller
                name="cityId"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    size="large"
                    showSearch
                    placeholder="Chọn Tỉnh / Thành phố..."
                    disabled={busy}
                    loading={citiesQuery.isLoading}
                    status={errors.cityId ? 'error' : ''}
                    className="w-full"
                    optionFilterProp="label"
                    options={cities.map((city) => ({
                      value: city.id,
                      label: city.name,
                    }))}
                  />
                )}
              />
              {errors.cityId && (
                <p className="text-xs text-rose-500 mt-1 font-medium">{errors.cityId.message}</p>
              )}
            </div>
          </div>

          {/* Chủ sở hữu (Owner User ID) */}
          <div>
            <label className="block text-xs font-bold text-[#12211d] uppercase tracking-wider mb-1.5">
              Chủ sở hữu (Owner User ID) <span className="text-rose-500">*</span>
            </label>
            <Controller
              name="ownerUserId"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  size="large"
                  placeholder="Nhập mã định danh UUID của chủ khách sạn..."
                  disabled={busy}
                  status={errors.ownerUserId ? 'error' : ''}
                  className="rounded-lg font-mono text-xs"
                  suffix={
                    <Button
                      type="text"
                      size="small"
                      icon={copied ? <CheckCircleOutlined className="text-[#0b5f53]" /> : <CopyOutlined />}
                      onClick={() => handleCopyOwnerId(field.value)}
                      title="Sao chép ID vào bộ nhớ tạm"
                    >
                      {copied ? 'Đã sao chép' : 'Sao chép ID'}
                    </Button>
                  }
                />
              )}
            />
            {errors.ownerUserId && (
              <p className="text-xs text-rose-500 mt-1 font-medium">{errors.ownerUserId.message}</p>
            )}
            <p className="text-[11px] text-[#5f736e] mt-1 m-0">
              Mặc định gán cho tài khoản đang thao tác. Bạn có thể thay đổi sang UUID của chủ sở hữu được ủy quyền.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-6 mt-8 border-t border-[#dce7e3] flex items-center justify-between gap-4">
          <Button
            type="default"
            size="large"
            icon={<ArrowLeftOutlined />}
            onClick={handleCancelClick}
            disabled={busy}
            className="!rounded-xl"
          >
            Hủy / Quay lại
          </Button>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            icon={<PlusOutlined />}
            loading={busy}
            className="!rounded-xl !bg-[#0b5f53] hover:!bg-[#08473e] !px-8 font-semibold"
          >
            Tạo khách sạn
          </Button>
        </div>
      </form>
    </div>
  )
}
