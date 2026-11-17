import { useEffect, useRef, useState } from 'react'
import { Modal } from 'antd'
import { useLocation, useNavigate, useSearchParams } from 'react-router'
import { useCover } from '../hooks/use-public-discovery'
import { usePublicGallery } from '../hooks/use-public-gallery'
import type { PublicGallery } from '../api/public-gallery-api'
import { groupGalleryAlbums } from '../model/gallery-albums'
import { HotelDetailIcon } from './HotelDetailIcon'
import { HotelDetailActions } from './HotelDetailActions'
import '@/shared/styles/client-photo-tour.css'

function Photo({ mediaId, alt, large = false }: { mediaId: string; alt: string; large?: boolean }) {
  const image = useCover(mediaId)
  const [failed, setFailed] = useState<string | null>(null)
  if (!image.data?.url || failed === image.data.url) return <div className="flex h-full min-h-40 items-center justify-center bg-[#f5f5f5] p-5 text-[#717171]">
    {image.isFetching ? 'Đang tải ảnh…' : <span>Không tải được ảnh. <button type="button" onClick={e => { e.stopPropagation(); setFailed(null); void image.refetch() }}>Thử lại</button></span>}
  </div>
  return <img className={large ? 'max-h-[75vh] w-full object-contain' : 'h-full w-full object-cover'} src={image.data.url} alt={alt} loading={large ? 'eager' : 'lazy'} onError={() => setFailed(image.data!.url)} />
}

export function ClientHotelGallery({ hotelId, hotelName }: { hotelId: string; hotelName: string }) {
  const gallery = usePublicGallery(hotelId)
  if (gallery.isPending) return <div className="hotel-gallery-placeholder" role="status">Đang tải ảnh khách sạn…</div>
  if (gallery.isError) return <div className="hotel-gallery-placeholder" role="alert">Không tải được ảnh khách sạn. <button type="button" onClick={() => void gallery.refetch()}>Thử lại</button></div>
  return <GalleryView key={hotelId} data={gallery.data} hotelName={hotelName} />
}

export function GalleryView({ data, hotelName }: { data: PublicGallery; hotelName: string }) {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const touchStart = useRef(0)
  const albumScroller = useRef<HTMLDivElement>(null)
  const albumId = params.get('albumId')
  const [activeAlbumId, setActiveAlbumId] = useState('')
  const images = [...data.images].sort((a, b) => Number(b.cover) - Number(a.cover) || a.sortOrder - b.sortOrder)
  const photoId = params.get('photoId')
  const index = images.findIndex(p => p.mediaId === photoId)
  const tour = params.get('view') === 'photos'
  const groups = groupGalleryAlbums(data)
  const selectAlbum = (id?: string) => {
    const scroller = albumScroller.current
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    if (id) scroller?.querySelector<HTMLElement>(`[data-album-id="${CSS.escape(id)}"]`)?.scrollIntoView({ behavior, block: 'start' })
    else scroller?.scrollTo({ top: 0, behavior })
    setActiveAlbumId(id ?? '')
    const next = new URLSearchParams(params)
    if (id) next.set('albumId', id); else next.delete('albumId')
    setParams(next, { replace: true, state: location.state })
  }
  useEffect(() => {
    if (!tour || index >= 0 || !albumId) return
    const frame = requestAnimationFrame(() => albumScroller.current?.querySelector<HTMLElement>(`[data-album-id="${CSS.escape(albumId)}"]`)?.scrollIntoView({ block: 'start', behavior: 'smooth' }))
    return () => cancelAnimationFrame(frame)
  }, [tour, index, albumId])
  const change = (photo?: string) => {
    const next = new URLSearchParams(params)
    next.set('view', 'photos')
    if (photo) next.set('photoId', photo); else next.delete('photoId')
    setParams(next, { replace: tour && Boolean(photoId), state: { galleryReturn: data.hotelId } })
  }
  const close = () => {
    const state: unknown = location.state
    if (typeof state === 'object' && state !== null && 'galleryReturn' in state && state.galleryReturn === data.hotelId) {
      void navigate(-1)
      return
    }
    const next = new URLSearchParams(params)
    if (photoId) next.delete('photoId')
    else { next.delete('view'); next.delete('albumId') }
    setParams(next, { replace: true })
  }
  const move = (direction: number) => { if (images.length) change(images[(index + direction + images.length) % images.length].mediaId) }
  useEffect(() => {
    if (index < 0) return
    const key = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
      e.preventDefault()
      const next = new URLSearchParams(params)
      next.set('photoId', images[(index + (e.key === 'ArrowRight' ? 1 : -1) + images.length) % images.length].mediaId)
      setParams(next, { replace: true, state: location.state })
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [index, images, params, setParams, location.state])
  if (!images.length) return <div className="hotel-gallery-placeholder">Chưa có ảnh</div>
  const visible = images.slice(0, 5)
  return <section aria-label="Ảnh khách sạn" className="hotel-detail-gallery relative my-7">
    <div className="hotel-detail-gallery-grid grid h-72 gap-2 overflow-hidden rounded-2xl sm:h-[440px]" style={{ gridTemplateColumns: visible.length === 1 ? '1fr' : '1fr 1fr' }}>
      <button type="button" className="min-h-0 overflow-hidden" aria-label="Mở ảnh đầu tiên" onClick={() => change(images[0].mediaId)}><Photo mediaId={images[0].mediaId} alt={hotelName} /></button>
      {visible.length > 1 && <div className="hotel-detail-gallery-secondary grid min-h-0 gap-2" style={{ gridTemplateColumns: visible.length === 5 ? '1fr 1fr' : '1fr', gridTemplateRows: visible.length === 5 ? '1fr 1fr' : `repeat(${visible.length - 1}, minmax(0, 1fr))` }}>{visible.slice(1).map(p => <button key={p.mediaId} type="button" className="min-h-0 overflow-hidden" aria-label="Mở ảnh khách sạn" onClick={() => change(p.mediaId)}><Photo mediaId={p.mediaId} alt={hotelName} /></button>)}</div>}
    </div>
    <button type="button" className="hotel-detail-gallery-all absolute bottom-4 right-4 rounded-lg border bg-white px-4 py-2 font-semibold text-[#1a1918]" onClick={() => change()}><HotelDetailIcon name="photos" /><span>Xem tất cả {images.length} ảnh</span></button>
    <Modal title={null} open={tour} onCancel={close} footer={null} width="100%" className="client-photo-tour" styles={{ container: { padding: 0 }, wrapper: { margin: 0 }, body: { padding: 0 } }}>
      <header className="photo-tour-header">
        <div className="photo-tour-header-inner">
          <button type="button" className="photo-tour-back" onClick={close} aria-label="Quay lại trang khách sạn"><HotelDetailIcon name="back" /></button>
          <HotelDetailActions hotelId={data.hotelId} name={hotelName} />
        </div>
      </header>
      <div className="photo-tour-scroll" ref={albumScroller} onScroll={e => {
        const root = e.currentTarget
        const viewport = root.getBoundingClientRect()
        const sections = Array.from(root.querySelectorAll<HTMLElement>('[data-album-id]'))
        const visible = sections.map(section => {
          const box = section.getBoundingClientRect()
          return { id: section.dataset.albumId, height: Math.max(0, Math.min(box.bottom, viewport.bottom) - Math.max(box.top, viewport.top + 80)) }
        }).sort((a, b) => b.height - a.height)
        setActiveAlbumId(visible[0]?.height ? visible[0].id ?? '' : '')
      }}>
        <main className="photo-tour-wrap">
          <section className="photo-tour-intro" aria-labelledby="photo-tour-heading">
            <h1 id="photo-tour-heading">Tham quan qua ảnh</h1>
            <p>{hotelName}</p>
          </section>
          {data.albums.length > 0 && <nav className="photo-tour-albums" aria-label="Chuyển nhanh giữa các album">{groups.map(g => <button type="button" key={g.id} className="photo-tour-album" aria-current={(activeAlbumId || albumId) === g.id ? 'true' : undefined} onClick={() => selectAlbum(g.id)}>
            <div className="photo-tour-thumbnail"><Photo mediaId={g.photos[0].mediaId} alt={g.name} /></div><strong>{g.name}</strong>
          </button>)}</nav>}
          {!data.albums.length && <p className="photo-tour-hint">Ảnh khách sạn chưa được phân vào album.</p>}
          {groups.map(g => <section key={g.id} data-album-id={g.id} className="photo-tour-group">
            <div className="photo-tour-group-heading"><h2>{data.albums.length ? g.name : 'Ảnh khách sạn'}</h2>{g.description && <p>{g.description}</p>}<small>{g.photos.length} ảnh</small></div>
            <div className="photo-tour-group-grid">{g.photos.map((p, n) => <button type="button" key={p.mediaId} className={g.photos.length % 2 === 1 && n === 0 ? 'photo-tour-photo photo-tour-photo--wide' : 'photo-tour-photo'} aria-label={`Xem ảnh ${n + 1} – ${g.name}`} onClick={() => change(p.mediaId)}><Photo mediaId={p.mediaId} alt={`${g.name} – ảnh ${n + 1}`} /></button>)}</div>
          </section>)}
        </main>
      </div>
    </Modal>
    <Modal title={index >= 0 ? `${groups.find(g => g.photos.some(p => p.mediaId === photoId))?.name ?? hotelName} · ${index + 1} / ${images.length}` : hotelName} open={tour && index >= 0} onCancel={close} footer={null} width="100%" className="client-photo-tour client-photo-lightbox" zIndex={1100} styles={{ container: { padding: 0 }, body: { padding: 0 } }}>
      {index >= 0 && <div className="photo-lightbox-stage" onTouchStart={e => { touchStart.current = e.touches[0].clientX }} onTouchEnd={e => { const delta = e.changedTouches[0].clientX - touchStart.current; if (Math.abs(delta) > 50) move(delta < 0 ? 1 : -1) }}>
        <button className="photo-lightbox-prev" type="button" onClick={() => move(-1)} aria-label="Ảnh trước">←</button>
        <Photo key={images[index].mediaId} mediaId={images[index].mediaId} alt={hotelName} large />
        <button className="photo-lightbox-next" type="button" onClick={() => move(1)} aria-label="Ảnh sau">→</button>
      </div>}
    </Modal>
  </section>
}
