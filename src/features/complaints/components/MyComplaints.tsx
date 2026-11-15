import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button, Descriptions, Drawer, Select, Space, Table, Tag } from 'antd'
import { ErrorState } from '@/shared/ui/ErrorState'
import { PageLoading } from '@/shared/ui/PageLoading'
import { getMyComplaint, listMyComplaints } from '../api/complaint-api'
import { complaintCategoryLabels } from '../model/complaint-labels'

const statusLabels: Record<string, string> = { OPEN: 'Đã tiếp nhận', IN_REVIEW: 'Đang xử lý', RESOLVED: 'Đã giải quyết', REJECTED: 'Đã từ chối' }
export function MyComplaints() {
  const [page, setPage] = useState(0)
  const [status, setStatus] = useState<string>()
  const [id, setId] = useState<string>()
  const query = useQuery({ queryKey: ['complaints', 'mine', { page, status }], queryFn: ({ signal }) => listMyComplaints({ page, size: 10, status }, signal), retry: false })
  const detail = useQuery({ queryKey: ['complaints', 'detail', id], queryFn: ({ signal }) => getMyComplaint(id!, signal), enabled: Boolean(id), retry: false })
  return <section className="surface-card">
    <div className="section-header"><h2>Khiếu nại của tôi</h2><Button loading={query.isFetching} onClick={() => void query.refetch()}>Làm mới</Button></div>
    <Space style={{ marginBottom: 20 }}><label htmlFor="complaint-status">Trạng thái</label><Select id="complaint-status" allowClear placeholder="Tất cả" value={status} style={{ minWidth: 160 }}
      options={Object.entries(statusLabels).map(([value, label]) => ({ value, label }))} onChange={(value) => { setStatus(value); setPage(0) }} /></Space>
    {query.isError ? <ErrorState error={query.error} onRetry={() => void query.refetch()} /> : <Table rowKey="id" dataSource={query.data?.content} loading={query.isPending} pagination={{ current: page + 1, pageSize: 10, total: query.data?.totalElements, showSizeChanger: false, onChange: (value) => setPage(value - 1) }} columns={[
      { title: 'Loại', render: (_, item) => <Button type="link" onClick={() => setId(item.id)}>{complaintCategoryLabels[item.category]}</Button> },
      { title: 'Nội dung', dataIndex: 'content', ellipsis: true }, { title: 'Trạng thái', render: (_, item) => <Tag>{statusLabels[item.status]}</Tag> },
      { title: 'Ngày gửi', render: (_, item) => new Date(item.createdAt).toLocaleString('vi-VN') },
    ]} />}
    <Drawer title="Chi tiết khiếu nại" open={Boolean(id)} onClose={() => setId(undefined)} size="min(378px, 100vw)" destroyOnHidden>
      {detail.isPending ? <PageLoading /> : detail.isError ? <ErrorState error={detail.error} onRetry={() => void detail.refetch()} /> : detail.data && <Descriptions column={1} items={[
        { key: 'type', label: 'Loại', children: complaintCategoryLabels[detail.data.category] }, { key: 'status', label: 'Trạng thái', children: statusLabels[detail.data.status] },
        { key: 'content', label: 'Nội dung', children: <p style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{detail.data.content}</p> },
        { key: 'date', label: 'Cập nhật', children: new Date(detail.data.updatedAt).toLocaleString('vi-VN') },
      ]} />}
    </Drawer>
  </section>
}
