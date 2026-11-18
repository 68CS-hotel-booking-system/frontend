import { useEffect, useState } from 'react'
import { amenitySearchKey } from '../model/amenity-workspace'
import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, App, Button, Form, Input, Modal } from 'antd'
import { Controller, useForm, useWatch } from 'react-hook-form'
import {
  createCustomAmenityFormSchema,
  type CreateCustomAmenityFormValues,
} from '../model/scoped-amenity-schemas'
import {
  getAmenityErrorMessage,
  type AmenityScope,
} from '../api/scoped-amenities-api'
import { useCreateCustomAmenityMutation } from '../hooks/use-scoped-amenities'

interface CustomAmenityCreateModalProps {
  open: boolean
  scope: AmenityScope
  scopeLabel: string
  onClose: () => void
  onBusyChange?: (busy: boolean) => void
  onSuccess?: () => void
  knownNames?: string[]
}

export function CustomAmenityCreateModal({
  open,
  scope,
  scopeLabel,
  onClose,
  onSuccess,
  onBusyChange,
  knownNames = [],
}: CustomAmenityCreateModalProps) {
  const { message } = App.useApp()
  const [apiError, setApiError] = useState<string | null>(null)
  const createMutation = useCreateCustomAmenityMutation(scope)
  useEffect(() => { onBusyChange?.(createMutation.isPending) }, [createMutation.isPending, onBusyChange])

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateCustomAmenityFormValues>({
    resolver: zodResolver(createCustomAmenityFormSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  })

  const name = useWatch({ control, name: 'name' }) ?? ''
  const duplicate = Boolean(name.trim()) && knownNames.some(value => amenitySearchKey(value) === amenitySearchKey(name))

  const handleClose = () => {
    if (createMutation.isPending) return
    setApiError(null)
    reset({ name: '', description: '' })
    onClose()
  }

  const onSubmit = async (values: CreateCustomAmenityFormValues) => {
    setApiError(null)
    try {
      await createMutation.mutateAsync({
        name: values.name,
        description: values.description || undefined,
      })
      reset({ name: '', description: '' })
      onSuccess?.()
      onClose()
    } catch (error) {
      const detail = getAmenityErrorMessage(error)
      setApiError(detail); void message.error(detail)
    }
  }

  return (
    <Modal
      title="Thêm tiện ích riêng"
      open={open}
      onCancel={handleClose}
      footer={null}
      destroyOnHidden
      centered
      className="custom-amenity-modal"
    >
      <div className="py-2">
        <p className="text-xs text-[#5f736e] mb-4">
          Tiện ích này chỉ thuộc <strong className="text-[#12211d]">{scopeLabel}</strong> đang quản lý.
        </p>

        {apiError && (
          <Alert
            type="error"
            showIcon
            message="Không thể tạo tiện ích"
            description={apiError}
            className="mb-4"
          />
        )}

        {duplicate && <Alert type="warning" showIcon title="Tên này đã có trong danh mục hoặc tiện ích cùng cấp. Hãy kiểm tra trước khi thêm." style={{ marginBottom: 16 }} />}
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Form.Item
            label="Tên tiện ích"
            required
            validateStatus={errors.name ? 'error' : ''}
            help={errors.name?.message}
          >
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="VD: Bồn tắm đá tự nhiên, Bàn làm việc công thái học..."
                  maxLength={100}
                  disabled={createMutation.isPending || isSubmitting}
                  autoFocus
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Mô tả tiện ích (Tùy chọn)"
            validateStatus={errors.description ? 'error' : ''}
            help={errors.description?.message}
          >
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Input.TextArea
                  {...field}
                  placeholder="Mô tả ngắn gọn đặc điểm hoặc lưu ý sử dụng cho khách..."
                  rows={3}
                  maxLength={2000}
                  showCount
                  disabled={createMutation.isPending || isSubmitting}
                />
              )}
            />
          </Form.Item>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#dce7e3]">
            <Button
              onClick={handleClose}
              disabled={createMutation.isPending || isSubmitting}
            >
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={createMutation.isPending || isSubmitting}
              className="!bg-[#0b5f53] !border-[#0b5f53]"
            >
              Thêm tiện ích
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  )
}
