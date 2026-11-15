import { useState } from 'react'
import { localDate, type StayForm } from '../api/booking-api'

export function StayCalendar({ stay, onChange, city }: { stay: StayForm; onChange: (value: StayForm) => void; city?: string }) {
  const [month, setMonth] = useState(() => {
    const parsed = new Date(`${stay.checkIn}T12:00:00`)
    const date = Number.isFinite(parsed.getTime()) ? parsed : new Date()
    return new Date(date.getFullYear(), date.getMonth(), 1)
  })
  const [selectingEnd, setSelectingEnd] = useState(false)
  function choose(value: string) {
    if (!selectingEnd || value <= stay.checkIn) {
      const next = new Date(`${value}T12:00:00`); next.setDate(next.getDate() + 1)
      onChange({ ...stay, checkIn: value, checkOut: iso(next) }); setSelectingEnd(true)
    } else { onChange({ ...stay, checkOut: value }); setSelectingEnd(false) }
  }
  const months = [month, new Date(month.getFullYear(), month.getMonth() + 1, 1)]
  const nights = Math.round((Date.parse(stay.checkOut) - Date.parse(stay.checkIn)) / 86400000)
  return <section id="booking-calendar" className="stay-calendar" aria-label="Lịch chọn ngày lưu trú">
    <h3 className="text-xl font-serif font-bold">{Number.isFinite(nights) && nights > 0 ? `${nights} đêm` : 'Chọn kỳ nghỉ'}{city ? ` tại ${city}` : ''}</h3>
    <p className="stay-calendar-status" aria-live="polite">{selectingEnd ? 'Chọn ngày trả phòng' : 'Chọn ngày nhận phòng'} · {stay.checkIn.split('-').reverse().join('/')} – {stay.checkOut.split('-').reverse().join('/')}</p>
    <div className="stay-calendar-navigation"><button type="button" aria-label="Tháng trước" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>←</button><button type="button" aria-label="Tháng sau" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>→</button></div>
    <div className="stay-calendar-months">{months.map((date) => <div key={date.toISOString()}>
      <h4>Tháng {date.getMonth() + 1} năm {date.getFullYear()}</h4>
      <div className="stay-calendar-grid">{['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day) => <span key={day} className="stay-calendar-weekday">{day}</span>)}
        {Array.from({ length: (date.getDay() + 6) % 7 }, (_, index) => <span key={`blank-${index}`} />)}
        {Array.from({ length: new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate() }, (_, index) => {
          const value = iso(new Date(date.getFullYear(), date.getMonth(), index + 1))
          const active = value === stay.checkIn || value === stay.checkOut
          return <button key={value} type="button" data-date={value} aria-label={value.split('-').reverse().join('/')} aria-pressed={active} className={active ? 'is-selected' : value > stay.checkIn && value < stay.checkOut ? 'is-between' : ''} disabled={value < localDate()} onClick={() => choose(value)}>{index + 1}</button>
        })}
      </div>
    </div>)}</div>
    <button type="button" className="stay-calendar-reset" onClick={() => { onChange({ ...stay, checkIn: localDate(), checkOut: localDate(1) }); setSelectingEnd(false); setMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1)) }}>Đặt lại ngày</button>
  </section>
}
function iso(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` }
