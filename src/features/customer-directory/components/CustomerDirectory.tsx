import { useState } from 'react'
import { Button, Input, Table, Alert } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { ReloadOutlined } from '@ant-design/icons'
import { useCurrentUser } from '@/features/auth'
import { PageHeader } from '@/shared/ui/PageHeader'
import { errorMessage } from '@/shared/api/api-error'
import { useCustomerDirectory } from '../hooks/use-customer-directory'
import type { CustomerRow, CustomerScope } from '../api/customer-directory-api'
import '../customer-directory.css'

const dateTime = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Ho_Chi_Minh' })

export function CustomerDirectory() {
  const { currentUser, isAdmin } = useCurrentUser()
  const scope = isAdmin ? 'partners' : 'hotel-guests'
  return <CustomerDirectoryContent key={`${currentUser?.id}-${scope}`} actorId={currentUser?.id ?? ''} scope={scope} />
}

function CustomerDirectoryContent({ actorId, scope }: { actorId: string; scope: CustomerScope }) {
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [input, setInput] = useState('')
  const [keyword, setKeyword] = useState('')
  const query = useCustomerDirectory(actorId, scope, { page, size, keyword })
  const partners = scope === 'partners'
  const columns: ColumnsType<CustomerRow> = [
    { title: partners ? 'Owner' : 'Người đặt phòng', key: 'contact', width: 280,
      render: (_, row) => <div className="cd-contact"><strong>{row.fullName || 'Chưa có họ tên'}</strong>
        {row.email ? <a href={`mailto:${row.email}`}>{row.email}</a> : <span>Chưa có email liên hệ</span>}</div> },
    { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone', width: 160,
      render: (phone: string | null) => phone ? <a href={`tel:${phone}`}>{phone}</a> : 'Chưa có số điện thoại' },
    { title: partners ? 'Khách sạn ký hợp đồng' : 'Khách sạn đã đặt', dataIndex: 'hotelCount', key: 'hotels', width: 165, align: 'right' },
    { title: partners ? 'Hợp đồng đã kích hoạt' : 'Tổng đơn đặt', key: 'count', width: 165, align: 'right',
      render: (_, row) => 'contractCount' in row ? row.contractCount : row.bookingCount },
    { title: partners ? 'Đang hiệu lực' : 'Đơn hoàn thành', key: 'current', width: 145, align: 'right',
      render: (_, row) => 'activeContractCount' in row ? row.activeContractCount : row.completedBookingCount },
    { title: partners ? 'Tạo hợp đồng gần nhất' : 'Đặt phòng gần nhất', key: 'latest', width: 210,
      render: (_, row) => dateTime.format(new Date('lastContractCreatedAt' in row ? row.lastContractCreatedAt : row.lastBookedAt)) },
  ]
  const empty = keyword ? 'Không tìm thấy khách hàng phù hợp' : partners ? 'Chưa có owner đã ký hợp đồng' : 'Chưa có khách đặt phòng'
  const description = partners
    ? 'Các owner có hợp đồng đã được kích hoạt, gồm cả hợp đồng đã hết hạn hoặc chấm dứt.'
    : 'Người đặt phòng tại các khách sạn thuộc bạn. Mỗi người xuất hiện một lần; thông tin liên hệ lấy từ đơn gần nhất trong phạm vi này.'
  return <div className="customer-directory">
    <PageHeader title="Khách hàng" description={description} extra={<Button icon={<ReloadOutlined aria-hidden="true" />} loading={query.isFetching}
      disabled={!actorId || query.isFetching} onClick={() => void query.refetch()}>Làm mới</Button>} />
    <section className="cd-panel" aria-label={partners ? 'Danh sách owner đã ký hợp đồng' : 'Danh sách người đặt phòng'}>
      <div className="cd-toolbar"><div><h2>{partners ? 'Owner đã ký hợp đồng' : 'Khách đặt phòng'}</h2>
        <p aria-live="polite">{query.isPending ? 'Đang tải danh sách…' : query.data ? `${query.data.totalElements.toLocaleString('vi-VN')} ${partners ? 'owner' : 'người đặt phòng'}` : 'Chưa tải được danh sách'}</p></div>
        <Input.Search aria-label="Tìm khách hàng theo tên, email hoặc số điện thoại" placeholder="Tên, email hoặc số điện thoại"
          value={input} maxLength={100} allowClear enterButton="Tìm" onChange={event => { setInput(event.target.value); if (!event.target.value) { setKeyword(''); setPage(0) } }}
          onSearch={value => { setKeyword(value.trim()); setPage(0) }} /></div>
      <p className="cd-mobile-hint">Vuốt ngang bảng để xem thêm thông tin.</p>
      {query.isError && !query.data ? <div className="cd-error"><Alert type="error" showIcon title="Chưa tải được danh sách khách hàng"
        description={errorMessage(query.error)} action={<Button loading={query.isFetching} onClick={() => void query.refetch()}>Thử lại</Button>} /></div> : <>
        {query.isError && <Alert type="error" showIcon title="Chưa cập nhật được danh sách" description={errorMessage(query.error)} action={<Button onClick={() => void query.refetch()}>Thử lại</Button>} />}
        <Table<CustomerRow> rowKey="id" columns={columns} dataSource={query.data?.content ?? []} loading={query.isPending}
          scroll={{ x: 1125 }} locale={{ emptyText: <div className="cd-empty"><strong>{empty}</strong><p>{keyword ? 'Thử tên, email hoặc số điện thoại khác.' : partners ? 'Owner sẽ xuất hiện sau khi có hợp đồng được kích hoạt. Dự thảo và hợp đồng chấm dứt chưa xác định được lịch sử kích hoạt chưa được tính.' : 'Danh sách sẽ cập nhật khi có đơn đặt phòng tại khách sạn của bạn.'}</p>
            {keyword && <Button onClick={() => { setInput(''); setKeyword(''); setPage(0) }}>Xóa tìm kiếm</Button>}</div> }}
          pagination={{ current: page + 1, pageSize: size, total: query.data?.totalElements ?? 0, showSizeChanger: true, pageSizeOptions: [10, 20, 50],
            onChange: (next, nextSize) => { setPage(nextSize === size ? next - 1 : 0); setSize(nextSize) }, showTotal: (total, range) => `${range[0]}–${range[1]} / ${total}` }} />
      </>}
    </section>
  </div>
}
