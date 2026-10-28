import { useEffect, useId } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Alert,
  App as AntApp,
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
} from 'antd'
import { Controller, useForm } from 'react-hook-form'
import { errorMessage } from '@/shared/api/api-error'
import { applyApiFieldErrors } from '@/shared/lib/form-errors'
import { useUpdateManagementHotelMutation } from '../hooks/use-hotel-management'
import {
  type CityItem,
  hotelStatusValues,
  type ManagementHotelDetail,
  updateManagementHotelFormSchema,
  type UpdateManagementHotelFormValues,
} from '../types/hotel-management'
import { HotelStatusBadge } from './HotelStatusBadge'

interface HotelGeneralEditFormProps {
  hotel: ManagementHotelDetail
  cities: CityItem[]
}

const STATUS_LABELS: Record<(typeof hotelStatusValues)[number], string> = {
  DRAFT: 'Bản nháp nội bộ',
  PENDING_APPROVAL: 'Đang chờ phê duyệt',
  ACTIVE: 'Đang mở bán công khai',
  REJECTED: 'Từ chối phê duyệt',
  SUSPENDED: 'Tạm ngưng vận hành',
}

export function HotelGeneralEditForm({
  hotel,
  cities,
}: HotelGeneralEditFormProps) {
  const formId = useId()
  const { message } = AntApp.useApp()
  const updateMutation = useUpdateManagementHotelMutation(hotel.id)

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<UpdateManagementHotelFormValues>({
    resolver: zodResolver(updateManagementHotelFormSchema),
    defaultValues: {
      name: hotel.name,
      cityId: hotel.cityId,
      address: hotel.address,
      starRating: hotel.starRating ?? 5,
      checkInTime: hotel.checkInTime.slice(0, 5),
      checkOutTime: hotel.checkOutTime.slice(0, 5),
      description: hotel.description ?? '',
      latitude: hotel.latitude,
      longitude: hotel.longitude,
      status: hotel.status,
    },
  })

  useEffect(() => {
    reset({
      name: hotel.name,
      cityId: hotel.cityId,
      address: hotel.address,
      starRating: hotel.starRating ?? 5,
      checkInTime: hotel.checkInTime.slice(0, 5),
      checkOutTime: hotel.checkOutTime.slice(0, 5),
      description: hotel.description ?? '',
      latitude: hotel.latitude,
      longitude: hotel.longitude,
      status: hotel.status,
    })
  }, [hotel, reset])

  async function onSubmit(values: UpdateManagementHotelFormValues) {
    try {
      const updated = await updateMutation.mutateAsync(values)
      reset({
        name: updated.name,
        cityId: updated.cityId,
        address: updated.address,
        starRating: updated.starRating ?? 5,
        checkInTime: updated.checkInTime.slice(0, 5),
        checkOutTime: updated.checkOutTime.slice(0, 5),
        description: updated.description ?? '',
        latitude: updated.latitude,
        longitude: updated.longitude,
        status: updated.status,
      })
      void message.success('Đã cập nhật thông tin quản lý khách sạn.')
    } catch (error) {
      applyApiFieldErrors(error, setError)
    }
  }

  return (
    <div className="detail-grid-layout">
      <section className="surface-card" aria-labelledby="hotel-edit-title">
        <div className="section-header">
          <div>
            <h2 id="hotel-edit-title">Cập nhật nội dung khách sạn</h2>
            <p className="muted">
              Điều chỉnh thông tin hiển thị, tọa độ địa lý, giờ nhận/trả phòng và
              trạng thái vận hành.
            </p>
          </div>
          <HotelStatusBadge status={hotel.status} />
        </div>

        {updateMutation.isError && (
          <Alert
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
            title="Không thể lưu thay đổi"
            description={errorMessage(updateMutation.error)}
          />
        )}

        <Form
          layout="vertical"
          component="form"
          onSubmitCapture={handleSubmit(onSubmit)}
          noValidate
          className="admin-form"
        >
          <div className="form-grid-2">
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
                render={({ field }) => <Input {...field} id={`${formId}-name`} />}
              />
            </Form.Item>

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
          </div>

          <Form.Item
            label="Địa chỉ khách sạn"
            htmlFor={`${formId}-address`}
            validateStatus={errors.address ? 'error' : undefined}
            help={errors.address?.message}
            required
          >
            <Controller
              name="address"
              control={control}
              render={({ field }) => <Input {...field} id={`${formId}-address`} />}
            />
          </Form.Item>

          <div className="form-grid-3">
            <Form.Item
              label="Xếp hạng sao (1 - 5 sao)"
              htmlFor={`${formId}-starRating`}
              validateStatus={errors.starRating ? 'error' : undefined}
              help={errors.starRating?.message}
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

            <Form.Item
              label="Giờ nhận phòng"
              htmlFor={`${formId}-checkInTime`}
              validateStatus={errors.checkInTime ? 'error' : undefined}
              help={errors.checkInTime?.message}
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

          <div className="form-grid-3">
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
                    value={field.value}
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
                    value={field.value}
                    onChange={(val) => field.onChange(val)}
                    className="full-width"
                  />
                )}
              />
            </Form.Item>

            <Form.Item
              label="Trạng thái vận hành"
              htmlFor={`${formId}-status`}
              validateStatus={errors.status ? 'error' : undefined}
              help={errors.status?.message}
            >
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    id={`${formId}-status`}
                    value={field.value}
                    onChange={field.onChange}
                    options={hotelStatusValues.map((status) => ({
                      label: STATUS_LABELS[status],
                      value: status,
                    }))}
                  />
                )}
              />
            </Form.Item>
          </div>

          <Form.Item
            label="Mô tả chi tiết khách sạn"
            htmlFor={`${formId}-description`}
            validateStatus={errors.description ? 'error' : undefined}
            help={errors.description?.message}
          >
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Input.TextArea {...field} id={`${formId}-description`} rows={4} />
              )}
            />
          </Form.Item>

          <Space>
            <Button
              type="primary"
              htmlType="submit"
              disabled={!isDirty}
              loading={updateMutation.isPending}
            >
              Lưu thay đổi
            </Button>
            <Button
              htmlType="button"
              disabled={!isDirty}
              onClick={() => reset()}
            >
              Hoàn tác
            </Button>
          </Space>
        </Form>
      </section>

      <aside className="surface-card" aria-labelledby="hotel-meta-title">
        <h2 id="hotel-meta-title">Thông tin định danh &amp; Chủ sở hữu</h2>
        <p className="muted">
          Thông tin hồ sơ gốc của cơ sở lưu trú trên hệ thống.
        </p>
        <dl className="meta-list">
          <div>
            <dt>Đường dẫn định danh</dt>
            <dd>
              <strong>{hotel.slug}</strong>
            </dd>
          </div>
          <div>
            <dt>Chủ sở hữu</dt>
            <dd>
              <strong>{hotel.ownerName ?? 'Chủ sở hữu chính'}</strong>
            </dd>
          </div>
          <div>
            <dt>Số hạng phòng đang quản lý</dt>
            <dd>{hotel.roomTypes.length} hạng phòng</dd>
          </div>
          <div>
            <dt>Số tiện ích đã gắn</dt>
            <dd>{hotel.amenityIds.length} tiện ích</dd>
          </div>
          <div>
            <dt>Cập nhật gần nhất</dt>
            <dd>{new Date(hotel.updatedAt).toLocaleString('vi-VN')}</dd>
          </div>
        </dl>
      </aside>
    </div>
  )
}

