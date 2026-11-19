import { useId, useRef, useState } from 'react'
import { Popover } from 'antd'
import { ClientReferenceIcon } from './ClientReferenceIcon'

const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLocaleLowerCase('vi').trim()

export function ClientDestinationPicker({ value, cities, onChange }: {
  value: string; cities: { id: string; name: string }[]; onChange: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const input = useRef<HTMLInputElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const id = useId()
  const choices = cities.filter(city => normalize(city.name).includes(normalize(query)))
  const selected = cities.find(city => city.id === value)
  function choose(next: string) { onChange(next); setOpen(false); trigger.current?.focus() }
  const content = <div className="ref-theme ref-ui ref-pop ref-destination-pop" onKeyDown={event => {
    if (event.key === 'Escape') { event.stopPropagation(); setOpen(false); trigger.current?.focus() }
  }}>
    <p className="ref-pop-title" id={`${id}-title`}>Bạn muốn đi đâu?</p>
    <div className="ref-dest-field"><ClientReferenceIcon name="search" size={16} />
      <input ref={input} role="combobox" aria-labelledby={`${id}-title`} aria-autocomplete="list" aria-expanded={open}
        aria-controls={`${id}-list`} aria-activedescendant={choices[active] ? `${id}-${choices[active].id}` : undefined}
        placeholder="Tìm thành phố" autoComplete="off" value={query} onChange={event => { setQuery(event.target.value); setActive(0) }}
        onKeyDown={event => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            setActive(index => Math.max(0, Math.min(choices.length - 1, index + (event.key === 'ArrowDown' ? 1 : -1))))
          } else if (event.key === 'Enter') { event.preventDefault(); if (choices[active]) choose(choices[active].id) }
        }} />
    </div>
    <ul className="ref-suggest-list" id={`${id}-list`} role="listbox" aria-label="Thành phố">
      {choices.map((city, index) => <li key={city.id} role="presentation"><button type="button" id={`${id}-${city.id}`} role="option" aria-selected={value === city.id}
        className={`ref-suggest-item${index === active ? ' ref-suggest-active' : ''}`} onMouseEnter={() => setActive(index)} onClick={() => choose(city.id)}>
        <span className="ref-suggest-icon"><ClientReferenceIcon name="pin" /></span><span><strong>{city.name}</strong><small>Thành phố</small></span>
      </button></li>)}
    </ul>
    {!choices.length && <p className="ref-no-dest" role="status">Không tìm thấy thành phố phù hợp.</p>}
    {value && <button type="button" className="ref-btn ref-btn-quiet" onClick={() => choose('')}>Xóa điểm đến</button>}
  </div>
  return <Popover content={content} open={open} onOpenChange={visible => { setOpen(visible); if (visible) { setQuery(''); setActive(0) } }} trigger="click" arrow={false}
    placement="bottomLeft" afterOpenChange={visible => { if (visible) input.current?.focus({ preventScroll: true }) }}
    styles={{ container: { padding: 0, boxShadow: 'none', background: 'transparent' } }}>
    <button ref={trigger} type="button" className="ref-seg-btn" aria-label="Điểm đến" aria-expanded={open} aria-haspopup="listbox">
      <span className="ref-seg-label">Điểm đến</span><span className={`ref-seg-value${selected ? ' ref-is-set' : ''}`}>{selected?.name || 'Tìm kiếm điểm đến'}</span>
    </button>
  </Popover>
}
