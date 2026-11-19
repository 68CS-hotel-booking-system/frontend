import { useState, type Key } from 'react'
import { Button, Input, Skeleton, Tree } from 'antd'
import type { TreeDataNode } from 'antd'
import type { AmenityTarget } from '../model/amenity-workspace'
import { amenitySearchKey, amenityTargetKey } from '../model/amenity-workspace'
export interface AmenityTreeItem { target: AmenityTarget; count?: number; error?: boolean; onRetry?: () => void; detail?: string }
interface ScopeNode extends TreeDataNode { target?: AmenityTarget }
export interface AmenityScopeTreeProps {
  hotel: AmenityTreeItem; types: AmenityTreeItem[]; selected: AmenityTarget; dirtyKey?: string; loading?: boolean; locked?: boolean
  onSelect: (target: AmenityTarget) => void; onCreateType?: () => void
  loadChildren?: (target: AmenityTarget, offset: number, limit: number) => Promise<{ items: AmenityTreeItem[]; total: number }>
}
/** Ant Tree supplies roving focus, Up/Down and Left/Right; child scope is lazy and optional. */
export function AmenityScopeTree({ hotel, types, selected, dirtyKey, loading, locked, onSelect, onCreateType, loadChildren }: AmenityScopeTreeProps) {
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<Key[]>(['room-types'])
  const [loadErrors, setLoadErrors] = useState<Record<string, boolean>>({})
  const [children, setChildren] = useState<Record<string, { items: AmenityTreeItem[]; total: number }>>({})
  const title = (item: AmenityTreeItem) => <span className="amenity-tree-row" aria-current={amenityTargetKey(item.target) === amenityTargetKey(selected) ? 'true' : undefined}><span className="amenity-tree-name">{item.target.name}{dirtyKey === amenityTargetKey(item.target) && <span className="amenity-dirty-dot" aria-label="Chưa lưu" />}{item.detail && <small>{item.detail}</small>}</span>{(item.error || loadErrors[amenityTargetKey(item.target)]) ? <Button size="small" type="text" aria-label={`Thử tải số tiện ích ${item.target.name}`} onKeyDown={event => event.stopPropagation()} onClick={event => { event.stopPropagation(); if (loadErrors[amenityTargetKey(item.target)]) void load(item.target); else item.onRetry?.() }}>Thử lại</Button> : <span className={`amenity-count${item.count === 0 ? ' is-zero' : ''}`} aria-label={item.count === undefined ? 'Đang tải số tiện ích' : `${item.count} tiện ích gắn trực tiếp`}>{item.count ?? '…'}</span>}</span>
  const load = async (target: AmenityTarget, append = false) => {
    if (!loadChildren) return
    const key = amenityTargetKey(target), current = children[key]?.items ?? []
    setLoadErrors(previous => ({...previous, [key]:false}))
    try {
      const next = await loadChildren(target, append ? current.length : 0, 10)
      setChildren(previous => ({ ...previous, [key]: { items: append ? [...current, ...next.items.slice(0, 10)] : next.items.slice(0, 10), total: next.total } }))
    } catch { setLoadErrors(previous => ({...previous, [key]:true})) }

  }
  const toNode = (item: AmenityTreeItem): ScopeNode => {
    const key = amenityTargetKey(item.target), branch = children[key]
    return { key, target: item.target, title: title(item), isLeaf: !loadChildren || item.target.scope === 'room', children: branch ? [...branch.items.map(toNode), ...(branch.items.length < branch.total ? [{ key: `${key}:more`, selectable: false, isLeaf: true, title: <Button type="link" onClick={event => { event.stopPropagation(); void load(item.target, true) }}>Xem thêm ({branch.total - branch.items.length})</Button> }] : [])] : undefined }
  }
  const filtered = types.filter(item => amenitySearchKey(item.target.name).includes(amenitySearchKey(search)))
  return <div className="amenity-tree-content"><h2>Áp dụng cho</h2><Input.Search aria-label="Tìm hạng phòng" placeholder="Tìm hạng phòng…" allowClear value={search} onChange={event => setSearch(event.target.value)} />
    {loading ? <Skeleton active paragraph={{ rows: 5 }} /> : <><Tree<ScopeNode> aria-label="Đối tượng áp dụng tiện ích" blockNode disabled={locked} expandedKeys={search ? [...new Set([...expanded, 'room-types'])] : expanded} onExpand={keys => setExpanded(keys)} selectedKeys={[amenityTargetKey(selected)]} treeData={[toNode(hotel), { key: 'room-types', selectable: false, title: <strong>Hạng phòng ({types.length})</strong>, children: filtered.map(toNode) }]} loadData={loadChildren ? node => node.target ? load(node.target) : Promise.resolve() : undefined} onSelect={(_keys, info) => { if (info.node.target) onSelect(info.node.target) }} />
      {types.length === 0 ? <div className="amenity-tree-empty"><p>Chưa có hạng phòng</p>{onCreateType && <Button type="link" disabled={locked} onClick={onCreateType}>Tạo hạng phòng</Button>}</div> : filtered.length === 0 && <div className="amenity-tree-empty"><p>Không tìm thấy</p><Button onClick={() => setSearch('')}>Xóa tìm</Button></div>}
    </>}
  </div>
}
