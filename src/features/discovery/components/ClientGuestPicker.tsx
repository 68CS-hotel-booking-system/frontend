import { Fragment, useEffect, useId, useRef, useState } from 'react'
import { Button, Popover } from 'antd'
import { canAccommodateGuests, type GuestCapacity, type GuestSelection } from '../model/guest-capacity'
import '@/shared/styles/client-guest-picker.css'

const categories = [
  { key: 'adults', label: 'Người lớn', description: 'Từ 13 tuổi trở lên' },
  { key: 'children', label: 'Trẻ em', description: 'Độ tuổi 2 – 12' },
] as const

export function ClientGuestPicker({ value, roomTypes, selectedRoomId, onChange, label = 'Khách / phòng', showRoomCount = false, mode = 'capacity', variant = 'default', autoAdjustOverflow = mode === 'search' }: {
  value: GuestSelection; roomTypes: GuestCapacity[]; selectedRoomId: string; onChange: (value: GuestSelection) => void; label?: string; showRoomCount?: boolean; mode?: 'capacity' | 'search'; variant?: 'default' | 'reference'; autoAdjustOverflow?: boolean
}) {
  const [open, setOpen] = useState(false)
  const trigger = useRef<HTMLButtonElement>(null)
  const dialog = useRef<HTMLDivElement>(null)
  const [popupWidth, setPopupWidth] = useState(0)
  useEffect(() => {
    const node = trigger.current
    if (!node) return
    const observer = new ResizeObserver(() => setPopupWidth(node.getBoundingClientRect().width))
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  const close = () => { setOpen(false); trigger.current?.focus() }
  const id = useId()
  const selected = roomTypes.find(room => room.id === selectedRoomId)
  const candidates = selected ? [selected] : roomTypes
  const canSelect = (guests: GuestSelection) => mode === 'search'
    ? Number.isInteger(guests.adults) && Number.isInteger(guests.children) && guests.adults >= 1 && guests.children >= 0 && guests.adults + guests.children <= 50
    : canAccommodateGuests(candidates, guests)
  const supported = canSelect(value)
  const capacity = mode === 'search' ? 'Tìm chỗ nghỉ cho một phòng, tối đa 50 khách.' : selected
    ? selected.maxOccupancy !== undefined
      ? `Chỗ ở này cho phép tối đa ${selected.maxOccupancy} khách/phòng.`
      : `Tối đa ${selected.maxAdults} người lớn, ${selected.maxChildren} trẻ em/phòng.`
    : 'Số khách phải phù hợp với hạng phòng được chọn.'
  const content = <div className="client-guest-dropdown" ref={dialog} id={id} role="dialog" aria-label="Chọn số lượng khách" tabIndex={-1}
    onKeyDown={event => {
      if (event.key === 'Escape') { event.stopPropagation(); close() }
    }}>
    <div className="client-guest-scroll">
      <div className="client-guest-list">
        {categories.map(({ key, label: categoryLabel, description }, index) => {
          const count = value[key]
          const minimum = key === 'adults' ? 1 : 0
          const increment = { ...value, [key]: count + 1 }
          return <Fragment key={key}>
            {index > 0 && <hr />}
            <div className="client-guest-row">
              <div className="client-guest-copy">
                <strong>{categoryLabel}</strong>
                <small>{description}</small>
              </div>
              <div className="client-guest-stepper">
                <Button shape="circle" aria-label={`Giảm số ${categoryLabel.toLowerCase()}`} disabled={!Number.isInteger(count) || count <= minimum}
                  onClick={() => onChange({ ...value, [key]: count - 1 })}>
                  <img src="/assets/guest-picker-figma/minus.svg" alt="" aria-hidden="true" />
                </Button>
                <output aria-live="polite" aria-label={`Số ${categoryLabel.toLowerCase()}`}>{Number.isFinite(count) ? count : '—'}</output>
                <Button shape="circle" aria-label={`Tăng số ${categoryLabel.toLowerCase()}`} disabled={!canSelect(increment)}
                  onClick={() => onChange(increment)}>
                  <img src="/assets/guest-picker-figma/plus.svg" alt="" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </Fragment>
        })}
        <p className="client-guest-limit">{capacity}</p>
        {!supported && <p className="client-guest-error" role="alert">{candidates.length ? 'Số khách hiện tại vượt sức chứa. Vui lòng giảm số khách.' : 'Chưa có thông tin hạng phòng để chọn khách.'}</p>}
      </div>
    </div>
    <div className="client-guest-close"><Button type="text" onClick={close}>Đóng</Button></div>
  </div>
  return <div className="client-guest-field">
    <Popover content={content} trigger="click" placement="bottomRight" arrow={false} align={{ offset: [0, 0] }} autoAdjustOverflow={autoAdjustOverflow} open={open} onOpenChange={setOpen}
      afterOpenChange={isOpen => { if (isOpen) dialog.current?.focus({ preventScroll: true }) }}
      classNames={{ root: `client-guest-popover${variant === 'reference' ? ' ref-theme ref-ui ref-guest-overlay' : ''}` }} styles={{ root: { width: mode === 'search' ? Math.max(320, popupWidth) : popupWidth || undefined }, container: { padding: 0, background: 'transparent', boxShadow: 'none' } }}>
      <button ref={trigger} type="button" className={`client-guest-trigger ${open ? 'is-open' : ''}${variant === 'reference' ? ' ref-seg-btn' : ''}`} aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? id : undefined} onKeyDown={event => { if (event.key === 'Escape') close() }}>
        {variant === 'reference' ? <><span className="ref-seg-label">{label}</span><span className="ref-seg-value ref-is-set">{value.adults + value.children} khách</span></> : <><span><small>{label}</small><strong aria-live="polite" aria-atomic="true">{Number.isFinite(value.adults + value.children) ? value.adults + value.children : '—'} khách{showRoomCount ? ' · 1 phòng' : ''}</strong></span>
        <span className="client-guest-chevron" aria-hidden="true"><img src="/assets/guest-picker-figma/chevron-up.svg" alt="" /></span></>}
      </button>
    </Popover>
  </div>
}
