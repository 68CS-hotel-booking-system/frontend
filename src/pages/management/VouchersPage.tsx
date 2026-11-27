import { useState } from 'react'
import { Alert, Button, Pagination } from 'antd'
import { useCurrentUser } from '@/features/auth'
import { useManagementHotelsQuery } from '@/features/hotels'
import { VoucherPanel } from '@/features/vouchers'
import { PageHeader } from '@/shared/ui/PageHeader'
import { PageLoading } from '@/shared/ui/PageLoading'
import { ErrorState } from '@/shared/ui/ErrorState'
export function VouchersPage() {
 const { currentUser, isAdmin } = useCurrentUser()
 const [hotelPage, setHotelPage] = useState(0), [chosen, setChosen] = useState('')
 const hotels = useManagementHotelsQuery({ page: hotelPage, size: 50 })
 if (isAdmin || !currentUser?.roles.includes('HOTEL_OWNER')) return <Alert type="warning" title="Voucher chỉ dành cho chủ khách sạn." />
 const selected = hotels.data?.content.find(h => h.id === chosen)?.id ?? hotels.data?.content[0]?.id
 return <div className="max-w-5xl mx-auto"><PageHeader title="Voucher & ưu đãi" description="Tạo và quản lý mã giảm giá cho từng khách sạn." />
  {hotels.isPending ? <PageLoading /> : hotels.isError ? <ErrorState error={hotels.error} onRetry={() => void hotels.refetch()} /> : !hotels.data.content.length ? <p>Bạn chưa có khách sạn để tạo voucher.</p> : <>
   <div className="voucher-page-hotel"><label htmlFor="voucher-hotel">Khách sạn</label><select id="voucher-hotel" value={selected} onChange={e => setChosen(e.target.value)}>{hotels.data.content.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}</select><Button onClick={() => void hotels.refetch()}>Tải lại khách sạn</Button></div>
   {hotels.data.totalPages > 1 && <Pagination current={hotelPage + 1} total={hotels.data.totalElements} pageSize={50} showSizeChanger={false} onChange={p => { setChosen(''); setHotelPage(p - 1) }} />}
   {selected && <VoucherPanel key={selected} hotelId={selected} />}
  </>}
 </div>
}
