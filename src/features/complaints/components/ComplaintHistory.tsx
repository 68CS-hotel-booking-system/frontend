import type { ComplaintData } from '../api/complaint-api'
import { complaintStatusLabels } from '../model/complaint-labels'
export function ComplaintHistory({ history }: { history: ComplaintData['history'] }) {
  return <section className="complaint-history" aria-label="Lịch sử xử lý">
    <h3>Lịch sử xử lý</h3>
    {history.length === 0 ? <p className="muted">Chưa có phản hồi từ bộ phận xử lý.</p> : <ol>{history.map(item => <li key={item.id}>
      <div className="complaint-history-meta"><strong>{item.actorRole === 'ADMIN' ? 'Quản trị nền tảng' : 'Chủ khách sạn'}</strong>
        <time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString('vi-VN')}</time></div>
      <p className="muted">{complaintStatusLabels[item.fromStatus]} → {complaintStatusLabels[item.toStatus]}</p>
      <p className="complaint-prose">{item.response}</p>
    </li>)}</ol>}
  </section>
}
