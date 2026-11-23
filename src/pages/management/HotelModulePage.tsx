import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Pagination, Select, Space } from 'antd'
import { useManagementHotelsQuery, useManagementHotelDetailQuery, type ManagementHotelSummary } from '@/features/hotels'
import { BookingList } from '@/features/bookings'
import { ApiHotelContractsSection } from '@/features/contracts'
import { ApiFinancialAccessSection, HotelContractNotice } from '@/features/finance'
import { PageHeader } from '@/shared/ui/PageHeader'
import { ErrorState } from '@/shared/ui/ErrorState'
import { EmptyState } from '@/shared/ui/EmptyState'
import { PageLoading } from '@/shared/ui/PageLoading'

export function HotelModulePage({ module }: { module: 'bookings' | 'contracts' | 'financial-access' }) {
  const [params] = useSearchParams()
  const [page, setPage] = useState(0)
  const [chosen, setChosen] = useState<ManagementHotelSummary>()
  const query = useManagementHotelsQuery({ page, size: 50 })
  const requestedId = params.get('hotelId') ?? ''
  const requestedInPage = query.data?.content.find(hotel => hotel.id === requestedId)
  const requested = useManagementHotelDetailQuery(requestedId && query.isSuccess && !requestedInPage ? requestedId : '')
  const selected = chosen ?? requestedInPage ?? requested.data ?? (!requestedId ? query.data?.content[0] : undefined)
  const title = { bookings: 'Quản lý đặt phòng', contracts: 'Hợp đồng hoa hồng', 'financial-access': 'Phân quyền tài chính' }[module]
  const kicker = {
    bookings: 'VẬN HÀNH LƯU TRÚ',
    contracts: 'HỢP ĐỒNG & ĐỐI TÁC',
    'financial-access': 'TÀI CHÍNH & PHÂN QUYỀN',
  }[module]
  return <div className="w-full max-w-6xl mx-auto space-y-6"><PageHeader kicker={kicker} title={title} description="Chọn khách sạn thuộc phạm vi quản lý để tiếp tục." />
    {query.isPending ? <PageLoading /> : query.isError ? <ErrorState error={query.error} onRetry={() => void query.refetch()} /> : !query.data.content.length && !requestedId ? <EmptyState title="Chưa có khách sạn trong phạm vi quản lý" action={<Link to="/hotels">Quản lý khách sạn</Link>} /> : <>
      <Space wrap style={{ marginBottom: 24 }}><label htmlFor="module-hotel">Khách sạn</label><Select id="module-hotel" value={selected?.id} style={{ minWidth: 240, maxWidth: '100%' }}
        options={[...(selected && !query.data.content.some(h => h.id === selected.id) ? [selected] : []), ...query.data.content].map((hotel) => ({ value: hotel.id, label: hotel.name }))} onChange={(id) => setChosen(query.data.content.find((hotel) => hotel.id === id))} />
        <Pagination current={page + 1} pageSize={50} total={query.data.totalElements} showSizeChanger={false} onChange={(next) => setPage(next - 1)} />
      </Space>
      {module === 'contracts' && selected && <HotelContractNotice hotelId={selected.id} />}
      {!chosen && requestedId && !requestedInPage && (requested.isPending ? <PageLoading /> : requested.isError ? <ErrorState error={requested.error} onRetry={() => void requested.refetch()} /> : null)}
      {selected && (module === 'bookings' ? <BookingList key={selected.id} hotelId={selected.id} /> : module === 'contracts' ?
        <ApiHotelContractsSection key={selected.id} hotelId={selected.id} hotelName={selected.name} ownerUserId={selected.ownerUserId} /> :
        <ApiFinancialAccessSection key={selected.id} hotelId={selected.id} hotelName={selected.name} defaultOwnerUserId={selected.ownerUserId} />)}
    </>}
  </div>
}
