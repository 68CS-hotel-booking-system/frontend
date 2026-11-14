import { useCallback, useState } from 'react'
import { App } from 'antd'
import { useAmenitiesQuery } from './use-amenities-query'
import { useReplaceCatalogAmenitiesMutation, useReplaceRoomTypeAmenitiesMutation, useRoomTypeAmenitiesQuery, useScopedAmenitiesQuery } from './use-scoped-amenities'
import { getAmenityErrorMessage } from '../api/scoped-amenities-api'
import { amenityChanges, type AmenityTarget } from '../model/amenity-workspace'

export function useAmenityEditor(hotelId: string, target: AmenityTarget, readOnly: boolean) {
  const { message } = App.useApp()
  const typeMode = target.scope === 'roomType'
  const scope = { hotelId, roomId: target.scope === 'room' ? target.id : undefined }
  const catalog = useAmenitiesQuery(target.scope === 'hotel' ? 'HOTEL' : 'ROOM')
  const typeQuery = useRoomTypeAmenitiesQuery(hotelId, typeMode ? target.id : '')
  const scopedQuery = useScopedAmenitiesQuery(scope, !typeMode)
  const typeMutation = useReplaceRoomTypeAmenitiesMutation(hotelId, typeMode ? target.id : '')
  const scopeMutation = useReplaceCatalogAmenitiesMutation(scope)
  const direct = typeMode ? typeQuery.data : scopedQuery.data?.catalogAmenities
  const saved = direct?.map(item => item.id) ?? []
  const [draft, setDraft] = useState<{ base: string[]; ids: string[] } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const ids = draft?.ids ?? saved
  const changeCount = amenityChanges(draft?.base ?? saved, ids)
  const dirty = changeCount > 0
  const saving = typeMutation.isPending || scopeMutation.isPending
  const reset = useCallback(() => { setDraft(null); setError(null) }, [])
  const save = async () => {
    if (readOnly || saving) return false
    if (!dirty) return true
    setError(null)
    try {
      if (typeMode) await typeMutation.mutateAsync(ids)
      else await scopeMutation.mutateAsync(ids)
      reset(); void message.success(`Đã lưu tiện ích cho ${target.name}`); return true
    } catch (cause) { setError(getAmenityErrorMessage(cause)); return false }
  }
  const toggle = (id: string) => {
    if (readOnly || saving) return
    setError(null)
    setDraft(previous => {
      const current = previous?.ids ?? saved
      return { base: previous?.base ?? saved, ids: current.includes(id) ? current.filter(value => value !== id) : [...current, id] }
    })
  }
  return { catalog, query: typeMode ? typeQuery : scopedQuery, direct: direct ?? [], custom: scopedQuery.data?.customAmenities ?? [], scope, ids, saved: draft?.base ?? saved, changeCount, dirty, saving, error, reset, save, toggle }
}
