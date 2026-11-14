import { useEffect, useRef, useState } from 'react'
import { Alert, Button, Checkbox, Input, Select, Skeleton, Tag } from 'antd'
import { ErrorState } from '@/shared/ui/ErrorState'
import type { AmenitySource, AmenityTarget } from '../model/amenity-workspace'
import { amenityPreview, amenitySearchKey } from '../model/amenity-workspace'
import { useAmenityEditor } from '../hooks/use-amenity-editor'
import { AmenityNavigationGuard } from './AmenityNavigationGuard'
import { CustomAmenitiesList } from './CustomAmenitiesList'

export interface AmenityEditorState { dirty: boolean; saving: boolean; changeCount: number }
export interface AmenityScopeEditorProps {
  hotelId: string; target: AmenityTarget; inheritedSources?: AmenitySource[]
  readOnly?: boolean; readOnlyReason?: string
  guardNavigation?: boolean
  onStateChange?: (state: AmenityEditorState) => void
}
/** Mount with a target key so edits can never leak into another hotel, type or room. */
export function AmenityScopeEditor({ hotelId, target, inheritedSources = [], readOnly = false, readOnlyReason, guardNavigation = false, onStateChange }: AmenityScopeEditorProps) {
  const saveBarRef = useRef<HTMLElement>(null)
  const editor = useAmenityEditor(hotelId, target, readOnly)
  const [search, setSearch] = useState('')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [customBusy, setCustomBusy] = useState(false)
  const busy = editor.saving || customBusy
  useEffect(() => { onStateChange?.({ dirty: editor.dirty, saving: busy, changeCount: editor.changeCount }) }, [editor.dirty, busy, editor.changeCount, onStateChange])
  useEffect(() => {
    const bar = saveBarRef.current, container = bar?.closest<HTMLElement>('.amenity-detail')
    if (!bar || !container) return
    const update = () => { container.style.paddingBottom = `${Math.max(112, bar.getBoundingClientRect().height + 24)}px` }
    const observer = new ResizeObserver(update); observer.observe(bar); update()
    return () => { observer.disconnect(); container.style.paddingBottom = '' }
  }, [editor.dirty, editor.error, readOnly])
  const labels = { hotel: 'Cả khách sạn', roomType: 'Hạng phòng', room: 'Phòng' }
  const custom = target.scope === 'roomType' ? [] : editor.custom.filter(item => item.attached)
  const sourcesPending = inheritedSources.some(source => source.loading || source.error)
  const count = editor.ids.length + custom.length
  const options = [...(editor.catalog.data ?? []), ...editor.direct.filter(item => !(editor.catalog.data ?? []).some(option => option.id === item.id))]
  const previewSources = [...inheritedSources.map(source => ({key: source.key, label: source.sourceLabel ?? 'KS', items: source.items})), {key: 'direct', label: target.scope === 'roomType' ? 'Hạng' : 'Phòng', items: options.filter(item => editor.ids.includes(item.id))}, {key: 'custom', label: 'Riêng', items: custom}]
  const preview = amenityPreview(previewSources)
  const visible = options.filter(item => amenitySearchKey(item.name).includes(amenitySearchKey(search)))
  if ((editor.catalog.isPending && !editor.catalog.data) || (editor.query.isPending && !editor.query.data)) return <div aria-label="Đang tải tiện ích" className="amenity-editor"><Skeleton active /><Skeleton active /><Skeleton active /></div>
  if (editor.catalog.isError && !editor.catalog.data) return <ErrorState error={editor.catalog.error} onRetry={() => void editor.catalog.refetch()} />
  if (editor.query.isError && !editor.query.data) return <ErrorState error={editor.query.error} onRetry={() => void editor.query.refetch()} />
  return <div className="amenity-editor">
    {guardNavigation && <AmenityNavigationGuard dirty={!readOnly && editor.dirty} saving={busy} save={editor.save} reset={editor.reset} name={target.name} error={editor.error} />}
    <header className="amenity-object-header"><div className="flex flex-wrap items-center gap-2"><h2>{target.name}</h2>{target.detail && <span className="amenity-help">{target.detail}</span>}<Tag>{labels[target.scope]}</Tag></div><p>{count} tiện ích gắn trực tiếp{target.scope !== 'hotel' && (sourcesPending ? ' · Chưa đủ dữ liệu tổng hợp' : ` · ${preview.length} tiện ích gồm dịch vụ chung`)}</p></header>
    {editor.query.isError && <ErrorState error={editor.query.error} onRetry={() => void editor.query.refetch()} />}
    {editor.catalog.isError && <ErrorState error={editor.catalog.error} onRetry={() => void editor.catalog.refetch()} />}
    {readOnly && <Alert showIcon type="info" title="Chế độ chỉ đọc" description={readOnlyReason ?? 'Bạn không có quyền chỉnh sửa tiện ích của đối tượng này.'} />}
    {target.scope !== 'hotel' && inheritedSources.map(source => <details className="amenity-section" key={source.key}><summary>{source.label} ({source.loading ? '…' : source.error ? '?' : source.items.length})</summary><p className="amenity-help">{source.note}</p>{source.loading ? <Skeleton active paragraph={{rows:2}} /> : source.error ? <Alert type="warning" title={source.error} action={<Button onClick={source.onRetry}>Thử lại</Button>} /> : <div className="amenity-chips">{source.items.map(item => <Tag key={item.id}>{item.name}</Tag>)}</div>}{source.onManage && <Button type="link" disabled={busy} onClick={source.onManage}>Chỉnh ở: {source.sourceLabel === 'Hạng' ? 'Hạng phòng' : 'Cả khách sạn'}</Button>}</details>)}
    <section className="amenity-section" aria-label="Từ danh mục hệ thống"><div className="amenity-section-heading"><h3>Từ danh mục hệ thống</h3><span>Đã chọn {editor.ids.length}/{options.length}</span></div>
      {options.length > 8 && <Input.Search aria-label="Tìm tiện ích trong danh mục" placeholder="Tìm tiện ích…" allowClear value={search} onChange={event => setSearch(event.target.value)} />}
      {options.length === 0 ? <p>Danh mục chưa có tiện ích.</p> : visible.length === 0 ? <p>Không tìm thấy tiện ích phù hợp.</p> : <div className="amenity-catalog-grid">{visible.map(item => {
        const selected = editor.ids.includes(item.id), wasSelected = editor.saved.includes(item.id), changed = selected !== wasSelected
        return <Checkbox key={item.id} checked={selected} disabled={readOnly || busy} onChange={() => editor.toggle(item.id)} className={`amenity-option${selected ? ' is-selected' : ''}${changed && !selected ? ' is-removed' : ''}`}><span>{item.name}{changed && <small>Chưa lưu</small>}</span></Checkbox>
      })}</div>}
    </section>
    <section className="amenity-section" aria-label="Tiện ích riêng">
      {target.scope === 'roomType' ? <><h3>Tiện ích riêng</h3><p className="amenity-help">Hạng phòng hiện chỉ hỗ trợ chọn từ danh mục hệ thống. Chưa có chức năng tạo tiện ích riêng cho hạng phòng.</p></> : <CustomAmenitiesList scope={editor.scope} scopeLabel={target.name} customAmenities={editor.custom} compact onBusyChange={setCustomBusy} readOnly={readOnly || editor.saving} knownNames={options.map(item => item.name)} />}
    </section>
    {target.scope !== 'hotel' && <section className="amenity-section" aria-label="Tiện ích thực tế"><div className="amenity-section-heading"><h3>Tiện ích thực tế</h3>{editor.dirty && <Tag>Xem trước, chưa lưu</Tag>}</div><p className="amenity-help">Tổng hợp dịch vụ chung của khách sạn và tiện ích gắn trực tiếp của đối tượng đang chọn.</p>{sourcesPending && <p role="status">Chưa tải đủ dịch vụ chung; phần dưới chỉ hiển thị dữ liệu đã tải.</p>}
      {preview.length > 12 && <Select aria-label="Lọc tiện ích theo nguồn" value={sourceFilter} onChange={setSourceFilter} options={[{value:'all',label:'Tất cả nguồn'}, ...previewSources.filter(source => source.items.length > 0).map(source => ({value:source.key,label:source.label}))]} />}
      <div className="amenity-chips">{preview.filter(item => preview.length <= 12 || !previewSources.some(source => source.key === sourceFilter && source.items.length > 0) || sourceFilter === 'all' || item.sources.some(source => source.key === sourceFilter)).map(item => <Tag key={item.id}>{item.name} · {item.sources.map(source => source.label).join(' / ')}</Tag>)}</div>{preview.length === 0 && !sourcesPending && <p>Chưa có tiện ích.</p>}</section>}
    {!readOnly && editor.dirty && <footer ref={saveBarRef} className="amenity-save-bar" aria-label="Thay đổi tiện ích chưa lưu"><div><strong>{target.name}</strong><span>{editor.changeCount} thay đổi chưa lưu</span>{editor.error && <p role="alert">{editor.error}</p>}</div><Button disabled={busy} onClick={editor.reset}>Hoàn tác</Button><Button type="primary" loading={editor.saving} disabled={customBusy} onClick={() => void editor.save()}>{editor.error ? 'Thử lại lưu' : 'Lưu thay đổi'}</Button></footer>}
  </div>
}
