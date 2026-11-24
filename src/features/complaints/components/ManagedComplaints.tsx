import { useState } from 'react'
import { Link } from 'react-router'
import { Alert, Button, Input, Select, Table, Tag } from 'antd'
import { useCurrentUser } from '@/features/auth'
import { PageHeader } from '@/shared/ui/PageHeader'
import { errorMessage } from '@/shared/api/api-error'
import { complaintCategoryLabels, complaintStatusLabels, complaintStatusColors } from '../model/complaint-labels'
import { useManagedComplaints } from '../hooks/use-managed-complaints'
import type { ComplaintStatus, ManagedComplaint } from '../api/management-complaint-api'
import '../complaints.css'
export function ManagedComplaints() {
  const { currentUser, isAdmin } = useCurrentUser()
  return <ComplaintQueue key={currentUser?.id} actorId={currentUser?.id ?? ''} admin={isAdmin} />
}
function ComplaintQueue({ actorId, admin }: { actorId: string; admin: boolean }) {
  const [page, setPage] = useState(0)
  const [status, setStatus] = useState<ComplaintStatus>()
  const [input, setInput] = useState('')
  const [keyword, setKeyword] = useState('')
  const query = useManagedComplaints(actorId, { page, size: 10, status, keyword })
  return <div className="complaint-workspace">
    <PageHeader title="Tiếp nhận & xử lý khiếu nại" description={admin ? 'Theo dõi và xử lý khiếu nại của khách trên toàn hệ thống.' : 'Theo dõi và xử lý khiếu nại tại các khách sạn thuộc bạn.'}
      extra={<Button loading={query.isFetching} disabled={!actorId} onClick={() => void query.refetch()}>Làm mới</Button>} />
    <section className="surface-card" aria-label="Danh sách khiếu nại">
      <div className="complaint-toolbar">
        <div className="complaint-filter"><label htmlFor="managed-complaint-status">Trạng thái</label>
          <Select id="managed-complaint-status" allowClear placeholder="Tất cả trạng thái" value={status}
            options={Object.entries(complaintStatusLabels).map(([value, label]) => ({ value, label }))} onChange={value => { setStatus(value); setPage(0) }} /></div>
        <Input.Search aria-label="Tìm khiếu nại" placeholder="Mã đặt phòng, người đặt hoặc nội dung" value={input} allowClear maxLength={100} enterButton="Tìm"
          onChange={event => { setInput(event.target.value); if (!event.target.value) { setKeyword(''); setPage(0) } }} onSearch={value => { setKeyword(value.trim()); setPage(0) }} />
      </div>
      <p className="muted" aria-live="polite">{query.data ? `${query.data.totalElements} khiếu nại` : query.isPending ? 'Đang tải khiếu nại…' : 'Chưa tải được khiếu nại'}</p>
      <p className="complaint-mobile-hint">Vuốt ngang để xem đầy đủ danh sách.</p>
      {query.isError ? <Alert type="error" showIcon title="Chưa tải được danh sách khiếu nại" description={errorMessage(query.error)}
        action={<Button loading={query.isFetching} onClick={() => void query.refetch()}>Thử lại</Button>} /> : <Table<ManagedComplaint> rowKey={row => row.complaint.id} loading={query.isPending} dataSource={query.data?.content ?? []}
        scroll={{ x: 1000 }} locale={{ emptyText: keyword || status ? 'Không có khiếu nại khớp bộ lọc.' : 'Chưa có khiếu nại trong phạm vi quản lý.' }}
        pagination={{ current: page + 1, pageSize: 10, total: query.data?.totalElements ?? 0, showSizeChanger: false, onChange: value => setPage(value - 1) }} columns={[
          { title: 'Đơn / Khách sạn', width: 220, render: (_, row) => <div><Link to={`/complaints/${row.complaint.id}`}>{row.bookingCode}</Link><div className="muted">{row.hotelName}</div></div> },
          { title: 'Người đặt', dataIndex: 'bookerName', width: 160 },
          { title: 'Khiếu nại', width: 280, render: (_, row) => <div><strong>{complaintCategoryLabels[row.complaint.category]}</strong><p className="complaint-excerpt">{row.complaint.content}</p></div> },
          { title: 'Trạng thái', width: 145, render: (_, row) => <Tag color={complaintStatusColors[row.complaint.status]}>{complaintStatusLabels[row.complaint.status]}</Tag> },
          { title: 'Ngày gửi', width: 180, render: (_, row) => new Date(row.complaint.createdAt).toLocaleString('vi-VN') },
          { title: 'Thao tác', width: 140, render: (_, row) => <Link to={`/complaints/${row.complaint.id}`}>Xem & xử lý</Link> },
        ]} />}
    </section>
  </div>
}
