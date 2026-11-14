import { Button, Pagination, Table } from 'antd'
import { reviewDate, type ReviewSummary } from '../model/review-request'
import { ReviewStatusTag } from './ReviewStatusTag'
import './review-requests.css'

export function ReviewRequestsList({ rows, page, size, total, onPageChange, onOpen }: { rows: ReviewSummary[]; page: number; size: number; total: number; onPageChange: (page: number, size: number) => void; onOpen: (id: string) => void }) {
  return <div className="review-requests-list space-y-4">
    <div className="hidden md:block"><Table dataSource={rows} rowKey="id" pagination={false} scroll={{ x: 780 }} columns={[
      { title: 'Khách sạn', key: 'hotel', render: (_, row) => <div className="min-w-0"><Button type="link" className="!p-0 !h-auto !whitespace-normal !text-left !font-semibold" onClick={() => onOpen(row.id)}>{row.hotelName}</Button>{row.reason && <p className="text-xs text-[#526760] line-clamp-2 mt-1 mb-0">{row.reason}</p>}</div> },
      { title: 'Ngày gửi', dataIndex: 'submittedAt', width: 180, render: reviewDate },
      { title: 'Trạng thái', key: 'status', width: 130, render: (_, row) => <ReviewStatusTag status={row.status} /> },
      { title: 'Thao tác', key: 'action', width: 130, align: 'right', render: (_, row) => <Button onClick={() => onOpen(row.id)}>Xem hồ sơ</Button> },
    ]} /></div>
    <div className="md:hidden space-y-3">{rows.map((row) => <article key={row.id} className="border border-[#dce7e3] rounded-xl p-4 bg-white space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2"><h3 className="text-base font-semibold m-0 break-words">{row.hotelName}</h3><ReviewStatusTag status={row.status} /></div>
      <p className="text-sm text-[#526760] m-0">Gửi lúc {reviewDate(row.submittedAt)}</p>
      {row.reason && <p className="text-sm whitespace-pre-wrap break-words m-0"><strong>Lý do từ chối: </strong>{row.reason}</p>}
      <Button block onClick={() => onOpen(row.id)}>Xem hồ sơ</Button>
    </article>)}</div>
    {total > 0 && <Pagination current={page + 1} pageSize={size} total={total} onChange={(next, nextSize) => onPageChange(next - 1, nextSize)} showSizeChanger={false} showTotal={(count) => `${count} hồ sơ`} className="!flex-wrap !justify-end" />}
  </div>
}
