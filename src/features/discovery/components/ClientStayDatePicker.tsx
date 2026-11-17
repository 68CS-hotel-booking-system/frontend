import { useId, useRef, useState, type KeyboardEvent } from 'react'
import { Modal, Popover } from 'antd'
import { displayStayDate, isStayDate, selectStayDate, stayNights, type StayDateRange } from '../model/stay-date-selection'
import '@/shared/styles/client-stay-calendar.css'

type Props = StayDateRange & { today: string; onChange: (dates: StayDateRange) => void }
const weekdays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
const iso = (date: Date) => date.toISOString().slice(0, 10)
const monthOf = (date: string) => new Date(`${date.slice(0, 7)}-01T00:00:00Z`)
const shiftMonth = (date: Date, step: number) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + step, 1))
const longDate = (date: string) => `${Number(date.slice(8))} thg ${Number(date.slice(5, 7))} ${date.slice(0, 4)}`
const asset = (name: string) => <img src={`/assets/calendar-figma/${name}.svg`} alt="" />

export function ClientStayDatePicker(props: Props) {
  const [open, setOpen] = useState(false)
  const trigger = useRef<HTMLButtonElement>(null)
  const dialogId = useId()
  return <>
    {(['checkIn', 'checkOut'] as const).map(key => <button type="button" key={key} className="hotel-stay-date-trigger" aria-label={key === 'checkIn' ? 'Nhận phòng' : 'Trả phòng'} aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? dialogId : undefined} onClick={event => { trigger.current = event.currentTarget; setOpen(true) }}>
      <span>{key === 'checkIn' ? 'Nhận phòng' : 'Trả phòng'}</span><span>{displayStayDate(props[key])}</span>
    </button>)}
    {open && <StayDateDialog {...props} dialogId={dialogId} onClose={() => { setOpen(false); requestAnimationFrame(() => trigger.current?.focus({ preventScroll: true })) }} />}
  </>
}

function StayDateDialog({ checkIn: initialCheckIn, checkOut: initialCheckOut, today, onChange, onClose, dialogId }: Props & { dialogId: string; onClose: () => void }) {
  // Keep the visible selection immediate while the URL navigation commits its transition.
  const [{ checkIn, checkOut }, setDates] = useState({ checkIn: initialCheckIn, checkOut: initialCheckOut })
  const updateDates = (dates: StayDateRange) => { setDates(dates); onChange(dates) }
  const [selecting, setSelecting] = useState<'checkIn' | 'checkOut'>('checkIn')
  const [month, setMonth] = useState(() => monthOf(isStayDate(checkIn) && checkIn >= today ? checkIn : today))
  const calendar = useRef<HTMLDivElement>(null)
  const statusId = useId()
  const nights = stayNights(checkIn, checkOut)
  const complete = nights > 0 && nights <= 30
  const choose = (date: string) => {
    const next = selectStayDate({ checkIn, checkOut, selecting }, date, today)
    setSelecting(next.selecting)
    updateDates({ checkIn: next.checkIn, checkOut: next.checkOut })
  }
  const clear = () => { updateDates({ checkIn: '', checkOut: '' }); setSelecting('checkIn') }
  const keyDown = (event: KeyboardEvent<HTMLButtonElement>, date: string) => {
    const steps: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }
    const day = new Date(`${date}T00:00:00Z`)
    const step = steps[event.key]
    if (step == null && event.key !== 'Home' && event.key !== 'End') return
    event.preventDefault()
    const weekday = (day.getUTCDay() + 6) % 7
    day.setUTCDate(day.getUTCDate() + (step ?? (event.key === 'Home' ? -weekday : 6 - weekday)))
    const next = iso(day)
    if (next < today || (selecting === 'checkOut' && next > checkIn && stayNights(checkIn, next) > 30)) return
    const target = calendar.current?.querySelector<HTMLButtonElement>(`button[data-date="${next}"]`)
    if (target) target.focus()
    else {
      setMonth(monthOf(next))
      requestAnimationFrame(() => calendar.current?.querySelector<HTMLButtonElement>(`button[data-date="${next}"]`)?.focus())
    }
  }
  return <Modal open centered width={690} className="hotel-calendar-modal" aria-label="Chọn ngày lưu trú" title={null} footer={null} closable={false} onCancel={onClose} afterOpenChange={visible => { if (visible) (calendar.current?.querySelector<HTMLButtonElement>('button[aria-pressed="true"]:not(:disabled)') ?? calendar.current?.querySelector<HTMLButtonElement>('button[data-date]:not(:disabled)'))?.focus({ preventScroll: true }) }} styles={{ container: { padding: 0 }, mask: { background: 'rgba(0,0,0,0.1)', backdropFilter: 'blur(1px)' } }}>
    <section id={dialogId} className="hotel-calendar" role="region" aria-label="Chọn ngày lưu trú" aria-describedby={statusId} onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); onClose() } }}>
      <header className="hotel-calendar-header">
        <div className="hotel-calendar-heading"><h2>{complete ? `${nights} đêm` : 'Chọn ngày lưu trú'}</h2><p aria-live="polite" id={statusId}>{complete ? `${longDate(checkIn)} – ${longDate(checkOut)}` : selecting === 'checkOut' ? `${longDate(checkIn)} – Chọn ngày trả phòng` : 'Chọn ngày nhận phòng'}</p></div>
        <div className="hotel-calendar-inputs">{(['checkIn', 'checkOut'] as const).map(key => <div className="hotel-calendar-input" key={key}>
          <button type="button" className="hotel-calendar-field" aria-label={`Chọn lại ngày ${key === 'checkIn' ? 'nhận' : 'trả'} phòng`} onClick={() => setSelecting(key === 'checkOut' && isStayDate(checkIn) ? 'checkOut' : 'checkIn')}><span>{key === 'checkIn' ? 'Nhận phòng' : 'Trả phòng'}</span><strong>{displayStayDate(key === 'checkIn' ? checkIn : checkOut)}</strong></button>
          <button type="button" className="hotel-calendar-clear-one" aria-label={`Xóa ngày ${key === 'checkIn' ? 'nhận' : 'trả'} phòng`} disabled={!(key === 'checkIn' ? checkIn : checkOut)} onClick={() => { if (key === 'checkIn') clear(); else { updateDates({ checkIn, checkOut: '' }); setSelecting(checkIn ? 'checkOut' : 'checkIn') } }}>{asset('close')}</button>
        </div>)}</div>
      </header>
      <div className="hotel-calendar-months" ref={calendar}>
        {[month, shiftMonth(month, 1)].map(date => <section className="hotel-calendar-month" key={iso(date)} aria-label={`Tháng ${date.getUTCMonth() + 1} năm ${date.getUTCFullYear()}`}>
          <h3>Tháng {date.getUTCMonth() + 1} năm {date.getUTCFullYear()}</h3>
          <div className="hotel-calendar-weekdays" aria-hidden="true">{weekdays.map(day => <span key={day}>{day}</span>)}</div>
          <div className="hotel-calendar-days">{Array.from({ length: (date.getUTCDay() + 6) % 7 }, (_, i) => <span key={`empty-${i}`} />)}
            {Array.from({ length: new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate() }, (_, i) => {
              const value = iso(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), i + 1)))
              const start = value === checkIn, end = value === checkOut
              const between = complete && value > checkIn && value < checkOut
              const disabled = value < today || (selecting === 'checkOut' && value > checkIn && stayNights(checkIn, value) > 30)
              return <div key={value} className={`hotel-calendar-cell${start ? ' is-start' : end ? ' is-end' : between ? ' is-between' : ''}${complete ? ' has-range' : ''}`}><button type="button" data-date={value} aria-label={displayStayDate(value)} aria-pressed={start || end} aria-current={value === today ? 'date' : undefined} disabled={disabled} onClick={() => choose(value)} onKeyDown={event => keyDown(event, value)}>{i + 1}</button></div>
            })}
          </div>
        </section>)}
        <button type="button" className="hotel-calendar-previous" aria-label="Tháng trước" disabled={iso(month) <= today.slice(0, 7) + '-01'} onClick={() => setMonth(shiftMonth(month, -1))}>{asset('previous')}</button>
        <button type="button" className="hotel-calendar-next" aria-label="Tháng sau" onClick={() => setMonth(shiftMonth(month, 1))}>{asset('next')}</button>
      </div>
      <footer className="hotel-calendar-footer"><Popover trigger="click" content={<div className="hotel-calendar-help">Dùng phím mũi tên để di chuyển ngày. Home/End về đầu/cuối tuần. Enter hoặc phím cách để chọn. Escape để đóng lịch. Tối đa 30 đêm.</div>}><button type="button" className="hotel-calendar-keyboard" aria-label="Phím tắt lịch">{asset('keyboard')}</button></Popover><div><button type="button" className="hotel-calendar-clear" onClick={clear}>Xóa ngày</button><button type="button" className="hotel-calendar-close" onClick={onClose}>Đóng</button></div></footer>
    </section>
  </Modal>
}
