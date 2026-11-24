import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { ShopOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Pagination, Select } from 'antd'
import { useCurrentUser } from '@/features/auth'
import { useManagementHotelsQuery, useManagementHotelDetailQuery, type ManagementHotelSummary } from '@/features/hotels'
import { BookingList } from '@/features/bookings'
import { ApiHotelContractsSection } from '@/features/contracts'
import { HotelContractNotice } from '@/features/finance'
import { UserDetailModal, useHotelOwnerLookup } from '@/features/users'
import { PageHeader } from '@/shared/ui/PageHeader'
import { ErrorState } from '@/shared/ui/ErrorState'
import { EmptyState } from '@/shared/ui/EmptyState'
import { PageLoading } from '@/shared/ui/PageLoading'

export function HotelModulePage({ module }: { module: 'bookings' | 'contracts' }) {
  const [params] = useSearchParams()
  const [page, setPage] = useState(0)
  const [chosen, setChosen] = useState<ManagementHotelSummary>()
  const [selectedOwnerId, setSelectedOwnerId] = useState<string | undefined>()
  const [ownerModalOpen, setOwnerModalOpen] = useState(false)
  const { isAdmin } = useCurrentUser()
  const query = useManagementHotelsQuery({ page, size: 50 })
  const requestedId = params.get('hotelId') ?? ''
  const allHotels = query.data?.content ?? []
  const visibleHotels = selectedOwnerId ? allHotels.filter((hotel) => hotel.ownerUserId === selectedOwnerId) : allHotels
  const requestedInPage = visibleHotels.find((hotel) => hotel.id === requestedId)
  const requested = useManagementHotelDetailQuery(
    requestedId && query.isSuccess && !allHotels.some((hotel) => hotel.id === requestedId) ? requestedId : '',
  )
  const effectiveChosen = chosen && (!selectedOwnerId || chosen.ownerUserId === selectedOwnerId) ? chosen : undefined
  const selected = selectedOwnerId
    ? (effectiveChosen ?? visibleHotels[0])
    : (effectiveChosen ?? requestedInPage ?? requested.data ?? (!requestedId ? visibleHotels[0] : undefined))
  const ownerLookup = useHotelOwnerLookup(selected?.ownerUserId, isAdmin)

  const title = {
    bookings: 'Quản lý đặt phòng',
    contracts: 'Hợp đồng hoa hồng',
  }[module]
  const kicker = {
    bookings: 'VẬN HÀNH LƯU TRÚ',
    contracts: 'HỢP ĐỒNG & ĐỐI TÁC',
  }[module]

  const ownerHotelCounts = new Map<string, number>()
  for (const hotel of allHotels) {
    if (hotel.ownerUserId) {
      ownerHotelCounts.set(hotel.ownerUserId, (ownerHotelCounts.get(hotel.ownerUserId) ?? 0) + 1)
    }
  }

  const ownerOptions = isAdmin
    ? [
        ...ownerLookup.owners.map((owner) => {
          const count = ownerHotelCounts.get(owner.id) ?? 0
          return {
            value: owner.id,
            label: `${owner.fullName} (${count})`,
            name: owner.fullName,
            email: owner.email,
            count,
          }
        }),
        ...Array.from(ownerHotelCounts.entries())
          .filter(([ownerId]) => !ownerLookup.owners.some((owner) => owner.id === ownerId))
          .map(([ownerId, count]) => ({
            value: ownerId,
            label: `Chủ sở hữu (${ownerId.slice(0, 8)}…) (${count})`,
            name: ownerId,
            email: '',
            count,
          })),
      ].sort((a, b) => {
        if ((b.count > 0) !== (a.count > 0)) return b.count > 0 ? 1 : -1
        if (b.count !== a.count) return b.count - a.count
        return a.name.localeCompare(b.name, 'vi')
      })
    : []

  const hotelOptions = [
    ...(!selectedOwnerId && selected && query.data && !allHotels.some((h) => h.id === selected.id) ? [selected] : []),
    ...visibleHotels,
  ].map((hotel) => ({ value: hotel.id, label: hotel.name }))

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <PageHeader kicker={kicker} title={title} description="Chọn khách sạn thuộc phạm vi quản lý để tiếp tục." />
      {query.isPending ? (
        <PageLoading />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
      ) : !allHotels.length && !requestedId ? (
        <EmptyState title="Chưa có khách sạn trong phạm vi quản lý" action={<Link to="/hotels">Quản lý khách sạn</Link>} />
      ) : (
        <>
          <div className="bg-white border border-[#dce7e3] rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 flex-1 min-w-0">
              {isAdmin && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-1 min-w-0">
                  <label
                    htmlFor="module-owner"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#12211d] shrink-0"
                  >
                    <UserOutlined className="text-[#0b5f53]" aria-hidden="true" />
                    <span>Chủ sở hữu</span>
                  </label>
                  <Select
                    id="module-owner"
                    showSearch
                    allowClear
                    size="large"
                    loading={ownerLookup.isPending}
                    value={selectedOwnerId}
                    className="w-full lg:min-w-[240px]"
                    placeholder="Tất cả chủ sở hữu"
                    options={ownerOptions}
                    filterOption={(input, option) => {
                      const keyword = input.trim().toLowerCase()
                      if (!keyword) return true
                      const name = option?.name?.toLowerCase() ?? ''
                      const email = option?.email?.toLowerCase() ?? ''
                      return name.includes(keyword) || email.includes(keyword)
                    }}
                    optionRender={(option) => (
                      <div className="flex items-center justify-between gap-2 py-0.5 min-w-0">
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-[#12211d] truncate">{option.data.name}</div>
                          {option.data.email && (
                            <div className="text-xs text-[#64748b] truncate">{option.data.email}</div>
                          )}
                        </div>
                        <span className="text-xs font-medium text-[#0b5f53] bg-[#edf6f3] px-2 py-0.5 rounded-full shrink-0">
                          {option.data.count} KS
                        </span>
                      </div>
                    )}
                    onChange={(nextOwnerId) => {
                      setSelectedOwnerId(nextOwnerId)
                      setChosen(undefined)
                      setOwnerModalOpen(false)
                    }}
                  />
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-1 min-w-0">
                <label
                  htmlFor="module-hotel"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#12211d] shrink-0"
                >
                  <ShopOutlined className="text-[#0b5f53]" aria-hidden="true" />
                  <span>Khách sạn</span>
                </label>
                <Select
                  id="module-hotel"
                  showSearch
                  optionFilterProp="label"
                  size="large"
                  value={selected?.id}
                  disabled={visibleHotels.length === 0 && !(!selectedOwnerId && Boolean(selected))}
                  className="w-full lg:min-w-[260px]"
                  placeholder={
                    selectedOwnerId && visibleHotels.length === 0
                      ? 'Không có khách sạn thuộc chủ sở hữu này'
                      : 'Chọn khách sạn...'
                  }
                  options={hotelOptions}
                  onChange={(id) => {
                    setChosen(visibleHotels.find((hotel) => hotel.id === id))
                    setOwnerModalOpen(false)
                  }}
                />
              </div>
            </div>
            {query.data.totalElements > 50 && (
              <Pagination
                current={page + 1}
                pageSize={50}
                total={query.data.totalElements}
                showSizeChanger={false}
                onChange={(next) => setPage(next - 1)}
              />
            )}
          </div>

          {selectedOwnerId && visibleHotels.length === 0 ? (
            <EmptyState
              title="Chủ sở hữu này chưa có khách sạn nào"
              description="Chọn chủ sở hữu khác hoặc xóa bộ lọc để xem toàn bộ danh sách khách sạn."
              action={
                <Button
                  onClick={() => {
                    setSelectedOwnerId(undefined)
                    setChosen(undefined)
                  }}
                >
                  Xem tất cả chủ sở hữu
                </Button>
              }
            />
          ) : (
            <>
              {module === 'contracts' && selected && <HotelContractNotice hotelId={selected.id} hideActionLink />}

              {!effectiveChosen && requestedId && !requestedInPage && !selectedOwnerId && (
                requested.isPending ? (
                  <PageLoading />
                ) : requested.isError ? (
                  <ErrorState error={requested.error} onRetry={() => void requested.refetch()} />
                ) : null
              )}

              {selected && (
                module === 'bookings' ? (
                  <BookingList key={selected.id} hotelId={selected.id} />
                ) : (
                  <>
                    <ApiHotelContractsSection
                      key={selected.id}
                      hotelId={selected.id}
                      hotelName={selected.name}
                      ownerUserId={selected.ownerUserId}
                      owner={ownerLookup.owner}
                      ownerLoading={Boolean(isAdmin && selected.ownerUserId && ownerLookup.isPending)}
                      onViewOwner={() => setOwnerModalOpen(true)}
                    />
                    <UserDetailModal
                      title="Thông tin chủ sở hữu"
                      user={ownerLookup.owner}
                      open={ownerModalOpen}
                      onClose={() => setOwnerModalOpen(false)}
                    />
                  </>
                )
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
