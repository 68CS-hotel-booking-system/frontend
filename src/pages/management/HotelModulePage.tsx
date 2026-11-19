import { useState } from 'react'
import { Link } from 'react-router'
import { Pagination, Select, Space } from 'antd'
import { useManagementHotelsQuery, type ManagementHotelSummary } from '@/features/hotels'
import { BookingList } from '@/features/bookings'
import { ApiHotelContractsSection } from '@/features/contracts'
import { ApiFinancialAccessSection } from '@/features/finance'
import { PageHeader } from '@/shared/ui/PageHeader'
import { ErrorState } from '@/shared/ui/ErrorState'
import { EmptyState } from '@/shared/ui/EmptyState'
import { PageLoading } from '@/shared/ui/PageLoading'

export function HotelModulePage({ module }: { module: 'bookings' | 'contracts' | 'financial-access' }) {
  const [page, setPage] = useState(0)
  const [chosen, setChosen] = useState<ManagementHotelSummary>()
  const query = useManagementHotelsQuery({ page, size: 50 })
  const selected = chosen ?? query.data?.content[0]
  const title = { bookings: 'Quản lý đặt phòng', contracts: 'Hợp đồng lưu trú', 'financial-access': 'Phân quyền tài chính' }[module]
  return <div><PageHeader title={title} description="Chọn khách sạn thuộc phạm vi quản lý để tiếp tục." />
    {query.isPending ? <PageLoading /> : query.isError ? <ErrorState error={query.error} onRetry={() => void query.refetch()} /> : !query.data.content.length ? <EmptyState title="Chưa có khách sạn trong phạm vi quản lý" action={<Link to="/hotels">Quản lý khách sạn</Link>} /> : <>
      <Space wrap style={{ marginBottom: 24 }}><label htmlFor="module-hotel">Khách sạn</label><Select id="module-hotel" value={selected?.id} style={{ minWidth: 240, maxWidth: '100%' }}
        options={query.data.content.map((hotel) => ({ value: hotel.id, label: hotel.name }))} onChange={(id) => setChosen(query.data.content.find((hotel) => hotel.id === id))} />
        <Pagination current={page + 1} pageSize={50} total={query.data.totalElements} showSizeChanger={false} onChange={(next) => setPage(next - 1)} />
      </Space>
      {selected && (module === 'bookings' ? <BookingList key={selected.id} hotelId={selected.id} /> : module === 'contracts' ?
        <ApiHotelContractsSection key={selected.id} hotelId={selected.id} hotelName={selected.name} ownerUserId={selected.ownerUserId} /> :
        <ApiFinancialAccessSection key={selected.id} hotelId={selected.id} hotelName={selected.name} defaultOwnerUserId={selected.ownerUserId} />)}
    </>}
  </div>
}
