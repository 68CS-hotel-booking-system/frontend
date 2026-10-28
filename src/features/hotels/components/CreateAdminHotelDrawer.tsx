import { useId } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Alert,
  App as AntApp,
  Button,
  Drawer,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
} from 'antd'
import { Controller, useForm } from 'react-hook-form'
import { errorMessage } from '@/shared/api/api-error'
import { applyApiFieldErrors } from '@/shared/lib/form-errors'
import { slugifyHotelName } from '@/shared/lib/format'
import { useCreateAdminHotelMutation } from '../hooks/use-hotel-management'
import {
  type CityItem,
  createAdminHotelFormSchema,
  type CreateAdminHotelFormValues,
  type ManagementHotelDetail,
} from '../types/hotel-management'

interface CreateAdminHotelDrawerProps {
  open: boolean
  onClose: () => void
  cities: CityItem[]
  onCreated?: (hotel: ManagementHotelDetail) => void
}

const SAMPLE_OWNERS = [
  {
    label: 'Nguyễn Minh Quân — Chủ sở hữu IHG',
    value: '99999999-9999-4999-8999-999999999901',
  },
  {
    label: 'Lê Hoàng Thảo Vy — Chủ sở hữu CloudPine',
    value: '99999999-9999-4999-8999-999999999902',
  },
  {
    label: 'Trần Quốc Bảo — Chủ sở hữu Solis',
    value: '99999999-9999-4999-8999-999999999903',
  },
]

export function CreateAdminHotelDrawer({
  open,
  onClose,
  cities,
  onCreated,
}: CreateAdminHotelDrawerProps) {
  const formId = useId()
  const { message } = AntApp.useApp()
  const createMutation = useCreateAdminHotelMutation()

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    setError,
    reset,
    formState: { errors },
  } = useForm<CreateAdminHotelFormValues>({
    resolver: zodResolver(createAdminHotelFormSchema),
    defaultValues: {
      name: '',
      slug: '',
      cityId: cities[0]?.id ?? '11111111-1111-4111-8111-111111111101',
      ownerUserId: '99999999-9999-4999-8999-999999999901',
      address: '',
      starRating: 5,
      checkInTime: '14:00',
      checkOutTime: '12:00',
      description: '',
      latitude: 21.0583,
      longitude: 105.8306,
    },
  })

  async function onSubmit(values: CreateAdminHotelFormValues) {
    try {
      const created = await createMutation.mutateAsync(values)
      void message.success(`Đã tạo khách sạn "${created.name}" thành công.`)
      reset()
      onClose()
      onCreated?.(created)
    } catch (error) {
      applyApiFieldErrors(error, setError)
    }
  }

  return (
    <Drawer
      title="Tạo khách sạn mới & Phân công Chủ sở hữu"
      size="large"
      open={open}
      onClose={onClose}
      destroyOnHidden={false}
    >
      <p className="muted" style={{ marginBottom: 16 }}>
        Khởi tạo hồ sơ khu nghỉ dưỡng / khách sạn ở trạng thái bản nháp và phân
        công chủ sở hữu quản lý chính.
      </p>

      {createMutation.isError && (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
          title="Không thể tạo khách sạn"
          description={errorMessage(createMutation.error)}
        />
      )}

      <Form
        layout="vertical"
        component="form"
        onSubmitCapture={handleSubmit(onSubmit)}
        noValidate
        className="admin-form"
      >
        <Form.Item
          label="Tên khách sạn"
          htmlFor={`${formId}-name`}
          validateStatus={errors.name ? 'error' : undefined}
          help={errors.name?.message}
          required
        >
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id={`${formId}-name`}
                placeholder="Ví dụ: StayVibe SkyLodge Đà Lạt"
                onChange={(event) => {
                  field.onChange(event)
                  const currentSlug = getValues('slug')
                  if (!currentSlug || currentSlug === slugifyHotelName(field.value)) {
                    setValue('slug', slugifyHotelName(event.target.value), {
                      shouldValidate: true,
                    })
                  }
                }}
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Đường dẫn định danh (Slug)"
          htmlFor={`${formId}-slug`}
          validateStatus={errors.slug ? 'error' : undefined}
          help={errors.slug?.message}
          required
        >
          <Controller
            name="slug"
            control={control}
            render={({ field }) => (
              <Space.Compact className="full-width">
                <Input
                  {...field}
                  id={`${formId}-slug`}
                  placeholder="stayvibe-skylodge-da-lat"
                />
                <Button
                  htmlType="button"
                  onClick={() =>
                    setValue('slug', slugifyHotelName(getValues('name')), {
                      shouldValidate: true,
                    })
                  }
                >
                  Tạo từ tên
                </Button>
              </Space.Compact>
            )}
          />
        </Form.Item>

        <div className="form-grid-2">
          <Form.Item
            label="Thành phố"
            htmlFor={`${formId}-cityId`}
            validateStatus={errors.cityId ? 'error' : undefined}
            help={errors.cityId?.message}
            required
          >
            <Controller
              name="cityId"
              control={control}
              render={({ field }) => (
                <Select
                  id={`${formId}-cityId`}
                  value={field.value}
                  onChange={field.onChange}
                  options={cities.map((city) => ({
                    label: city.name,
                    value: city.id,
                  }))}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Xếp hạng sao (1 - 5 sao)"
            htmlFor={`${formId}-starRating`}
            validateStatus={errors.starRating ? 'error' : undefined}
            help={errors.starRating?.message}
            required
          >
            <Controller
              name="starRating"
              control={control}
              render={({ field }) => (
                <InputNumber
                  id={`${formId}-starRating`}
                  min={1}
                  max={5}
                  value={field.value}
                  onChange={(val) => field.onChange(val ?? 5)}
                  className="full-width"
                />
              )}
            />
          </Form.Item>
        </div>

        <Form.Item
          label="Phân công Chủ sở hữu"
          htmlFor={`${formId}-ownerUserId`}
          validateStatus={errors.ownerUserId ? 'error' : undefined}
          help={
            errors.ownerUserId?.message ??
            'Chọn nhanh tài khoản chủ sở hữu mẫu hoặc nhập mã tài khoản.'
          }
          required
        >
          <Controller
            name="ownerUserId"
            control={control}
            render={({ field }) => (
              <div className="stack-xs">
                <Input
                  {...field}
                  id={`${formId}-ownerUserId`}
                  placeholder="Nhập mã định danh tài khoản chủ sở hữu..."
                />
                <Select
                  aria-label="Chọn nhanh chủ sở hữu mẫu"
                  value={
                    SAMPLE_OWNERS.some((item) => item.value === field.value)
                      ? field.value
                      : undefined
                  }
                  placeholder="Chọn nhanh chủ sở hữu mẫu..."
                  onChange={(value) => field.onChange(value)}
                  options={SAMPLE_OWNERS}
                />
              </div>
            )}
          />
        </Form.Item>

        <Form.Item
          label="Địa chỉ chi tiết"
          htmlFor={`${formId}-address`}
          validateStatus={errors.address ? 'error' : undefined}
          help={errors.address?.message}
          required
        >
          <Controller
            name="address"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id={`${formId}-address`}
                placeholder="Số nhà, đường, phường/xã, quận/huyện..."
              />
            )}
          />
        </Form.Item>

        <div className="form-grid-2">
          <Form.Item
            label="Giờ nhận phòng"
            htmlFor={`${formId}-checkInTime`}
            validateStatus={errors.checkInTime ? 'error' : undefined}
            help={errors.checkInTime?.message}
            required
          >
            <Controller
              name="checkInTime"
              control={control}
              render={({ field }) => (
                <Input {...field} id={`${formId}-checkInTime`} placeholder="14:00" />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Giờ trả phòng"
            htmlFor={`${formId}-checkOutTime`}
            validateStatus={errors.checkOutTime ? 'error' : undefined}
            help={errors.checkOutTime?.message}
            required
          >
            <Controller
              name="checkOutTime"
              control={control}
              render={({ field }) => (
                <Input {...field} id={`${formId}-checkOutTime`} placeholder="12:00" />
              )}
            />
          </Form.Item>
        </div>

        <div className="form-grid-2">
          <Form.Item
            label="Vĩ độ địa lý"
            htmlFor={`${formId}-latitude`}
            validateStatus={errors.latitude ? 'error' : undefined}
            help={errors.latitude?.message}
          >
            <Controller
              name="latitude"
              control={control}
              render={({ field }) => (
                <InputNumber
                  id={`${formId}-latitude`}
                  step={0.0001}
                  min={-90}
                  max={90}
                  value={field.value ?? null}
                  onChange={(val) => field.onChange(val)}
                  className="full-width"
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Kinh độ địa lý"
            htmlFor={`${formId}-longitude`}
            validateStatus={errors.longitude ? 'error' : undefined}
            help={errors.longitude?.message}
          >
            <Controller
              name="longitude"
              control={control}
              render={({ field }) => (
                <InputNumber
                  id={`${formId}-longitude`}
                  step={0.0001}
                  min={-180}
                  max={180}
                  value={field.value ?? null}
                  onChange={(val) => field.onChange(val)}
                  className="full-width"
                />
              )}
            />
          </Form.Item>
        </div>

        <Form.Item
          label="Mô tả điểm nhấn khách sạn"
          htmlFor={`${formId}-description`}
          validateStatus={errors.description ? 'error' : undefined}
          help={errors.description?.message}
        >
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Input.TextArea
                {...field}
                id={`${formId}-description`}
                rows={4}
                placeholder="Giới thiệu phong cách thiết kế, trải nghiệm nổi bật..."
              />
            )}
          />
        </Form.Item>

        <div className="drawer-form-actions">
          <Button htmlType="button" onClick={onClose}>
            Hủy
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={createMutation.isPending}
          >
            Tạo khách sạn &amp; Phân công Chủ sở hữu
          </Button>
        </div>
      </Form>
    </Drawer>
  )
}

