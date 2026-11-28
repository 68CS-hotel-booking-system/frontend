import type { CSSProperties } from 'react'
import { Alert, Button, Table, Tag } from 'antd'
import { Link } from 'react-router'
import { errorMessage } from '@/shared/api/api-error'
import { PageLoading } from '@/shared/ui/PageLoading'
import { useFinanceDashboard } from '../hooks/use-finance-dashboard'
import { contractSalesLabels, isContractEndingSoon } from '../model/contract-status'
import { RevenueCharts } from './RevenueCharts'

const money = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value)

export function RevenueDashboard() {
  const { query, isAdmin, canView } = useFinanceDashboard()
  if (!canView) return null
  return <section className="surface-card min-w-0 space-y-5" aria-labelledby="revenue-title">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><h2 id="revenue-title" className="m-0 text-xl font-semibold">Doanh thu &amp; hoa hồng</h2>
        <p className="muted mt-1">Toàn bộ thời gian · {isAdmin ? 'Tất cả khách sạn' : 'Theo hợp đồng của bạn'}</p></div>
      <Button loading={query.isFetching} onClick={() => void query.refetch()}>Làm mới doanh thu</Button>
    </div>
    {query.isPending ? <PageLoading /> : query.isError ? <Alert type="error" showIcon title="Chưa tải được doanh thu"
      description={errorMessage(query.error)} action={<Button loading={query.isFetching} onClick={() => void query.refetch()}>Thử lại</Button>} /> : <>
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: isAdmin ? 'Doanh thu nền tảng' : 'Doanh thu của bạn', value: isAdmin ? query.data.platformAmount : query.data.ownerAmount },
          { label: isAdmin ? 'Khoản owner được hưởng' : 'Hoa hồng nền tảng được trừ', value: isAdmin ? query.data.ownerAmount : query.data.platformAmount },
          { label: 'Doanh thu lưu trú hoàn thành', value: query.data.completedAmount },
          { label: 'Tiền khách đã thanh toán', value: query.data.collectedAmount },
        ].map(({ label, value }, index) => (
          <div
            key={label}
            className="min-w-0 rounded-xl border border-[#dce7e3] bg-[#fafdfc] p-4 transition-colors hover:border-[#bfd3cd] dash-enter"
            style={{ '--dash-delay': `${index * 45}ms` } as CSSProperties}
          >
            <dt className="text-xs font-medium text-[#5f736e]">{label}</dt>
            <dd className="m-0 mt-2 break-words text-2xl font-semibold tabular-nums text-[#12211d]">{money(value)}</dd>
          </div>
        ))}
      </dl>
      <RevenueCharts data={query.data} isAdmin={isAdmin} />
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[['Đang chờ / xử lý hoàn', query.data.pendingRefundAmount], ['Đã hoàn cho khách', query.data.refundedAmount], ['Tiền còn lại sau hoàn', query.data.netCollectedAmount]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd className="m-0 font-semibold tabular-nums">{money(Number(value))}</dd></div>)}
      </dl>
      <Link to="/refunds">Xem các khoản hoàn tiền</Link>
      <p className="muted">Hoa hồng và khoản owner được hưởng chỉ tính từ đơn đã trả phòng, theo tỷ lệ lưu lúc đặt. Đơn hủy trước nhận phòng không phát sinh khoản chia. Tiền khách đã thanh toán là khoản nền tảng thu hộ. Tiền còn lại sau hoàn = tiền khách đã thanh toán − tiền đã hoàn; vẫn bao gồm khoản đang chờ hoàn. Chi trả owner thực hiện ngoài hệ thống.</p>
      <details><summary className="cursor-pointer font-medium text-[#0b5f53] focus-visible:outline-2 focus-visible:outline-offset-4">Cách tính phân chia</summary>
        <p className="muted mt-2">Hoa hồng = tiền phòng sau giảm giá × rate hợp đồng, làm tròn đến đồng cho từng đơn rồi cộng vào báo cáo. Khoản owner = tổng tiền đơn − hoa hồng.</p>
      </details>
      {query.data.missingCommissionCount > 0 && <Alert type="warning" showIcon title={`${query.data.missingCommissionCount} đơn hoàn thành chưa có dữ liệu hoa hồng`}
        description="Các đơn này được tính vào doanh thu lưu trú nhưng chưa được tính vào khoản chia cho nền tảng và owner." />}
      <div>
        <h3 className="text-base font-semibold">Phân chia theo hợp đồng</h3>
        <p className="muted">Rate được lưu lúc đặt phòng. Gia hạn hoặc thay đổi chủ khách sạn không làm thay đổi khoản chia đã chốt.</p>
        <p className="muted sm:hidden">Vuốt ngang bảng để xem đầy đủ các khoản chia.</p>
        <Table rowKey={row => `${row.contractId}-${row.commissionRate}`} size="small" scroll={{ x: 1010 }} dataSource={query.data.contracts}
          pagination={{ pageSize: 5, showSizeChanger: false }} locale={{ emptyText: 'Chưa có đơn đã trả phòng có dữ liệu phân chia theo hợp đồng.' }}
          columns={[
            { title: 'Hợp đồng / Khách sạn', width: 230, render: (_, row) => <div className="space-y-1 break-words">
              <div>{row.canManageHotel ? <Link className="break-all" to={`/contracts?hotelId=${row.hotelId}`}>{row.contractCode}</Link> : <strong className="break-all">{row.contractCode}</strong>}</div>
              <div>{row.hotelName}</div>
              {!row.canManageHotel && <Tag>Khách sạn đã đổi chủ</Tag>}
            </div> },
            { title: 'Rate đã chốt', width: 80, align: 'right', render: (_, row) => `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(row.commissionRate)}%` },
            { title: 'Đơn hoàn thành', width: 100, dataIndex: 'completedBookingCount', align: 'right' },
            { title: 'Tiền phòng sau giảm', width: 150, dataIndex: 'basisAmount', align: 'right', render: money },
            { title: 'Tổng tiền đơn', width: 150, dataIndex: 'completedAmount', align: 'right', render: money },
            { title: 'Nền tảng hưởng', width: 150, dataIndex: 'platformAmount', align: 'right', render: money },
            { title: 'Owner hưởng', width: 150, dataIndex: 'ownerAmount', align: 'right', render: money },
          ]} />
      </div>
      <div>
        <h3 className="text-base font-semibold">Hợp đồng &amp; trạng thái mở bán</h3>
        <Table rowKey="hotelId" size="small" scroll={{ x: 640 }} dataSource={query.data.hotels}
          pagination={{ pageSize: 5, showSizeChanger: false }} locale={{ emptyText: 'Chưa có khách sạn đang thuộc quyền quản lý của bạn.' }}
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
