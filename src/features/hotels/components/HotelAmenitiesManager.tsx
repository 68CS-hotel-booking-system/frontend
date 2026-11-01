import { useEffect } from 'react'
import { CheckCircleFilled, SaveOutlined, UndoOutlined } from '@ant-design/icons'
import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, App as AntApp, Button, Space, Tag } from 'antd'
import { useForm, useWatch } from 'react-hook-form'
import { errorMessage } from '@/shared/api/api-error'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { PageLoading } from '@/shared/ui/PageLoading'
import {
  useAmenitiesQuery,
  useUpdateHotelAmenitiesMutation,
} from '../hooks/use-hotel-management'
import {
  type AmenityItem,
  updateHotelAmenitiesFormSchema,
  type UpdateHotelAmenitiesFormValues,
} from '../types/hotel-management'

interface HotelAmenitiesManagerProps {
  hotelId: string
  initialAmenityIds: string[]
}

export function HotelAmenitiesManager({
  hotelId,
  initialAmenityIds,
}: HotelAmenitiesManagerProps) {
  const { message } = AntApp.useApp()
  const amenitiesQuery = useAmenitiesQuery()
  const updateAmenitiesMutation = useUpdateHotelAmenitiesMutation(hotelId)

  const {
    control,
    setValue,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<UpdateHotelAmenitiesFormValues>({
    resolver: zodResolver(updateHotelAmenitiesFormSchema),
    defaultValues: {
      amenityIds: initialAmenityIds,
    },
  })

  useEffect(() => {
    reset({ amenityIds: initialAmenityIds })
  }, [initialAmenityIds, reset])

  const selectedIds = useWatch({ control, name: 'amenityIds' }) ?? []

  function toggleAmenity(amenityId: string) {
    const exists = selectedIds.includes(amenityId)
    const next = exists
      ? selectedIds.filter((id) => id !== amenityId)
      : [...selectedIds, amenityId]
    setValue('amenityIds', next, { shouldDirty: true, shouldValidate: true })
  }

  async function onSubmit(values: UpdateHotelAmenitiesFormValues) {
    try {
      const updated = await updateAmenitiesMutation.mutateAsync(values)
      reset({ amenityIds: updated })
      void message.success(
        `Đã lưu ${updated.length} tiện ích cho khách sạn.`,
      )
    } catch {
      // Lỗi hiển thị qua Alert bên dưới
    }
  }

  if (amenitiesQuery.isPending) {
    return <PageLoading />
  }

  if (amenitiesQuery.isError) {
    return (
      <ErrorState
        error={amenitiesQuery.error}
        retrying={amenitiesQuery.isFetching}
        onRetry={() => void amenitiesQuery.refetch()}
      />
    )
  }

  const allAmenities = amenitiesQuery.data
  if (allAmenities.length === 0) {
    return (
      <EmptyState
        title="Danh mục tiện ích đang trống"
        description="Hiện chưa có tiện ích nào trong danh mục hệ thống."
      />
    )
  }

  const hotelCategoryAmenities = allAmenities.filter(
    (item) => item.category === 'HOTEL',
  )
  const roomCategoryAmenities = allAmenities.filter(
    (item) => item.category === 'ROOM',
  )

  function renderAmenityGroup(title: string, items: AmenityItem[]) {
    return (
      <div className="amenity-group">
        <div className="amenity-group__header">
          <h3>{title}</h3>
          <Tag color="blue">{items.length} tiện ích</Tag>
        </div>
        <div className="amenity-grid">
          {items.map((amenity) => {
            const isSelected = selectedIds.includes(amenity.id)
            return (
              <button
                key={amenity.id}
                type="button"
                role="checkbox"
                aria-checked={isSelected}
                className={`amenity-chip-card ${isSelected ? 'is-selected' : ''}`}
                onClick={() => toggleAmenity(amenity.id)}
              >
                <div className="amenity-chip-card__top">
                  <span className="amenity-chip-card__name">{amenity.name}</span>
                  {isSelected && (
                    <CheckCircleFilled
                      className="amenity-chip-card__check"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <div className="amenity-chip-card__meta">
                  <span className="muted" style={{ fontSize: 12 }}>
                    {amenity.category === 'HOTEL'
                      ? 'Khuôn viên & Dịch vụ'
                      : 'Tiện nghi trong phòng'}
                  </span>
                  <Tag>{isSelected ? 'Đã trang bị' : 'Chưa chọn'}</Tag>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <section className="surface-card" aria-labelledby="amenities-mgmt-title">
      <div className="section-header">
        <div>
          <h2 id="amenities-mgmt-title">Quản lý tiện ích khách sạn</h2>
          <p className="muted">
            Lựa chọn các tiện ích khuôn viên, ẩm thực, nghỉ dưỡng và trang thiết
            bị đi kèm cho cơ sở lưu trú.
          </p>
        </div>
        <Tag color="gold">Đã chọn: {selectedIds.length} tiện ích</Tag>
      </div>

      {updateAmenitiesMutation.isError && (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
          title="Không thể cập nhật tiện ích"
          description={errorMessage(updateAmenitiesMutation.error)}
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {renderAmenityGroup(
          'Tiện ích khuôn viên & dịch vụ khách sạn',
          hotelCategoryAmenities,
        )}
        {renderAmenityGroup(
          'Tiện ích tiêu biểu đi kèm hạng phòng',
          roomCategoryAmenities,
        )}

        <div className="section-footer-actions">
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined aria-hidden="true" />}
              disabled={!isDirty}
              loading={updateAmenitiesMutation.isPending}
            >
              Lưu danh sách tiện ích
            </Button>
            <Button
              htmlType="button"
              icon={<UndoOutlined aria-hidden="true" />}
              disabled={!isDirty}
              onClick={() => reset({ amenityIds: initialAmenityIds })}
            >
              Khôi phục ban đầu
            </Button>
          </Space>
        </div>
      </form>
    </section>
  )
}

