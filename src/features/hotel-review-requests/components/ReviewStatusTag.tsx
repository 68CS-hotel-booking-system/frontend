import { Tag } from 'antd'
import { reviewStatusLabels, type ReviewStatus } from '../model/review-request'

export function ReviewStatusTag({ status }: { status: ReviewStatus }) {
  const colors = { PENDING: { color: '#805100', background: '#fff3d6' }, APPROVED: { color: '#0b5f3b', background: '#e8f4ed' }, REJECTED: { color: '#9b1c1c', background: '#fcebea' } }
  return <Tag style={{ ...colors[status], borderColor: 'transparent', margin: 0 }}>{reviewStatusLabels[status]}</Tag>
}
