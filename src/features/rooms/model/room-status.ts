export const roomReadinessOptions = [
  { value: 'ready', label: 'Sẵn sàng' },
  { value: 'dirty', label: 'Chưa sẵn sàng' },
]
export const roomOperationLabels = {
  OPERATING: 'Đang phục vụ', SCHEDULED: 'Chưa đến ngày phục vụ', STOPPED: 'Đã ngừng phục vụ',
} as const
export type RoomOperationalStatus = keyof typeof roomOperationLabels
/** UI has two states; legacy PATCH calls the not-ready state `cleaning`. */
export function readinessPatchStatus(value: string): 'ready' | 'cleaning' {
  if (value === 'ready') return 'ready'
  if (value === 'dirty') return 'cleaning'
  throw new Error('Trạng thái phòng không hợp lệ.')
}
