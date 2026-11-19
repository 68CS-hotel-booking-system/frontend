import { useEffect, useId, useRef, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { formatCurrencyAmount } from '@/shared/lib/format'
import { listingFilterDraftSchema, type ListingFilterDraft, type ListingFilters } from '../model/client-listing-search'
import { ClientReferenceIcon } from './ClientReferenceIcon'

export function ClientFilterDrawer({ initial, onApply, onClose }: {
  initial: ListingFilters; onApply: (value: ListingFilters) => void; onClose: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const close = useRef<HTMLButtonElement>(null)
  const backdropPress = useRef(false)
  const titleId = useId()
  const form = useForm<ListingFilterDraft, unknown, ListingFilters>({
    resolver: zodResolver(listingFilterDraftSchema),
    defaultValues: { ...initial, minPrice: initial.minPrice ?? '', maxPrice: initial.maxPrice ?? '' },
  })
  const [maximum, starRating] = useWatch({ control: form.control, name: ['maxPrice', 'starRating'] })
  const [rangeMax, setRangeMax] = useState(() => Math.max(2000000, initial.maxPrice ?? 0, initial.minPrice ?? 0))
  useEffect(() => {
    const panel = dialog.current
    if (!panel) return
    const previous = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    panel.showModal()
    close.current?.focus()
    document.body.style.overflow = 'hidden'
    return () => { panel.close(); document.body.style.overflow = overflow; if (previous?.isConnected) previous.focus({ preventScroll: true }) }
  }, [])
  return <dialog ref={dialog} className="ref-theme ref-ui ref-drawer ref-is-open ref-filter-dialog" aria-labelledby={titleId} aria-modal="true"
    onCancel={event => { event.preventDefault(); onClose() }}
    onPointerDown={event => {
      const r = event.currentTarget.getBoundingClientRect()
      backdropPress.current = event.target === event.currentTarget && (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom)
    }}
    onClick={event => {
      const startedOutside = backdropPress.current
      backdropPress.current = false
      if (!startedOutside || event.target !== event.currentTarget) return
      const r = event.currentTarget.getBoundingClientRect()
      if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) onClose()
    }}
    onKeyDown={event => {
      if (event.key !== 'Tab') return
      const elements = [...event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), input, summary')].filter(el => el.getClientRects().length)
      const first = elements[0], last = elements[elements.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }}>
    <div className="ref-drawer-head"><h2 className="ref-drawer-title" id={titleId}>Bộ lọc</h2><button ref={close} className="ref-icon-btn" type="button" aria-label="Đóng bộ lọc" onClick={onClose}><ClientReferenceIcon name="close" size={16} /></button></div>
    <form className="ref-filter-form" noValidate onSubmit={form.handleSubmit(onApply)}>
      <div className="ref-drawer-body">
        <section className="ref-filter-group"><h3>Giá mỗi đêm</h3><div className="ref-price-output"><span>{maximum === '' ? 'Không giới hạn' : `Tối đa ${formatCurrencyAmount(maximum, 'VND')}`}</span></div>
          <input type="range" min={0} max={rangeMax} step={50000} value={maximum === '' ? rangeMax : maximum} aria-label="Giá tối đa mỗi đêm"
            onChange={event => form.setValue('maxPrice', Number(event.target.value), { shouldDirty: true, shouldValidate: true })} />
          <details className="ref-price-details"><summary>Nhập khoảng giá</summary><div className="ref-date-grid">
            {(['minPrice', 'maxPrice'] as const).map(key => <label className="ref-field" key={key}>{key === 'minPrice' ? 'Giá tối thiểu' : 'Giá tối đa'}
              <Controller name={key} control={form.control} render={({ field }) => <input
                ref={field.ref} name={field.name} onBlur={field.onBlur} type="number" min="0" placeholder="Không giới hạn"
                value={field.value ?? ''} onChange={event => {
                  const value = event.target.value === '' ? '' : Number(event.target.value)
                  field.onChange(value)
                  setRangeMax(current => Math.max(current, value === '' ? 0 : value))
                }}
              />} />
            </label>)}
          </div></details>
          {(form.formState.errors.minPrice || form.formState.errors.maxPrice) && <p role="alert" className="ref-search-error">{form.formState.errors.minPrice?.message || form.formState.errors.maxPrice?.message}</p>}
        </section>
        <section className="ref-filter-group"><h3>Tiêu chuẩn sao</h3><p className="ref-filter-note">Hạng sao của khách sạn.</p><div className="ref-radio-list">
          {[undefined, 1, 2, 3, 4, 5].map(value => <label key={value ?? 'all'} className={`ref-radio-pill${starRating === value ? ' ref-is-active' : ''}`}>
            <input type="radio" name="starRating" checked={starRating === value} onChange={() => form.setValue('starRating', value, { shouldDirty: true })} />{value === undefined ? 'Tất cả' : `${value} sao+`}
          </label>)}
        </div></section>
      </div>
      <div className="ref-drawer-foot"><button className="ref-btn ref-btn-quiet" type="button" onClick={() => form.reset({ sort: initial.sort, minPrice: '', maxPrice: '', starRating: undefined })}>Xóa tất cả</button><button className="ref-btn ref-btn-secondary" type="submit">Áp dụng bộ lọc</button></div>
    </form>
  </dialog>
}
