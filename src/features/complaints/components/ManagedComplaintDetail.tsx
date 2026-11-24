import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router'
import { Alert, Button, Descriptions, Input, Select, Tag, message } from 'antd'
import { useCurrentUser } from '@/features/auth'
import { PageHeader } from '@/shared/ui/PageHeader'
import { PageLoading } from '@/shared/ui/PageLoading'
import { ErrorState } from '@/shared/ui/ErrorState'
import { ApiError, errorMessage } from '@/shared/api/api-error'
import { complaintCategoryLabels, complaintStatusLabels, complaintStatusColors } from '../model/complaint-labels'
import { useManagedComplaint, useHandleComplaint } from '../hooks/use-managed-complaints'
import { handlingSchema, type HandlingValues, type ManagedComplaint } from '../api/management-complaint-api'
import { ComplaintHistory } from './ComplaintHistory'
import '../complaints.css'
export function ManagedComplaintDetail({ id }: { id: string }) {
  const { currentUser } = useCurrentUser()
  const actorId = currentUser?.id ?? ''
  const query = useManagedComplaint(actorId, id)
  const data = query.data
  return <div className="complaint-workspace">
    <Link className="complaint-back" to="/complaints">← Danh sách khiếu nại</Link>
    <PageHeader title="Chi tiết khiếu nại" description={data ? `${data.bookingCode} · ${data.hotelName}` : 'Nội dung và tiến trình xử lý yêu cầu của khách.'}
      extra={<Button loading={query.isFetching} onClick={() => void query.refetch()}>Tải lại khiếu nại</Button>} />
    {query.isPending ? <PageLoading /> : query.isError ? <ErrorState error={query.error} onRetry={() => void query.refetch()} /> : data && <div className="complaint-detail-grid">
      <div className="surface-card">
        <div className="complaint-case-heading"><h2>{complaintCategoryLabels[data.complaint.category]}</h2><Tag color={complaintStatusColors[data.complaint.status]}>{complaintStatusLabels[data.complaint.status]}</Tag></div>
        <p className="complaint-prose">{data.complaint.content}</p>
        <Descriptions size="small" column={1} items={[
          { key: 'name', label: 'Người đặt phòng', children: data.bookerName },
          { key: 'email', label: 'Email liên hệ', children: <a href={`mailto:${data.bookerEmail}`}>{data.bookerEmail}</a> },
          { key: 'phone', label: 'Số điện thoại', children: <a href={`tel:${data.bookerPhone}`}>{data.bookerPhone}</a> },
          { key: 'created', label: 'Ngày gửi', children: new Date(data.complaint.createdAt).toLocaleString('vi-VN') },
        ]} />
        <ComplaintHistory history={data.complaint.history} />
      </div>
      <div className="surface-card complaint-handling">
        {['RESOLVED', 'REJECTED'].includes(data.complaint.status) ? <><h2>Khiếu nại đã đóng</h2><p>Kết quả đã được lưu và hiển thị cho khách. Không thể sửa hoặc mở lại khiếu nại này.</p></> : <HandlingForm key={`${id}-${data.complaint.version}`} actorId={actorId} data={data} refreshing={query.isFetching} onReload={() => void query.refetch()} />}
      </div>
    </div>}
  </div>
}
function HandlingForm({ actorId, data, refreshing, onReload }: { actorId: string; data: ManagedComplaint; refreshing: boolean; onReload: () => void }) {
  const mutation = useHandleComplaint(actorId, data.complaint.id)
  const { control, handleSubmit, formState: { errors } } = useForm<HandlingValues>({ resolver: zodResolver(handlingSchema), defaultValues: { status: 'IN_REVIEW', response: '' } })
  const choices = data.complaint.status === 'OPEN' ? ['IN_REVIEW'] as const : ['IN_REVIEW', 'RESOLVED', 'REJECTED'] as const
  const conflict = mutation.error instanceof ApiError && mutation.error.status === 409
  async function submit(values: HandlingValues) {
    try { await mutation.mutateAsync({ values, version: data.complaint.version }); message.success('Đã gửi phản hồi và cập nhật khiếu nại.') } catch { /* Giữ nội dung để người xử lý kiểm tra lỗi và tải phiên bản mới. */ }
  }
  return <form onSubmit={handleSubmit(submit)} className="complaint-handling-form" aria-label="Xử lý khiếu nại">
    <h2>{data.complaint.status === 'OPEN' ? 'Tiếp nhận xử lý' : 'Phản hồi & kết quả'}</h2>
    <p className="muted">Phản hồi được gửi vào lịch sử để khách theo dõi. Thao tác này không tự hoàn tiền.</p>
    <label htmlFor="handling-status">Trạng thái sau cập nhật</label>
    <Controller name="status" control={control} render={({ field }) => <Select {...field} id="handling-status" disabled={mutation.isPending || refreshing} options={choices.map(value => ({ value, label: complaintStatusLabels[value] }))} />} />
    <label htmlFor="handling-response">Phản hồi gửi khách</label>
    <div className="complaint-response-field"><Controller name="response" control={control} render={({ field }) => <Input.TextArea {...field} id="handling-response" rows={6} maxLength={2000} showCount disabled={mutation.isPending || refreshing} status={errors.response ? 'error' : undefined} aria-invalid={Boolean(errors.response)} aria-describedby={errors.response ? 'handling-error' : 'handling-help'} />} /></div>
    {errors.response && <p className="complaint-field-error" id="handling-error" role="alert">{errors.response.message}</p>}
    <p id="handling-help" className="muted">Chọn “Đã giải quyết” hoặc “Đã từ chối” sẽ đóng khiếu nại. Bạn có thể tiếp tục phản hồi bằng trạng thái “Đang xử lý”.</p>
    {mutation.isError && <Alert type="error" showIcon title="Chưa cập nhật được khiếu nại" description={errorMessage(mutation.error)}
      action={conflict ? <Button onClick={onReload} loading={refreshing}>Tải phiên bản mới</Button> : undefined} />}
    <Button type="primary" htmlType="submit" loading={mutation.isPending} disabled={refreshing || conflict}>Gửi phản hồi và cập nhật</Button>
  </form>
}
