import { Link } from 'react-router'
import { amenityWorkspaceUrl } from '../model/amenity-workspace'
import { Tag } from 'antd'
import { ErrorState } from '@/shared/ui/ErrorState'
import { PageLoading } from '@/shared/ui/PageLoading'
import { useRoomTypeAmenitiesQuery } from '../hooks/use-scoped-amenities'

export function RoomTypeAmenitiesSummary({ hotelId, roomTypeId, compact = false, onManage }: { hotelId: string; roomTypeId: string; compact?: boolean; onManage?: (href: string) => void }) {
  const query = useRoomTypeAmenitiesQuery(hotelId, roomTypeId)
  if (query.isPending) return compact ? <p role="status">Tiện ích: Đang tải…</p> : <PageLoading />
  if (query.isError) return <ErrorState error={query.error} onRetry={() => void query.refetch()} />
  const href = amenityWorkspaceUrl(hotelId, {scope: 'roomType', id: roomTypeId})
  const summary = <p className="text-sm text-[#526760]">Tiện ích: {query.data.length} mục · <Link to={href} onClick={event => { if (onManage) { event.preventDefault(); onManage(href) } }}>Quản lý</Link></p>
  if (compact) return summary
  return <div>{summary}{query.data.length === 0
    ? <p className="text-sm text-[#526760]">Chưa chọn tiện ích chung cho hạng phòng này.</p>
    : <div className="flex flex-wrap gap-2">{query.data.map((item) => <Tag key={item.id} className="!m-0">{item.name}</Tag>)}</div>}</div>
}
