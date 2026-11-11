import { useState } from 'react'
import { Alert, App, Button, Popconfirm, Skeleton, Space } from 'antd'
import { SendOutlined } from '@ant-design/icons'
import { Link } from 'react-router'
import type { ManagementHotelDetail } from '../model/hotel'
import { useHotelProfileAccess } from '../hooks/use-hotel-profile-access'
import { useSubmitHotelReview } from '../hooks/use-hotel-reviews'
import { HotelReviewStatusBadge } from './HotelReviewStatusBadge'
import { HotelReviewError } from './HotelReviewError'

export function HotelReviewSubmission({ hotel }: { hotel: ManagementHotelDetail }) {
  const { message } = App.useApp()
  const { isAdmin, ownsHotel, canEditProfile, latestReview, reviewQuery } = useHotelProfileAccess(hotel)
  const mutation = useSubmitHotelReview()
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const send = async () => {
    if (!canEditProfile || hotel.version === undefined || mutation.isPending) return
    try {
      await mutation.mutateAsync({ hotelId: hotel.id, expectedVersion: hotel.version })
      setConfirmationOpen(false)
      void message.success('Đã gửi hồ sơ. Bạn có thể theo dõi kết quả xét duyệt tại đây.')
    } catch { setConfirmationOpen(false) }
  }
  if (reviewQuery.isLoading) return <Skeleton active paragraph={{ rows: 2 }} />
  return <section className="space-y-3" aria-label="Gửi hồ sơ xét duyệt">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h3 className="text-base font-bold m-0">Xét duyệt hồ sơ</h3>
        <p className="text-sm text-[#5f736e] mt-1 mb-0">Lưu các thay đổi trước khi gửi. Hồ sơ được chụp lại để quản trị viên xét duyệt.</p></div>
      {latestReview && <HotelReviewStatusBadge status={latestReview.status} />}
    </div>
    {reviewQuery.isError && <><HotelReviewError error={reviewQuery.error} /><Button onClick={() => void reviewQuery.refetch()}>Tải lại trạng thái hồ sơ</Button></>}
    {latestReview?.status === 'PENDING' && <Alert type="info" showIcon title="Hồ sơ đã gửi, đang chờ xét duyệt" description="Nội dung hồ sơ được tạm khóa. Sau khi nhận kết quả, bạn có thể tiếp tục theo hướng dẫn của quản trị viên." />}
    {latestReview?.status === 'REJECTED' && <Alert type="warning" showIcon title="Hồ sơ cần bổ sung" description={latestReview.reason} />}
    {isAdmin && <p className="text-sm text-[#5f736e]">Chỉ chủ khách sạn được chỉnh sửa và gửi hồ sơ. Quản trị viên xét duyệt bản hồ sơ đã gửi.</p>}
    <Space wrap>
      {!isAdmin && ownsHotel && hotel.status === 'DRAFT' && latestReview?.status !== 'PENDING' && <Popconfirm
        title="Gửi hồ sơ cho quản trị viên?" description="Thông tin đã lưu sẽ được gửi và tạm khóa chỉnh sửa trong lúc chờ duyệt."
        open={confirmationOpen} onOpenChange={setConfirmationOpen} onConfirm={send} okText="Gửi hồ sơ" cancelText="Quay lại"
        okButtonProps={{ loading: mutation.isPending }} disabled={!canEditProfile || hotel.version === undefined || mutation.isPending}>
        <Button type="primary" icon={<SendOutlined aria-hidden="true" />} disabled={!canEditProfile || hotel.version === undefined} loading={mutation.isPending}>
          {latestReview?.status === 'REJECTED' ? 'Gửi lại hồ sơ' : 'Gửi hồ sơ xét duyệt'}
        </Button>
      </Popconfirm>}
      {latestReview && <Link className="font-semibold text-[#0b5f53] underline underline-offset-4" to={`/hotel-review-requests/${latestReview.id}`}>Xem hồ sơ đã gửi</Link>}
      {isAdmin && <Link className="font-semibold text-[#0b5f53] underline underline-offset-4" to="/admin/hotel-review-requests">Danh sách chờ xét duyệt</Link>}
    </Space>
    {mutation.isError && <HotelReviewError error={mutation.error} />}
  </section>
}
