import { useState } from 'react'
import { Link } from 'react-router'
import { Empty, Pagination, Select } from 'antd'
import { HotelStaffPanel, useStaffHotels } from '@/features/hotel-staff'
import { PageHeader } from '@/shared/ui/PageHeader'
import { ErrorState } from '@/shared/ui/ErrorState'
import '@/shared/styles/account.css'
export function HotelStaffPage() {
  const [page, setPage] = useState(0)
  const [hotelId, setHotelId] = useState('')
  const hotels = useStaffHotels(page)
  const selected = hotels.data?.content.find((hotel) => hotel.id === hotelId)
  return <div className="account-workspace">
    <PageHeader title="Nhân sự khách sạn" description="Phân công quản lý và lễ tân cho từng cơ sở."
      extra={<Link to="/account">Hồ sơ của tôi</Link>} />
    {hotels.isError ? <ErrorState error={hotels.error} onRetry={() => void hotels.refetch()} /> :
      <>
        <div className="account-toolbar"><div>
          <label htmlFor="staff-hotel">Khách sạn</label>
          <Select id="staff-hotel" style={{ width: '100%' }} loading={hotels.isPending} placeholder="Chọn khách sạn"
            value={selected?.id} onChange={setHotelId} showSearch optionFilterProp="label"
            options={hotels.data?.content.map((hotel) => ({ value: hotel.id, label: hotel.name })) ?? []} />
        </div>
        <Pagination current={page+1} total={hotels.data?.totalElements ?? 0} pageSize={20} showSizeChanger={false}
          onChange={(next) => { setPage(next-1); setHotelId('') }} hideOnSinglePage />
        </div>
        {selected ? <HotelStaffPanel key={selected.id} hotel={selected} /> :
          <Empty description={hotels.data?.totalElements === 0 ? 'Bạn chưa được phân quyền quản lý nhân sự tại khách sạn nào.' : 'Chọn một khách sạn để xem và phân công nhân sự.'} />}
      </>}
  </div>
}
