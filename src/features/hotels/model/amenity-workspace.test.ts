import { describe, expect, it } from 'vitest'
import { amenityPreview, amenityChanges, amenitySearchKey, amenityTargetKey, amenityWorkspaceUrl } from './amenity-workspace'
describe('amenity workspace selection and drafts', () => {
  it('searches Vietnamese names without accents or case', () => { expect(amenitySearchKey('ĐIỀU HÒA')).toBe(amenitySearchKey('dieu hoa')) })
  it('counts only actual added and removed identities', () => { expect(amenityChanges(['a', 'b'], ['b', 'c'])).toBe(2); expect(amenityChanges(['a', 'b'], ['b', 'a'])).toBe(0) })
  it('isolates room, type and hotel drafts even when IDs coincide', () => { expect(amenityTargetKey({scope:'room',id:'1'})).not.toBe(amenityTargetKey({scope:'roomType',id:'1'})) })
  it('links directly to a chosen type without losing its scope', () => { expect(amenityWorkspaceUrl('hotel', {scope:'roomType',id:'type'})).toBe('/hotels/hotel/amenities?scope=roomType&id=type') })
})

it('deduplicates inherited/direct items while preserving both sources for future room scope', () => {
  expect(amenityPreview([{key:'type',label:'Hạng',items:[{id:'a',name:'Điều hòa'}]},{key:'room',label:'Phòng',items:[{id:'a',name:'Điều hòa'}]}])).toEqual([{id:'a',name:'Điều hòa',sources:[{key:'type',label:'Hạng'},{key:'room',label:'Phòng'}]}])
})
