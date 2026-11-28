import { Select } from 'antd'
import { useSearchParams } from 'react-router'
import { HotelStaffPanel, useStaffHotels } from '@/features/hotel-staff'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { PageHeader } from '@/shared/ui/PageHeader'
import { PageLoading } from '@/shared/ui/PageLoading'

export function HotelStaffPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const hotelsQuery = useStaffHotels(0)
  const hotels = hotelsQuery.data?.content ?? []
  const requestedId = searchParams.get('hotelId')
  const selectedHotel =
    hotels.find((hotel) => hotel.id === requestedId) ?? hotels[0]

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="QUẢN LÝ NHÂN SỰ"
        title="Nhân sự khách sạn"
        description="Phân công quản lý và lễ tân theo từng khách sạn để vận hành nhận phòng, trả phòng và xử lý đơn đặt phòng."
      />

      {hotelsQuery.isPending ? (
        <PageLoading />
      ) : hotelsQuery.isError ? (
        <ErrorState error={hotelsQuery.error} onRetry={() => void hotelsQuery.refetch()} />
      ) : hotels.length === 0 ? (
        <EmptyState
          title="Bạn chưa quản lý khách sạn nào"
          description="Tạo hoặc được phân công quản lý khách sạn để bắt đầu thiết lập danh sách nhân sự."
        />
      ) : (
        <div className="surface-card space-y-5">
          {hotels.length > 1 && (
            <div className="flex flex-wrap items-center gap-3">
              <label htmlFor="staff-hotel-select" className="text-sm font-medium text-[#12211d]">
                Chọn khách sạn
              </label>
              <Select
                id="staff-hotel-select"
                className="min-w-[260px]"
                value={selectedHotel?.id}
                options={hotels.map((hotel) => ({ value: hotel.id, label: hotel.name }))}
                onChange={(nextId) => {
                  const next = new URLSearchParams(searchParams)
                  next.set('hotelId', nextId)
                  setSearchParams(next, { replace: true })
                }}
              />
            </div>
          )}

          {selectedHotel && <HotelStaffPanel key={selectedHotel.id} hotel={selectedHotel} />}
        </div>
      )}
    </div>
  )
}
