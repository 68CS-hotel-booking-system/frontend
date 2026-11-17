import { useId, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, App, Button, Descriptions, Form, Input, Popconfirm, Skeleton, Space } from 'antd'
import { Link } from 'react-router'
import { useCurrentUser } from '@/features/auth'
import { ErrorState } from '@/shared/ui/ErrorState'
import { applyApiFieldErrors } from '@/shared/lib/form-errors'
import { rejectHotelReviewSchema } from '../api/hotel-review-api'
import { useHotelReview, useHotelReviewDecision } from '../hooks/use-hotel-reviews'
import { HotelReviewStatusBadge } from './HotelReviewStatusBadge'
import { HotelReviewSnapshotView } from './HotelReviewSnapshotView'
import { HotelReviewError } from './HotelReviewError'

export function HotelReviewDetail({ requestId }: { requestId: string }) {
  const { isAdmin } = useCurrentUser()
  const { message } = App.useApp()
  const query = useHotelReview(requestId)
  const mutation = useHotelReviewDecision()
  const [rejecting, setRejecting] = useState(false)
  const reasonId = useId()
  const form = useForm({ resolver: zodResolver(rejectHotelReviewSchema), defaultValues: { reason: '' } })
  if (query.isPending) return <Skeleton active paragraph={{ rows: 8 }} />
  if (query.isError) return <ErrorState error={query.error} onRetry={() => void query.refetch()} />
  const review = query.data
  const decide = async (action: 'approve' | 'reject', reason = '') => {
    if (!isAdmin || review.status !== 'PENDING' || mutation.isPending) return
    try {
      await mutation.mutateAsync(action === 'approve'
        ? { action, requestId, expectedVersion: review.version }
        : { action, requestId, expectedVersion: review.version, reason })
      setRejecting(false)
      form.reset()
      void message.success(action === 'approve' ? 'Đã duyệt hồ sơ và mở bán khách sạn.' : 'Đã gửi lý do từ chối cho chủ khách sạn.')
    } catch (error) { applyApiFieldErrors(error, form.setError, ['reason']) }
  }
  return <div className="space-y-6 min-w-0">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><h1 className="text-2xl font-bold m-0">{review.snapshot.hotel.name}</h1>
        <p className="text-sm text-[#5f736e] mt-2 mb-0">Hồ sơ tại thời điểm gửi · Nội dung chỉ đọc</p></div>
      <HotelReviewStatusBadge status={review.status} />
    </div>
    <Space wrap>
      <Link className="font-semibold text-[#0b5f53] underline underline-offset-4" to={isAdmin ? '/admin/hotel-review-requests' : `/hotels/${review.hotelId}`}>Quay lại {isAdmin ? 'danh sách hồ sơ' : 'khách sạn'}</Link>
      <Button onClick={() => void query.refetch()} loading={query.isFetching}>Tải lại hồ sơ</Button>
    </Space>
    <Descriptions bordered column={{ xs: 1, sm: 1, md: 2 }} size="small" items={[
      { key: 'submittedAt', label: 'Thời điểm gửi', children: new Date(review.submittedAt).toLocaleString('vi-VN') },
      { key: 'submittedBy', label: 'Người gửi', children: <span className="break-all">{review.submittedBy}</span> },
      { key: 'reviewedAt', label: 'Thời điểm xét duyệt', children: review.reviewedAt ? new Date(review.reviewedAt).toLocaleString('vi-VN') : 'Chưa xét duyệt' },
      { key: 'reviewedBy', label: 'Người xét duyệt', children: <span className="break-all">{review.reviewedBy ?? 'Chưa xét duyệt'}</span> },
    ]} />
    {review.reason && <Alert type="warning" showIcon title="Lý do cần bổ sung" description={<p className="whitespace-pre-wrap m-0">{review.reason}</p>} />}
    <HotelReviewSnapshotView snapshot={review.snapshot} />
    {isAdmin && review.status === 'PENDING' && <section className="surface-card space-y-4" aria-label="Quyết định xét duyệt">
      <h2 className="text-lg font-bold m-0">Quyết định xét duyệt</h2>
      <p className="text-sm text-[#5f736e]">Kiểm tra nội dung đã gửi ở trên. Nếu cần thay đổi, hãy từ chối và hướng dẫn chủ khách sạn bổ sung.</p>
      <Space wrap>
        <Popconfirm title="Duyệt hồ sơ và mở bán khách sạn?" okText="Duyệt và mở bán" cancelText="Quay lại" onConfirm={() => decide('approve')} okButtonProps={{ loading: mutation.isPending }} disabled={mutation.isPending}>
          <Button type="primary" loading={mutation.isPending} disabled={rejecting}>Duyệt hồ sơ</Button>
        </Popconfirm>
        <Button danger disabled={mutation.isPending} onClick={() => { mutation.reset(); setRejecting(true) }}>Từ chối hồ sơ</Button>
      </Space>
      {rejecting && <Form component="form" layout="vertical" noValidate onSubmitCapture={form.handleSubmit(({ reason }) => decide('reject', reason))}>
        <Form.Item label="Lý do từ chối" htmlFor={reasonId} required validateStatus={form.formState.errors.reason ? 'error' : undefined} help={form.formState.errors.reason?.message}>
          <Controller name="reason" control={form.control} render={({ field }) => <Input.TextArea {...field} id={reasonId} rows={4} autoFocus disabled={mutation.isPending} placeholder="Nêu nội dung cần bổ sung để chủ khách sạn chỉnh sửa và gửi lại." />} />
        </Form.Item>
        <Space><Button danger type="primary" htmlType="submit" loading={mutation.isPending}>Gửi lý do từ chối</Button><Button disabled={mutation.isPending} onClick={() => setRejecting(false)}>Hủy</Button></Space>
      </Form>}
    </section>}
    {mutation.isError && <HotelReviewError error={mutation.error} />}
  </div>
}
