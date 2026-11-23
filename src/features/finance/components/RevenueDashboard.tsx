import { Alert, Button, Table, Tag } from 'antd'
import { Link } from 'react-router'
import { errorMessage } from '@/shared/api/api-error'
import { PageLoading } from '@/shared/ui/PageLoading'
import { useFinanceDashboard } from '../hooks/use-finance-dashboard'
import { contractSalesLabels, isContractEndingSoon } from '../model/contract-status'

const money = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value)

export function RevenueDashboard() {
  const { query, isAdmin, canView } = useFinanceDashboard()
  if (!canView) return null
  return <section className="surface-card space-y-5" aria-labelledby="revenue-title">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><h2 id="revenue-title" className="m-0 text-xl font-semibold">Doanh thu &amp; hoa hồng</h2>
        <p className="muted mt-1">Toàn bộ thời gian · {isAdmin ? 'Tất cả khách sạn' : 'Các khách sạn của bạn'}</p></div>
      <Button loading={query.isFetching} onClick={() => void query.refetch()}>Làm mới doanh thu</Button>
    </div>
    {query.isPending ? <PageLoading /> : query.isError ? <Alert type="error" showIcon title="Chưa tải được doanh thu"
      description={errorMessage(query.error)} action={<Button loading={query.isFetching} onClick={() => void query.refetch()}>Thử lại</Button>} /> : <>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Tiền khách đã thanh toán', query.data.collectedAmount],
          ['Doanh thu lưu trú hoàn thành', query.data.completedAmount],
          [isAdmin ? 'Hoa hồng nền tảng' : 'Hoa hồng nền tảng được trừ', query.data.platformAmount],
          ['Khoản owner được hưởng', query.data.ownerAmount],
        ].map(([label, value]) => <div key={label} className="min-w-0 border-b border-[#dce7e3] pb-4">
          <dt className="text-sm text-[#5f736e]">{label}</dt>
          <dd className="m-0 mt-2 break-words text-2xl font-semibold tabular-nums text-[#12211d]">{money(Number(value))}</dd>
        </div>)}
      </dl>
      <p className="muted">Hoa hồng và khoản owner được hưởng chỉ tính từ đơn đã trả phòng, theo tỷ lệ lưu lúc đặt. Chi trả owner thực hiện ngoài hệ thống. Chưa bao gồm điều chỉnh hoàn tiền.</p>
      {query.data.missingCommissionCount > 0 && <Alert type="warning" showIcon title={`${query.data.missingCommissionCount} đơn hoàn thành chưa có dữ liệu hoa hồng`}
        description="Các đơn này được tính vào doanh thu lưu trú nhưng chưa được tính vào khoản chia cho nền tảng và owner." />}
      <div>
        <h3 className="text-base font-semibold">Hợp đồng &amp; trạng thái mở bán</h3>
        <Table rowKey="hotelId" size="small" scroll={{ x: 640 }} dataSource={query.data.hotels}
          pagination={{ pageSize: 5, showSizeChanger: false }} locale={{ emptyText: 'Chưa có khách sạn trong phạm vi của bạn.' }}
          columns={[
            { title: 'Khách sạn', dataIndex: 'hotelName', render: (name: string, hotel) => <Link to={`/hotels/${hotel.hotelId}`}>{name}</Link> },
            { title: 'Hợp đồng', render: (_, hotel) => <><Tag color={hotel.contractStatus === 'EFFECTIVE' ? 'green' : 'orange'}>{contractSalesLabels[hotel.contractStatus] ?? hotel.contractStatus}</Tag>
              {hotel.contractStatus === 'EFFECTIVE' && isContractEndingSoon(hotel.endsAt, query.dataUpdatedAt) && <Tag color="orange">Sắp hết hạn</Tag>}</> },
            { title: 'Mở bán', render: (_, hotel) => hotel.acceptingBookings ? 'Đang mở bán' : 'Đã ngừng bán' },
            { title: 'Đến ngày', render: (_, hotel) => hotel.endsAt ? new Date(hotel.endsAt).toLocaleDateString('vi-VN') : '—' },
            { title: 'Thao tác', render: (_, hotel) => <Link to={`/contracts?hotelId=${hotel.hotelId}`}>Xem hợp đồng</Link> },
          ]} />
      </div>
    </>}
  </section>
}
