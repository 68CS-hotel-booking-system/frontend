import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { getPublicHotelDetail } from '@/features/hotels'
import { ApiError } from '@/shared/api/api-error'
import { useClientHomeContext } from '../hooks/use-client-home-context'
import { usePublicGallery } from '../hooks/use-public-gallery'
import { useCover } from '../hooks/use-public-discovery'
import { ClientReferenceIcon } from './ClientReferenceIcon'

function SavedStay({ id, onRemove, listingReturn }: { id: string; onRemove: () => void; listingReturn: string }) {
  const hotel = useQuery({
    queryKey: ['hotels', 'public-detail', id],
    queryFn: ({ signal }) => getPublicHotelDetail(id, signal),
    retry: false,
  })
  const gallery = usePublicGallery(hotel.data ? id : '')
  const images = gallery.data?.images ?? []
  const cover = useCover((images.find(image => image.cover) ?? images[0])?.mediaId)
  const unavailable = hotel.error instanceof ApiError && hotel.error.status === 404
  const href = `/stays/${encodeURIComponent(id)}`

  if (hotel.isPending) return <li className="stayhub-saved-item" role="status">Đang tải chỗ nghỉ…</li>
  if (hotel.isError) return <li className="stayhub-saved-item">
    <p>{unavailable ? 'Chỗ nghỉ này hiện không còn hiển thị.' : 'Chưa tải được chỗ nghỉ.'}</p>
    <div className="stayhub-row-actions">
      {!unavailable && <button type="button" className="ref-btn ref-btn-secondary" onClick={() => void hotel.refetch()}>Thử lại</button>}
      <button type="button" className="ref-btn ref-btn-secondary" onClick={onRemove}>Bỏ lưu</button>
    </div>
  </li>

  return <li className="stayhub-saved-item">
    <Link to={href} state={{ listingReturn }} viewTransition>
      <div className="stayhub-saved-photo">
        <ClientReferenceIcon name="home" size={24} />
        {cover.data?.url && <img key={cover.data.url} src={cover.data.url} alt="" loading="lazy"
          onError={event => { event.currentTarget.hidden = true }} />}
      </div>
      <div><h2>{hotel.data.name}</h2><p>{hotel.data.address}</p></div>
    </Link>
    <button type="button" className="stayhub-icon-link" onClick={onRemove}
      title="Bỏ lưu" aria-label={`Bỏ lưu ${hotel.data.name}`}>
      <ClientReferenceIcon name="heart" size={20} />
    </button>
  </li>
}

export function ClientSavedStays({ inAccount = false }: { inAccount?: boolean }) {
  const { savedIds, toggleSaved } = useClientHomeContext()
  const listingReturn = inAccount ? '/account/saved-stays' : '/saved-stays'
  const summary = savedIds.size ? `${savedIds.size} chỗ nghỉ đã lưu trên trình duyệt này.` : 'Bấm trái tim khi xem một chỗ nghỉ để lưu vào danh sách này.'
  return <div className={inAccount ? undefined : 'ref-ui'}>
    <div className={inAccount ? 'account-saved-stays' : 'ref-wrap stayhub-guide'}>
      {inAccount ? <p role="status">{summary}</p> : <header className="stayhub-guide-heading">
        <h1>Chỗ nghỉ đã lưu</h1>
        <p>{summary}</p>
      </header>}
      {savedIds.size > 0 && <ul className="stayhub-saved-list">
        {[...savedIds].map(id => <SavedStay key={id} id={id} listingReturn={listingReturn} onRemove={() => toggleSaved(id)} />)}
      </ul>}
      <Link className="stayhub-inline-link" to="/explore" viewTransition>Khám phá chỗ nghỉ <span aria-hidden="true">→</span></Link>
    </div>
  </div>
}
