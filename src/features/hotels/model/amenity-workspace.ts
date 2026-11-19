import type { AmenityItem } from './hotel'
export type AmenityTarget = { scope: 'hotel' | 'roomType' | 'room'; id: string; name: string; detail?: string }
export type AmenitySource = { key: string; label: string; items: AmenityItem[]; note?: string; loading?: boolean; error?: string; onRetry?: () => void; sourceLabel?: string; onManage?: () => void }
export function amenityTargetKey(target: Pick<AmenityTarget, 'scope' | 'id'>) { return `${target.scope}:${target.id}` }
export function amenitySearchKey(value: string) { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLocaleLowerCase('vi').trim() }
export function amenityChanges(saved: string[], selected: string[]) {
  const before = new Set(saved), after = new Set(selected)
  return [...before].filter(id => !after.has(id)).length + [...after].filter(id => !before.has(id)).length
}
export function amenityWorkspaceUrl(hotelId: string, target: Pick<AmenityTarget, 'scope' | 'id'>) {
  return `/hotels/${encodeURIComponent(hotelId)}/amenities?${new URLSearchParams({ scope: target.scope, id: target.id })}`
}

export function amenityPreview(sources: { key: string; label: string; items: {id: string; name: string}[] }[]) {
  const result = new Map<string, {id: string; name: string; sources: {key: string; label: string}[]}>()
  for (const source of sources) for (const item of source.items) {
    const current = result.get(item.id)
    if (current) { if (!current.sources.some(value => value.key === source.key)) current.sources.push({key: source.key, label: source.label}) }
    else result.set(item.id, {id: item.id, name: item.name, sources: [{key: source.key, label: source.label}]})
  }
  return [...result.values()]
}
