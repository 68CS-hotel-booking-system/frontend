import { expect, it } from 'vitest'
import { groupGalleryAlbums } from './gallery-albums'

it('groups by albumId, respects order, omits empty albums and keeps unassigned photos', () => {
  const result = groupGalleryAlbums({ hotelId: 'hotel', albums: [
    { id: 'pool', name: 'Hồ bơi', description: null, sortOrder: 2 },
    { id: 'lobby', name: 'Sảnh', description: 'Tầng trệt', sortOrder: 1 },
    { id: 'empty', name: 'Trống', description: null, sortOrder: 0 },
  ], images: [
    { mediaId: 'b', albumId: 'lobby', sortOrder: 2, cover: true },
    { mediaId: 'a', albumId: 'lobby', sortOrder: 1, cover: false },
    { mediaId: 'c', albumId: 'pool', sortOrder: 3, cover: false },
    { mediaId: 'd', albumId: null, sortOrder: 4, cover: false },
    { mediaId: 'e', albumId: 'missing', sortOrder: 5, cover: false },
  ] })
  expect(result.map(g => g.name)).toEqual(['Sảnh', 'Hồ bơi', 'Ảnh bổ sung'])
  expect(result[0].photos.map(p => p.mediaId)).toEqual(['a', 'b'])
  expect(result[2].photos.map(p => p.mediaId)).toEqual(['d', 'e'])
})
