import { useState } from 'react'
import { useSearchParams, Link } from 'react-router'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, App, Button, Descriptions, Drawer, Input, Select, Table, Tag } from 'antd'
import { useCurrentUser } from '@/features/auth'
import { ApiError, errorMessage } from '@/shared/api/api-error'
import { PageHeader } from '@/shared/ui/PageHeader'
import { PageLoading } from '@/shared/ui/PageLoading'
import { ErrorState } from '@/shared/ui/ErrorState'
import { checkoutMoney } from '@/features/bookings'
import { refundActionSchema, type Refund, type RefundActionValues, type RefundStatus } from '../api/refund-api'
import { useRefund, useRefunds, useProcessRefund } from '../hooks/use-refunds'
import '../refunds.css'

const labels: Record<RefundStatus, string> = { PENDING: 'Chờ hoàn tiền', PROCESSING: 'Đang xử lý', COMPLETED: 'Đã hoàn tiền' }
const colors = { PENDING: 'orange', PROCESSING: 'blue', COMPLETED: 'green' }
const date = (value: string) => new Date(value).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })

export function RefundWorkspace({ management = false }: { management?: boolean }) {
  const { currentUser } = useCurrentUser()
  return <RefundQueue key={`${currentUser?.id}-${management}`} management={management} />
}
function RefundQueue({ management }: { management: boolean }) {
  const [search, setSearch] = useSearchParams()
  const [page, setPage] = useState(0)
  const [status, setStatus] = useState<RefundStatus>()
  const [keyword, setKeyword] = useState('')
  const [selected, setSelected] = useState<string>()
  const bookingId = search.get('bookingId') || undefined
  const query = useRefunds(management, { page, size: 10, status, keyword, bookingId })
  return <div className="refund-workspace">
    {management && <PageHeader title="Quản lý hoàn tiền" description="Admin xử lý khoản hoàn; owner theo dõi các khách sạn của mình. Số tiền được chốt từ giao dịch thực thu." />}
    <section className={management ? 'surface-card' : undefined} aria-label="Danh sách hoàn tiền">
      <div className="refund-toolbar">
        <div className="refund-filter"><label htmlFor="refund-status">Trạng thái</label><Select id="refund-status" allowClear placeholder="Tất cả trạng thái" value={status}
          options={Object.entries(labels).map(([value, label]) => ({ value, label }))} onChange={value => { setStatus(value); setPage(0) }} /></div>
        <Input.Search aria-label="Tìm yêu cầu hoàn tiền" placeholder="Mã đặt phòng hoặc tên người đặt" allowClear maxLength={100} enterButton="Tìm"
          onSearch={value => { setKeyword(value.trim()); setPage(0) }} />
        <Button loading={query.isFetching} onClick={() => void query.refetch()}>Làm mới</Button>
      </div>
      {bookingId && <p>Đang lọc theo đơn đặt phòng. <Button type="link" onClick={() => { const next = new URLSearchParams(search); next.delete('bookingId'); setSearch(next); setPage(0) }}>Xem tất cả yêu cầu</Button></p>}
      <p className="muted" aria-live="polite">{query.data ? `${query.data.totalElements} yêu cầu hoàn tiền` : 'Đang tải yêu cầu hoàn tiền…'}</p>
      <p className="refund-mobile-hint">Vuốt ngang để xem đầy đủ thông tin.</p>
      {query.isError ? <ErrorState error={query.error} onRetry={() => void query.refetch()} /> : <Table<Refund> rowKey="id" loading={query.isPending} dataSource={query.data?.content ?? []}
        scroll={{ x: 780 }} locale={{ emptyText: 'Chưa có yêu cầu hoàn tiền phù hợp.' }}
        pagination={{ current: page + 1, pageSize: 10, total: query.data?.totalElements ?? 0, showSizeChanger: false, onChange: value => setPage(value - 1) }} columns={[
          { title: 'Đơn / Khách sạn', width: 230, render: (_, row) => <><button className="refund-link" type="button" onClick={() => setSelected(row.id)}>{row.bookingCode}</button><div>{row.hotelName}</div></> },
          { title: 'Số tiền hoàn', width: 160, align: 'right', render: (_, row) => <strong className="refund-money">{checkoutMoney(row.amount, row.currency)}</strong> },
          { title: 'Trạng thái', width: 150, render: (_, row) => <Tag className={`refund-status-${row.status}`} color={colors[row.status]}>{labels[row.status]}</Tag> },
          { title: 'Ngày ghi nhận', width: 180, render: (_, row) => date(row.createdAt) },
          { title: 'Thao tác', width: 130, render: (_, row) => <Button onClick={() => setSelected(row.id)}>Xem chi tiết</Button> },
        ]} />}
    </section>
    <Drawer open={Boolean(selected)} title="Chi tiết hoàn tiền" size={640} onClose={() => setSelected(undefined)} destroyOnHidden>
      {selected && <RefundDetail key={selected} id={selected} management={management} />}
    </Drawer>
  </div>
}
function RefundDetail({ id, management }: { id: string; management: boolean }) {
  const query = useRefund(management, id)
  const data = query.data
  if (query.isPending) return <PageLoading />
  if (query.isError) return <ErrorState error={query.error} onRetry={() => void query.refetch()} />
  if (!data) return null
  return <div className="refund-detail">
    <div className="refund-heading"><h2>{data.bookingCode}</h2><Tag className={`refund-status-${data.status}`} color={colors[data.status]}>{labels[data.status]}</Tag></div>
    <p>{data.hotelName}</p><p className="refund-total">{checkoutMoney(data.amount, data.currency)}</p>
    <Descriptions column={1} size="small" items={[
      { key: 'reason', label: 'Lý do', children: data.reason === 'CUSTOMER_CANCELLATION' ? 'Khách hủy trước giờ nhận phòng — hoàn 100%' : 'Đã thu tiền nhưng không xác nhận được đơn' },
      { key: 'name', label: 'Người đặt', children: data.bookerName || '—' },
      { key: 'email', label: 'Email', children: data.bookerEmail || '—' },
      { key: 'phone', label: 'Điện thoại', children: data.bookerPhone },
      { key: 'created', label: 'Ghi nhận lúc', children: date(data.createdAt) },
      ...(data.settlementReference ? [{ key: 'ref', label: 'Mã giao dịch hoàn', children: data.settlementReference }] : []),
      ...(data.completedAt ? [{ key: 'completed', label: 'Đã hoàn lúc', children: date(data.completedAt) }] : []),
    ]} />
    {data.customerNote && <p className="refund-prose">{data.customerNote}</p>}
    <h3>Tiến trình xử lý</h3>
    <ol className="refund-history">
      <li><strong>Ghi nhận yêu cầu hoàn tiền</strong><time dateTime={data.createdAt}>{date(data.createdAt)}</time></li>
      {data.history.map(action => <li key={action.id}><strong>{labels[action.toStatus]}</strong><time dateTime={action.createdAt}>{date(action.createdAt)}</time>
        <p className="refund-prose">{action.note}</p>{action.settlementReference && <p>Mã giao dịch: {action.settlementReference}</p>}</li>)}
    </ol>
    {data.canProcess && data.status !== 'COMPLETED' ? <RefundActionForm key={`${id}-${data.version}`} data={data} refreshing={query.isFetching} onReload={() => void query.refetch()} />
      : data.status !== 'COMPLETED' && <Alert type="info" showIcon title="Admin đang phụ trách hoàn tiền" description="Tiến trình sẽ được cập nhật tại đây khi admin xử lý khoản hoàn." />}
    {!management && <Link to="/my-bookings">Xem đặt phòng của tôi</Link>}
  </div>
}
function RefundActionForm({ data, refreshing, onReload }: { data: Refund; refreshing: boolean; onReload: () => void }) {
  const mutation = useProcessRefund(data.id)
  const { message } = App.useApp()
  const completing = data.status === 'PROCESSING'
  const { control, handleSubmit, formState: { errors } } = useForm<RefundActionValues>({ resolver: zodResolver(refundActionSchema), defaultValues: { status: completing ? 'COMPLETED' : 'PROCESSING', reference: '', note: '' } })
  const conflict = mutation.error instanceof ApiError && mutation.error.status === 409
  async function submit(values: RefundActionValues) {
    try { await mutation.mutateAsync({ values, version: data.version }); void message.success(completing ? 'Đã ghi nhận hoàn tiền.' : 'Đã tiếp nhận xử lý hoàn tiền.') } catch { /* Preserve input for review. */ }
  }
  return <form className="refund-form" aria-label="Cập nhật hoàn tiền" onSubmit={handleSubmit(submit)}>
    <h3>{completing ? 'Ghi nhận đã hoàn tiền' : 'Tiếp nhận hoàn tiền'}</h3>
    <p>{completing ? 'Chỉ xác nhận sau khi đã hoàn tiền thực tế cho khách. Thao tác này chỉ ghi nhận kết quả.' : 'Kiểm tra giao dịch và liên hệ người đặt để thực hiện hoàn tiền.'}</p>
    {completing && <><label htmlFor="refund-reference">Mã giao dịch hoàn tiền</label>
      <Controller name="reference" control={control} render={({ field }) => <Input {...field} id="refund-reference" maxLength={100} disabled={mutation.isPending || refreshing} status={errors.reference ? 'error' : undefined} aria-describedby={errors.reference ? 'refund-reference-error' : undefined} />} />
      {errors.reference && <p id="refund-reference-error" role="alert">{errors.reference.message}</p>}</>}
    <label htmlFor="refund-note">Ghi chú hiển thị cho khách</label>
    <Controller name="note" control={control} render={({ field }) => <Input.TextArea {...field} id="refund-note" rows={4} maxLength={1000} disabled={mutation.isPending || refreshing} status={errors.note ? 'error' : undefined} aria-describedby={errors.note ? 'refund-note-error' : undefined} />} />
    {errors.note && <p id="refund-note-error" role="alert">{errors.note.message}</p>}
    {mutation.isError && <Alert type="error" showIcon title="Chưa cập nhật được hoàn tiền" description={errorMessage(mutation.error)} action={conflict ? <Button onClick={() => { mutation.reset(); onReload() }}>Tải phiên bản mới</Button> : undefined} />}
    <Button type="primary" htmlType="submit" loading={mutation.isPending} disabled={refreshing || conflict}>{completing ? 'Ghi nhận đã hoàn tiền' : 'Bắt đầu xử lý'}</Button>
  </form>
}
