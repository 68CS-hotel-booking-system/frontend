import { useEffect, useId } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, App as AntApp, Button, Form, Input, Modal, Select } from 'antd'
import { Controller, useForm } from 'react-hook-form'
import { errorMessage } from '@/shared/api/api-error'
import { applyApiFieldErrors } from '@/shared/lib/form-errors'
import { useCreatePhysicalRoomMutation } from '../hooks/use-hotel-management'
import {
  type CreatedPhysicalRoomResponse,
  createPhysicalRoomFormSchema,
  type CreatePhysicalRoomFormValues,
  type ManagementRoomTypeSummary,
} from '../types/hotel-management'

interface CreatePhysicalRoomDrawerProps {
  open: boolean
  onClose: () => void
  hotelId: string
  hotelName?: string
  roomTypes: ManagementRoomTypeSummary[]
  onCreated?: (room: CreatedPhysicalRoomResponse) => void
}

export function CreatePhysicalRoomDrawer({
  open,
  onClose,
  hotelId,
  hotelName,
  roomTypes,
  onCreated,
}: CreatePhysicalRoomDrawerProps) {
  const formId = useId()
  const { message } = AntApp.useApp()
  const createMutation = useCreatePhysicalRoomMutation(hotelId)

  const defaultRoomTypeId =
    roomTypes[0]?.id ?? '44444444-4444-4444-8444-444444444401'

  const {
    control,
    handleSubmit,
    setError,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreatePhysicalRoomFormValues>({
    resolver: zodResolver(createPhysicalRoomFormSchema),
    defaultValues: {
      roomTypeId: defaultRoomTypeId,
      roomNumber: '305',
      floor: 'Floor 3',
      operationalFrom: '2026-11-04T00:00:00Z',
      operationalUntil: '',
    },
  })

  useEffect(() => {
    if (roomTypes[0]?.id) {
      setValue('roomTypeId', roomTypes[0].id)
    }
  }, [roomTypes, setValue])

  async function onSubmit(values: CreatePhysicalRoomFormValues) {
    try {
      const created = await createMutation.mutateAsync(values)
      void message.success(
        `Đã đăng ký phòng vật lý #${created.roomNumber} (${created.readiness}).`,
      )
      reset({
        roomTypeId: roomTypes[0]?.id ?? defaultRoomTypeId,
        roomNumber: '',
        floor: 'Floor 3',
        operationalFrom: '2026-11-04T00:00:00Z',
        operationalUntil: '',
      })
      onClose()
      onCreated?.(created)
    } catch (error) {
      applyApiFieldErrors(error, setError)
    }
  }

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            className="material-symbols-outlined"
            style={{ color: 'var(--atelier-primary)', fontSize: 22 }}
            aria-hidden="true"
          >
            meeting_room
          </span>
          <span style={{ fontWeight: 700, fontSize: 16 }}>
            {`Đăng Ký Phòng Vật Lý${hotelName ? ` — ${hotelName}` : ''}`}
          </span>
        </div>
      }
      open={open}
      onCancel={onClose}
      centered
      width={640}
      footer={null}
      destroyOnClose
    >
      <div
        style={{
          maxHeight: 'calc(85vh - 120px)',
          overflowY: 'auto',
          paddingRight: 6,
          paddingTop: 8,
        }}
      >
        <p className="muted" style={{ marginBottom: 16 }}>
          Thêm buồng phòng vật lý cụ thể vào cơ sở khách sạn. Mặc định phòng mới
          có trạng thái bàn giao chưa dọn phòng cho đến khi nhân sự buồng phòng
          xác nhận sẵn sàng đón khách.
        </p>

      {createMutation.isError && (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
          title="Không thể tạo phòng vật lý"
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
          label="Loại phòng liên kết (roomTypeId)"
          htmlFor={`${formId}-roomTypeId`}
          validateStatus={errors.roomTypeId ? 'error' : undefined}
          help={errors.roomTypeId?.message}
          required
        >
          <Controller
            name="roomTypeId"
            control={control}
            render={({ field }) => (
              <Select
                id={`${formId}-roomTypeId`}
                value={field.value}
                onChange={field.onChange}
                options={roomTypes.map((rt) => ({
                  label: `${rt.name} (${rt.maxAdults} người lớn, ${rt.maxChildren} trẻ em)`,
                  value: rt.id,
                }))}
              />
            )}
          />
        </Form.Item>

        <div className="form-grid-2">
          <Form.Item
            label="Số phòng (roomNumber)"
            htmlFor={`${formId}-roomNumber`}
            validateStatus={errors.roomNumber ? 'error' : undefined}
            help={errors.roomNumber?.message}
            required
          >
            <Controller
              name="roomNumber"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id={`${formId}-roomNumber`}
                  placeholder="Ví dụ: 301, 402, Villa-12"
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Tầng (floor)"
            htmlFor={`${formId}-floor`}
            validateStatus={errors.floor ? 'error' : undefined}
            help={errors.floor?.message}
          >
            <Controller
              name="floor"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id={`${formId}-floor`}
                  placeholder="Ví dụ: Floor 3, G, Penthouse"
                />
              )}
            />
          </Form.Item>
        </div>

        <Form.Item
          label="Thời điểm bắt đầu phục vụ (operationalFrom — ISO Instant)"
          htmlFor={`${formId}-operationalFrom`}
          validateStatus={errors.operationalFrom ? 'error' : undefined}
          help={errors.operationalFrom?.message}
          required
        >
          <Controller
            name="operationalFrom"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id={`${formId}-operationalFrom`}
                placeholder="2026-11-04T00:00:00Z"
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Thời điểm ngừng phục vụ (operationalUntil — Để trống nếu vô thời hạn)"
          htmlFor={`${formId}-operationalUntil`}
          validateStatus={errors.operationalUntil ? 'error' : undefined}
          help={errors.operationalUntil?.message}
        >
          <Controller
            name="operationalUntil"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                value={field.value ?? ''}
                id={`${formId}-operationalUntil`}
                placeholder="Để trống hoặc nhập ISO Instant (ví dụ 2027-12-31T23:59:59Z)"
              />
            )}
          />
        </Form.Item>

        <div
          className="drawer-form-actions"
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 12,
            marginTop: 24,
            paddingTop: 16,
            borderTop: '1px solid var(--atelier-surface-highest)',
          }}
        >
          <Button htmlType="button" onClick={onClose}>
            Hủy
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={createMutation.isPending}
          >
            Đăng ký phòng vật lý
          </Button>
        </div>
      </Form>
    </div>
  </Modal>
  )
}
