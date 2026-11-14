import { useState } from 'react'
import { Link } from 'react-router'
import { ClientIcon, ClientJournalSection, useCities, useCover, useHotelSearch, type SearchHotel, type SearchParams } from '@/features/discovery'

function HotelCard({ hotel, search }: { hotel: SearchHotel; search: SearchParams }) {
  const cover = useCover(hotel.coverImage?.mediaId)
  const [imageFailed, setImageFailed] = useState(false)
  const query = new URLSearchParams({ adults: String(search.guests) })
  if (search.checkIn && search.checkOut) { query.set('checkIn', search.checkIn); query.set('checkOut', search.checkOut) }
  const href = `/stays/${hotel.id}?${query}`
  const state = { hotelId: hotel.id, coverMediaId: hotel.coverImage?.mediaId }
  return <article className="stay-card" role="listitem">
    <Link to={href} state={state} className="stay-media" aria-label={`Xem ${hotel.name}`}>
      {cover.data?.url && !imageFailed ? <img src={cover.data.url} alt={hotel.name} loading="lazy" onError={() => setImageFailed(true)} /> : <div className="flex h-full items-center justify-center bg-[#eee8df] text-[#706a62]">Ch╞░a c├│ ß║únh</div>}
    </Link>
    <div className="stay-body"><div className="stay-location"><ClientIcon name="pin" /> {hotel.city.name} <span /> {hotel.address}</div>
      <h3><Link to={href} state={state}>{hotel.name}</Link></h3>
      {hotel.starRating != null && <p>{hotel.starRating} sao</p>}
      {!!hotel.amenities.length && <ul className="amenities">{hotel.amenities.slice(0, 3).map(a => <li key={a.id}><ClientIcon name="check" /> {a.name}</li>)}</ul>}
      <div className="stay-footer"><div className="stay-price"><div className="price-main"><strong>{hotel.totalPrice != null && search.checkIn ? `${new Intl.NumberFormat('vi-VN').format(hotel.totalPrice)} ${hotel.currency ?? ''}` : hotel.minNightlyPrice != null ? `${new Intl.NumberFormat('vi-VN').format(hotel.minNightlyPrice)} ${hotel.currency ?? ''}` : 'Chß╗ìn ng├áy ─æß╗â xem gi├í'}</strong></div><span className="price-unit">{hotel.totalPrice != null && search.checkIn ? 'Tß╗òng kß╗│ l╞░u tr├║' : hotel.minNightlyPrice != null ? 'Tß╗½ / ─æ├¬m' : ''}</span></div><Link className="stay-link" to={href} state={state}><span>Xem chi tiß║┐t</span><ClientIcon name="arrow" /></Link></div>
    </div>
  </article>
}

export function StayVibeHomePage() {
  const [draft, setDraft] = useState<SearchParams>({ cityId: '', checkIn: '', checkOut: '', guests: 1, page: 0 })
  const [params, setParams] = useState(draft)
  const cities = useCities()
  const hotels = useHotelSearch(params)
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date())
  const invalidDates = Boolean(draft.checkIn || draft.checkOut) && (!draft.checkIn || !draft.checkOut || draft.checkIn < today || draft.checkOut <= draft.checkIn || (Date.parse(draft.checkOut) - Date.parse(draft.checkIn)) / 86400000 > 30)
  const showStays = () => document.getElementById('stays')?.scrollIntoView({ behavior: 'smooth' })
  return <div className="w-full flex flex-col">
    <section className="hero" id="top" aria-labelledby="hero-title"><div className="container"><div className="hero-grid"><div className="hero-copy">
      <p className="eyebrow">Bß╗Ö s╞░u tß║¡p l╞░u tr├║ StayHub</p><h1 id="hero-title">ß╗₧ n╞íi <em>c├óu chuyß╗çn</em><br />bß║»t ─æß║ºu.</h1><p className="hero-lede">T├¼m mß╗Öt n╞íi ph├╣ hß╗úp cho chuyß║┐n ─æi cß╗ºa bß║ín, tß╗½ nhß╗»ng kh├ích sß║ín ─æang mß╗ƒ ─æ├│n kh├ích tr├¬n StayHub.</p>
    </div><div className="hero-visual"><figure className="hero-media"><img src="/assets/client/phuquoc.jpg" alt="Khung cß║únh biß╗ân Ph├║ Quß╗æc" fetchPriority="high" width="1400" height="1400" /><span className="hero-location"><ClientIcon name="pin" /> Ph├║ Quß╗æc ┬╖ Viß╗çt Nam</span></figure></div></div>
      <div className="search-wrap"><form className="search-panel" aria-label="T├¼m kiß║┐m chß╗ù nghß╗ë" onSubmit={e => { e.preventDefault(); if (!invalidDates) { setParams({ ...draft, page: 0 }); showStays() } }}>
        <div className="search-field"><ClientIcon name="pin" /><div className="search-field-content"><label htmlFor="destination">─Éiß╗âm ─æß║┐n</label><select id="destination" value={draft.cityId} onChange={e => setDraft({ ...draft, cityId: e.target.value })}><option value="">Tß║Ñt cß║ú th├ánh phß╗æ</option>{cities.data?.map(c => <option value={c.id} key={c.id}>{c.name}</option>)}</select></div></div>
        <div className="search-field"><ClientIcon name="calendar" /><div className="search-field-content"><label htmlFor="check-in">Nhß║¡n ph├▓ng</label><input id="check-in" type="date" value={draft.checkIn} onChange={e => setDraft({ ...draft, checkIn: e.target.value })} /></div></div>
        <div className="search-field"><ClientIcon name="calendar" /><div className="search-field-content"><label htmlFor="check-out">Trß║ú ph├▓ng</label><input id="check-out" type="date" value={draft.checkOut} onChange={e => setDraft({ ...draft, checkOut: e.target.value })} /></div></div>
        <div className="search-field"><ClientIcon name="users" /><div className="search-field-content"><label htmlFor="guests">Kh├ích / ph├▓ng</label><input id="guests" type="number" min="1" max="50" value={draft.guests} onChange={e => setDraft({ ...draft, guests: Number(e.target.value) })} /></div></div>
        <button className="search-submit" disabled={invalidDates || !Number.isInteger(draft.guests) || draft.guests < 1 || draft.guests > 50}><ClientIcon name="search" /><span>T├¼m chß╗ù nghß╗ë</span></button>
      </form>{invalidDates && <p role="alert">Chß╗ìn ng├áy hß╗úp lß╗ç, tß╗½ h├┤m nay v├á tß╗æi ─æa 30 ─æ├¬m.</p>}{cities.isError && <p role="alert">Kh├┤ng tß║úi ─æ╞░ß╗úc th├ánh phß╗æ. <button onClick={() => void cities.refetch()}>Thß╗¡ lß║íi</button></p>}</div>
    </div></section>
    {Boolean(cities.data?.length) && <section className="section" id="destinations"><div className="container"><div className="section-head"><div><p className="eyebrow">─Éiß╗âm ─æß║┐n</p><h2 className="section-title">Bß║ín muß╗æn <em>─æi ─æ├óu?</em></h2></div><div className="section-aside"><p>Chß╗ìn th├ánh phß╗æ ─æß╗â kh├ím ph├í c├íc kh├ích sß║ín ─æang mß╗ƒ ─æ├│n kh├ích.</p></div></div><div className="quick-row">{cities.data?.map(city => <button key={city.id} type="button" onClick={() => { const next = { ...draft, cityId: city.id, page: 0 }; setDraft(next); setParams(next); showStays() }}>{city.name}</button>)}</div></div></section>}
    <section className="section stays-section" id="stays" aria-labelledby="stays-title"><div className="container"><div className="section-head stays-head"><div><p className="eyebrow">Bß╗Ö s╞░u tß║¡p chß╗ù nghß╗ë</p><h2 className="section-title" id="stays-title">Nhß╗»ng n╞íi <em>─æ├íng ─æß╗â l╞░u lß║íi.</em></h2></div><div className="section-aside"><p>Kh├ím ph├í nhß╗»ng kh├ích sß║ín ─æang mß╗ƒ ─æ├│n kh├ích v├á t├¼m lß╗▒a chß╗ìn ph├╣ hß╗úp vß╗¢i chuyß║┐n ─æi cß╗ºa bß║ín.</p></div></div>
      {hotels.isPending && <div className="empty-state">─Éang tß║úi kh├ích sß║ínΓÇª</div>}{hotels.isError && <div className="empty-state" role="alert"><h3>Kh├┤ng thß╗â tß║úi danh s├ích chß╗ù nghß╗ë</h3><button className="btn btn--primary" onClick={() => void hotels.refetch()}>Thß╗¡ lß║íi</button></div>}
      {hotels.data && <><div className="stays-controls"><div className="stays-count">T├¼m thß║Ñy <strong>{hotels.data.totalElements}</strong> kh├ích sß║ín</div></div>{hotels.data.content.length === 0 ? <div className="empty-state"><h3>Kh├┤ng t├¼m thß║Ñy chß╗ù nghß╗ë ph├╣ hß╗úp</h3><p>H├úy thß╗¡ thay ─æß╗òi ─æiß╗âm ─æß║┐n hoß║╖c ng├áy l╞░u tr├║.</p></div> : <div className="stays-grid" role="list">{hotels.data.content.map(h => <HotelCard key={h.id} hotel={h} search={params} />)}</div>}<div className="collection-foot"><button className="text-link" disabled={hotels.data.first} onClick={() => { setParams({ ...params, page: params.page - 1 }); showStays() }}>ΓåÉ Trang tr╞░ß╗¢c</button><span>Trang {params.page + 1} / {Math.max(1, hotels.data.totalPages)}</span><button className="text-link" disabled={hotels.data.last} onClick={() => { setParams({ ...params, page: params.page + 1 }); showStays() }}>Trang sau ΓåÆ</button></div></>}
    </div></section>
    <ClientJournalSection onJournalCta={showStays} />
    <section className="section partner" id="partner"><div className="container"><div className="partner-card"><div className="partner-media"><img src="/assets/client/experience.jpg" alt="Kh├┤ng gian nghß╗ë d╞░ß╗íng b├¬n hß╗ô b╞íi" loading="lazy" /><span className="partner-badge">D├ánh cho ─æß╗æi t├íc l╞░u tr├║</span></div><div className="partner-copy"><p className="eyebrow">Hß╗úp t├íc c├╣ng StayHub</p><h2>Bß║ín c├│ mß╗Öt n╞íi <em>─æ├íng ─æß╗â ß╗ƒ?</em></h2><p>─É╞░a chß╗ù nghß╗ë cß╗ºa bß║ín ─æß║┐n nhß╗»ng vß╗ï kh├ích ─æang t├¼m ─æ├║ng ─æiß╗üu m├¼nh muß╗æn.</p><div className="partner-actions"><Link className="btn btn--dark" to="/hotels">Quß║ún l├╜ kh├ích sß║ín <ClientIcon name="arrow" /></Link></div></div></div></div></section>
  </div>
}
