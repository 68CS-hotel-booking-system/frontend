import { useState } from 'react'
import { Alert, App, Button, Input, Modal } from 'antd'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCurrentUser } from '@/features/auth'
import { ErrorState } from '@/shared/ui/ErrorState'
import { PageLoading } from '@/shared/ui/PageLoading'
import { rejectionSchema, reviewDate, reviewErrorMessage, type ReviewRequest } from '../model/review-request'
import { useReviewMutations, useReviewRequest } from '../hooks/use-review-requests'
import { ReviewSnapshotView } from './ReviewSnapshotView'
import { ReviewStatusTag } from './ReviewStatusTag'
import './review-requests.css'

export function ReviewRequestModal({ requestId, onClose }: { requestId: string | null; onClose: () => void }) {
  const query = useReviewRequest(requestId)
  const { decide } = useReviewMutations()
  return <Modal open={Boolean(requestId)} title="Hồ sơ khách sạn đã gửi" onCancel={() => { if (!decide.isPending) onClose() }} closable={!decide.isPending} mask={{ closable: !decide.isPending }} footer={null} width={1000} destroyOnHidden className="review-request-modal" styles={{ body: { maxHeight: '78vh', overflowY: 'auto' } }}>
    {query.isPending ? <PageLoading /> : query.isError ? <ErrorState error={query.error} onRetry={() => void query.refetch()} /> : query.data && <ReviewDetail key={query.data.id} review={query.data} decide={decide} refreshing={query.isFetching} onClose={onClose} />}
  </Modal>
}
function ReviewDetail({ review, refreshing, onClose, decide }: { review: ReviewRequest; refreshing: boolean; onClose: () => void; decide: ReturnType<typeof useReviewMutations>['decide'] }) {
  const { isAdmin } = useCurrentUser()
  const { message, modal } = App.useApp()
  const [rejecting, setRejecting] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const { control, handleSubmit, formState: { errors } } = useForm<{ reason: string }>({ resolver: zodResolver(rejectionSchema), defaultValues: { reason: '' } })
  const canDecide = isAdmin && review.status === 'PENDING'
  const reject = async ({ reason }: { reason: string }) => {
    if (!canDecide || decide.isPending) return
    setSaveError(null)
    try {
      await decide.mutateAsync({ requestId: review.id, decision: 'reject', expectedVersion: review.version, reason })
      setRejecting(false)
      void message.success('Đã từ chối hồ sơ và gửi lý do cho Owner.')
    } catch (error) { setSaveError(reviewErrorMessage(error)) }
  }
  const approve = () => {
    if (!canDecide || decide.isPending) return
    modal.confirm({ title: 'Duyệt và mở bán khách sạn?', content: `Bạn đang duyệt hồ sơ đã gửi của “${review.snapshot.hotel.name}”. Khách sạn sẽ chuyển sang đang hoạt động nếu đủ điều kiện.`, okText: 'Duyệt và mở bán', cancelText: 'Quay lại',
      onOk: async () => {
        setSaveError(null)
        try {
          await decide.mutateAsync({ requestId: review.id, decision: 'approve', expectedVersion: review.version })
          void message.success('Đã duyệt hồ sơ. Khách sạn được mở bán.')
        } catch (error) { setSaveError(reviewErrorMessage(error)) }
      },
    })
  }
  return <div className="review-request-detail space-y-4 pt-3">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0"><h2 className="text-xl font-bold m-0 break-words">{review.snapshot.hotel.name}</h2><p className="text-sm text-[#526760] mt-2 mb-0">Gửi lúc {reviewDate(review.submittedAt)}</p></div>
      <ReviewStatusTag status={review.status} />
    </div>
    <Alert type="info" showIcon title="Nội dung chỉ đọc" description="Đây là bản chụp tại thời điểm Owner gửi hồ sơ. Quản trị viên chỉ xét duyệt, không chỉnh sửa thông tin của Owner." />
    {review.status === 'REJECTED' && <Alert type="error" showIcon title="Lý do từ chối" description={<span className="whitespace-pre-wrap break-words">{review.reason}</span>} />}
    {review.reviewedAt && <p className="text-sm text-[#526760]">Đã xét duyệt lúc {reviewDate(review.reviewedAt)}</p>}
    <ReviewSnapshotView snapshot={review.snapshot} />
    {saveError && <Alert type="error" showIcon title="Chưa thể hoàn tất xét duyệt" description={saveError} />}
    <div className="review-decision-footer border-t border-[#dce7e3] pt-4">
      {canDecide && rejecting ? <form className="space-y-3" onSubmit={handleSubmit(reject)}>
        <label className="block font-semibold" htmlFor="review-rejection-reason">Lý do từ chối <span className="text-red-700">*</span></label>
        <Controller name="reason" control={control} render={({ field }) => <Input.TextArea {...field} id="review-rejection-reason" rows={4} placeholder="Nêu rõ thông tin cần sửa hoặc bổ sung để Owner gửi lại hồ sơ." disabled={decide.isPending} aria-invalid={Boolean(errors.reason)} />} />
        {errors.reason && <p role="alert" className="text-red-700">{errors.reason.message}</p>}
        <div className="flex flex-wrap justify-end gap-2"><Button onClick={() => setRejecting(false)} disabled={decide.isPending}>Hủy từ chối</Button><Button danger type="primary" htmlType="submit" loading={decide.isPending} disabled={refreshing}>Xác nhận từ chối</Button></div>
      </form> : <div className="flex flex-wrap justify-end gap-2">
        <Button onClick={onClose} disabled={decide.isPending}>Đóng hồ sơ</Button>
        {canDecide && <><Button danger onClick={() => setRejecting(true)} disabled={decide.isPending || refreshing}>Từ chối</Button><Button type="primary" onClick={approve} loading={decide.isPending} disabled={refreshing}>Duyệt và mở bán</Button></>}
      </div>}
    </div>
  </div>
}
