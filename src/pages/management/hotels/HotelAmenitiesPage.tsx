import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Alert, App, Button, Drawer } from 'antd'
import { useNavigate, useSearchParams } from 'react-router'
import { useCurrentUser } from '@/features/auth'
import { useHotelReviewRequests } from '@/features/hotel-review-requests'
import { AmenityScopeEditor, AmenityScopeTree, amenityTargetKey, amenityWorkspaceUrl, useAmenityCounts, useHotelWorkspace, useScopedAmenitiesQuery, type AmenityEditorState, type AmenityTarget, type AmenityTreeItem } from '@/features/hotels'
import { useManagementRoomTypesQuery } from '@/features/rooms'
import { ErrorState } from '@/shared/ui/ErrorState'
import { PageHeader } from '@/shared/ui/PageHeader'
import '@/shared/styles/amenity-workspace.css'

export function HotelAmenitiesPage() {
  const { hotel, hotelId } = useHotelWorkspace()
  const { isAdmin } = useCurrentUser()
  const latest = useHotelReviewRequests(hotelId, 0, 1, !isAdmin)
  const readOnly = isAdmin || !latest.isSuccess || latest.data.content[0]?.status === 'PENDING'
  const reason = isAdmin ? 'Quản trị viên chỉ xem thông tin; Owner quản lý tiện ích của cơ sở.' : latest.data?.content[0]?.status === 'PENDING' ? 'Hồ sơ đang chờ duyệt. Tiện ích được khóa chỉnh sửa cho đến khi có kết quả.' : 'Chưa xác định được trạng thái hồ sơ, tạm thời khóa chỉnh sửa.'
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const { message } = App.useApp()
  const types = useManagementRoomTypesQuery(hotelId)
  const typeIds = useMemo(() => types.data?.map(type => type.id) ?? [], [types.data])
  const counts = useAmenityCounts(hotelId, typeIds)
  const hotelAmenities = useScopedAmenitiesQuery({ hotelId })
  const scope = params.get('scope'), id = params.get('id')
  const chosenType = types.data?.find(type => type.id === id)
  const invalid = (scope !== null && scope !== 'hotel' && scope !== 'roomType') || (scope === 'roomType' && types.isSuccess && !chosenType) || (scope === 'hotel' && id !== null && id !== hotelId)
  const target: AmenityTarget = scope === 'roomType' && chosenType ? { scope: 'roomType', id: chosenType.id, name: chosenType.name, detail: types.data!.filter(type => type.name === chosenType.name).length > 1 ? `Mã: …${chosenType.id.slice(-8)}` : undefined } : { scope: 'hotel', id: hotelId, name: 'Cả khách sạn' }
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [narrow, setNarrow] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches)
  useEffect(() => { const media = window.matchMedia('(max-width: 1023px)'); const update = () => setNarrow(media.matches); media.addEventListener('change', update); return () => media.removeEventListener('change', update) }, [])
  const detailRef = useRef<HTMLElement>(null)
  const pageRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const detail = detailRef.current, page = pageRef.current
    if (!detail || !page) return
    const workspaceHeader = document.querySelector('[data-hotel-workspace-header]')
    const update = () => { if (workspaceHeader) page.style.setProperty('--amenity-sticky-top', `${workspaceHeader.getBoundingClientRect().height + 80}px`); const rect = detail.getBoundingClientRect(); page.style.setProperty('--amenity-editor-left', `${rect.left}px`); page.style.setProperty('--amenity-editor-width', `${rect.width}px`) }
    const observer = new ResizeObserver(update); observer.observe(detail); if (workspaceHeader) observer.observe(workspaceHeader); window.addEventListener('resize', update); update()
    return () => { observer.disconnect(); window.removeEventListener('resize', update) }
  }, [])
  const [editorState, setEditorState] = useState<AmenityEditorState>({ dirty: false, saving: false, changeCount: 0 })
  const onStateChange = useCallback((value: AmenityEditorState) => setEditorState(value), [])
  useEffect(() => {
    if (!invalid) return
    void message.warning('Không tìm thấy đối tượng. Đã chuyển về Cả khách sạn.')
    setParams({ scope: 'hotel', id: hotelId }, { replace: true })
  }, [invalid, hotelId, message, setParams])
  const select = (value: AmenityTarget) => { setDrawerOpen(false); if (amenityTargetKey(value) !== amenityTargetKey(target)) navigate(amenityWorkspaceUrl(hotelId, value)) }
  const items: AmenityTreeItem[] = (types.data ?? []).map((type, index) => ({ target: { scope: 'roomType', id: type.id, name: type.name }, count: counts[index]?.data?.length, error: counts[index]?.isError, onRetry: () => void counts[index]?.refetch(), detail: types.data!.filter(other => other.name === type.name).length > 1 ? `Mã: …${type.id.slice(-8)}` : undefined }))
  const directHotel = hotelAmenities.data ? [...hotelAmenities.data.catalogAmenities, ...hotelAmenities.data.customAmenities.filter(item => item.attached).map(item => ({ ...item, code: item.id, category: 'HOTEL' as const }))] : []
  if (!hotel) return null
  const tree = <AmenityScopeTree hotel={{ target: { scope: 'hotel', id: hotelId, name: 'Cả khách sạn' }, count: hotelAmenities.isSuccess ? directHotel.length : undefined, error: hotelAmenities.isError, onRetry: () => void hotelAmenities.refetch() }} types={items} selected={target} loading={types.isPending} locked={editorState.saving} dirtyKey={editorState.dirty ? amenityTargetKey(target) : undefined} onSelect={select} onCreateType={!readOnly ? () => navigate(`/hotels/${hotelId}/rooms/new?tab=room-type`) : undefined} />
  return <div ref={pageRef} className="hotel-amenities-page amenity-workspace w-full space-y-6">
    <PageHeader breadcrumbItems={[{ label: 'Khách sạn', to: '/hotels' }, { label: hotel.name, to: `/hotels/${hotelId}` }, { label: 'Tiện ích' }]} kicker="TIỆN NGHI & DỊCH VỤ" title="Tiện ích" description="Chọn đối tượng bên trái, chỉnh tiện ích bên phải." />
    {!isAdmin && latest.isError && <Alert showIcon type="warning" title="Chưa tải được trạng thái xét duyệt" description="Bạn vẫn xem được tiện ích; các thao tác sửa tạm khóa." action={<Button onClick={() => void latest.refetch()}>Thử lại</Button>} />}
    {narrow && <div className="amenity-object-picker"><Button block disabled={editorState.saving} onClick={() => setDrawerOpen(true)} aria-haspopup="dialog" aria-expanded={drawerOpen}>Áp dụng cho: {target.name} ▾</Button><Drawer placement="bottom" size="80dvh" title="Áp dụng cho" open={drawerOpen} onClose={() => setDrawerOpen(false)} styles={{body:{overflowX:'hidden'}}}>{tree}{types.isError && <ErrorState error={types.error} onRetry={() => void types.refetch()} />}</Drawer></div>}
    <div className="amenity-workspace-grid">{!narrow && <aside className="amenity-sidebar">{tree}{types.isError && <ErrorState error={types.error} onRetry={() => void types.refetch()} />}</aside>}
      <section ref={detailRef} aria-label="Chỉnh sửa tiện ích" className="amenity-detail">{scope === 'roomType' && types.isPending ? <p>Đang tải đối tượng đã chọn…</p> : scope === 'roomType' && types.isError ? <ErrorState error={types.error} onRetry={() => void types.refetch()} /> : <>
        <AmenityScopeEditor guardNavigation key={amenityTargetKey(target)} hotelId={hotelId} target={target} readOnly={readOnly} readOnlyReason={reason} onStateChange={onStateChange} inheritedSources={target.scope === 'hotel' ? [] : [{ key: 'hotel', label: 'Dịch vụ chung từ khách sạn', sourceLabel: 'KS', loading: hotelAmenities.isPending, error: hotelAmenities.isError ? 'Chưa tải được dịch vụ chung của khách sạn' : undefined, onRetry: () => void hotelAmenities.refetch(), items: directHotel, note: 'Đây là dịch vụ chung của cơ sở, được hiển thị để đối chiếu với tiện ích của hạng. Muốn thay đổi, chỉnh ở Cả khách sạn.', onManage: () => select({ scope: 'hotel', id: hotelId, name: 'Cả khách sạn' }) }]} />
      </>}</section>
    </div>
  </div>
}
