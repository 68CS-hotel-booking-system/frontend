import { useState } from 'react'
import { Popover } from 'antd'
import type { UseFormReturn } from 'react-hook-form'
import type { ListingStay } from '../model/client-listing-search'
import { ClientFigmaIcon } from './ClientFigmaIcon'

interface Props { form: UseFormReturn<ListingStay>; cities: { id: string; name: string }[]; onSubmit: (value: ListingStay) => void }
const dateLabel = (date: string) => date ? `${Number(date.slice(8))} thg ${Number(date.slice(5, 7))}` : 'Thêm ngày'

export function ClientListingSearchBar({ form, cities, onSubmit }: Props) {
  const [open, setOpen] = useState(false)
  const adults = form.watch('adults'), children = form.watch('children')
  const checkIn = form.watch('checkIn'), checkOut = form.watch('checkOut')
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date())
  const content = <div className="cf-guest-content" onKeyDown={e => { if (e.key === 'Escape') setOpen(false) }}>
    {(['adults', 'children'] as const).map(key => {
      const value = key === 'adults' ? adults : children, min = key === 'adults' ? 1 : 0
      const name = key === 'adults' ? 'người lớn' : 'trẻ em'
      return <div className="cf-guest-row" key={key}><div><strong>{key === 'adults' ? 'Người lớn' : 'Trẻ em'}</strong><small>{key === 'adults' ? 'Ít nhất 1 người lớn' : 'Đi cùng người lớn'}</small></div><div className="cf-stepper"><button type="button" aria-label={`Giảm số ${name}`} disabled={value <= min} onClick={() => form.setValue(key, value - 1, { shouldValidate: true })}>−</button><output aria-live="polite">{value}</output><button type="button" aria-label={`Tăng số ${name}`} disabled={adults + children >= 50} onClick={() => form.setValue(key, value + 1, { shouldValidate: true })}>+</button></div></div>
    })}<button type="button" className="cf-guest-done" onClick={() => setOpen(false)}>Xong</button>
  </div>
  return <section className="cf-search-section" aria-label="Tìm kiếm chỗ nghỉ"><form className="cf-search-bar" noValidate onSubmit={form.handleSubmit(onSubmit)}>
    <label className="cf-search-field cf-destination"><span>Điểm đến</span><select aria-label="Điểm đến" {...form.register('cityId')}><option value="">Tìm kiếm điểm đến</option>{cities.map(city => <option key={city.id} value={city.id}>{city.name}</option>)}</select></label>
    <label className="cf-search-field cf-date"><span>Nhận phòng</span><span className={checkIn ? 'cf-field-value' : 'cf-field-placeholder'}>{dateLabel(checkIn)}</span><input aria-label="Nhận phòng" type="date" min={today} {...form.register('checkIn')} /></label>
    <label className="cf-search-field cf-date"><span>Trả phòng</span><span className={checkOut ? 'cf-field-value' : 'cf-field-placeholder'}>{dateLabel(checkOut)}</span><input aria-label="Trả phòng" type="date" min={checkIn || today} {...form.register('checkOut')} /></label>
    <div className="cf-search-guests"><Popover content={content} trigger="click" open={open} onOpenChange={setOpen} placement="bottomRight" classNames={{ root: 'cf-guest-popover' }}><button type="button" className="cf-guest-trigger" aria-expanded={open}><span>Khách</span><span>{adults} người lớn{children > 0 ? `, ${children} trẻ em` : ''}</span></button></Popover><button type="submit" className="cf-search-submit" aria-label="Tìm kiếm chỗ nghỉ"><ClientFigmaIcon name="search" /></button></div>
  </form>{Object.values(form.formState.errors).length > 0 && <p role="alert" className="cf-search-error">{Object.values(form.formState.errors)[0]?.message}</p>}</section>
}
