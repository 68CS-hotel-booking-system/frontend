import type { PublicGallery } from '../api/public-gallery-api'

export function groupGalleryAlbums(data: PublicGallery) {
  const images = [...data.images].sort((a, b) => a.sortOrder - b.sortOrder)
  const groups = [...data.albums].sort((a, b) => a.sortOrder - b.sortOrder)
    .map(album => ({ ...album, photos: images.filter(image => image.albumId === album.id) }))
    .filter(album => album.photos.length > 0)
  const extra = images.filter(image => !data.albums.some(album => album.id === image.albumId))
  if (extra.length) groups.push({ id: 'extra', name: 'Ảnh bổ sung', description: null, sortOrder: Number.MAX_SAFE_INTEGER, photos: extra })
  return groups
}
