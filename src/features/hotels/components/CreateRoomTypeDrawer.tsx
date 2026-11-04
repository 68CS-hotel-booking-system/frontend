import { useId } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Alert,
  App as AntApp,
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
} from 'antd'
import { Controller, useForm } from 'react-hook-form'
import { errorMessage } from '@/shared/api/api-error'
import { applyApiFieldErrors } from '@/shared/lib/form-errors'
import { useCreateRoomTypeMutation } from '../hooks/use-hotel-management'
import {
  type CreatedRoomTypeResponse,
  createRoomTypeFormSchema,
  type CreateRoomTypeFormValues,
} from '../types/hotel-management'

interface CreateRoomTypeDrawerProps {
  open: boolean
  onClose: () => void
  hotelId: string
  hotelName?: string
  onCreated?: (roomType: CreatedRoomTypeResponse) => void
}

export function CreateRoomTypeDrawer({
  open,
  onClose,
  hotelId,
  hotelName,
  onCreated,
}: CreateRoomTypeDrawerProps) {
  const formId = useId()
  const { message } = AntApp.useApp()
  const createMutation = useCreateRoomTypeMutation(hotelId)

  const {
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<CreateRoomTypeFormValues>({
    resolver: zodResolver(createRoomTypeFormSchema),
    defaultValues: {
      name: '',
      description: '',
      maxAdults: 2,
      maxChildren: 1,
    },
  })

  async function onSubmit(values: CreateRoomTypeFormValues) {
    try {
      const created = await createMutation.mutateAsync(values)
      void message.success(`Đã tạo loại phòng "${created.name}" thành công.`)
      reset()
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
            king_bed
          </span>
          <span style={{ fontWeight: 700, fontSize: 16 }}>
            {`Tạo Loại Phòng Mới${hotelName ? ` — ${hotelName}` : ''}`}
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
          Khởi tạo hạng phòng mới thuộc cơ sở khách sạn. Sức chứa tối đa được áp
          dụng để kiểm tra tự động khi khách lưu trú đặt phòng.
        </p>

      {createMutation.isError && (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
          title="Không thể tạo loại phòng"
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
          label="Tên loại phòng (tối đa 100 ký tự)"
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
                placeholder="Ví dụ: Grand Penthouse Suite, Deluxe Ocean King..."
              />
            )}
          />
        </Form.Item>

        <div className="form-grid-2">
          <Form.Item
            label="Số người lớn tối đa (>= 1)"
            htmlFor={`${formId}-maxAdults`}
            validateStatus={errors.maxAdults ? 'error' : undefined}
            help={errors.maxAdults?.message}
            required
          >
            <Controller
              name="maxAdults"
              control={control}
              render={({ field }) => (
                <InputNumber
                  id={`${formId}-maxAdults`}
                  min={1}
                  max={20}
                  value={field.value}
                  onChange={(val) => field.onChange(val ?? 2)}
                  className="full-width"
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Số trẻ em tối đa (>= 0)"
            htmlFor={`${formId}-maxChildren`}
            validateStatus={errors.maxChildren ? 'error' : undefined}
            help={errors.maxChildren?.message}
            required
          >
            <Controller
              name="maxChildren"
              control={control}
              render={({ field }) => (
                <InputNumber
                  id={`${formId}-maxChildren`}
                  min={0}
                  max={20}
                  value={field.value}
                  onChange={(val) => field.onChange(val ?? 0)}
                  className="full-width"
                />
              )}
            />
          </Form.Item>
        </div>

        <Form.Item
          label="Mô tả loại phòng"
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
                placeholder="Diện tích, tầm nhìn, cấu hình giường và tiện ích nổi bật..."
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
            Tạo loại phòng
          </Button>
        </div>
      </Form>
    </div>
  </Modal>
  )
}
