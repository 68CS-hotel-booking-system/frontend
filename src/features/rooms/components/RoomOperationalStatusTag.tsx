import { Tag } from 'antd'
import { roomOperationLabels, type RoomOperationalStatus } from '../model/room-status'
export function RoomOperationalStatusTag({ status }: { status?: RoomOperationalStatus }) {
  const colors = { OPERATING: { color: '#0b5f3b', background: '#e8f4ed' }, SCHEDULED: { color: '#805100', background: '#fff3d6' }, STOPPED: { color: '#526760', background: '#edf1f0' } }
  return <Tag style={status ? colors[status] : undefined}>{status ? roomOperationLabels[status] : 'Chưa tải trạng thái vận hành'}</Tag>
}
