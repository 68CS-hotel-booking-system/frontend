import type { UseFormReturn } from 'react-hook-form'
import type { ListingStay } from '../model/client-listing-search'
import { ClientDestinationPicker } from './ClientDestinationPicker'
import { ClientReferenceIcon } from './ClientReferenceIcon'
import { ClientStayDatePicker } from './ClientStayDatePicker'
import { ClientGuestPicker } from './ClientGuestPicker'

interface Props { form: UseFormReturn<ListingStay>; cities: { id: string; name: string }[]; onSubmit: (value: ListingStay) => void }

export function ClientListingSearchBar({ form, cities, onSubmit }: Props) {
  const adults = form.watch('adults'), children = form.watch('children')
  const checkIn = form.watch('checkIn'), checkOut = form.watch('checkOut')
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date())
  return <section className="ref-search-section" aria-label="Tìm kiếm chỗ nghỉ"><div className="ref-wrap">
    <form className="ref-search-bar" role="search" noValidate onSubmit={form.handleSubmit(onSubmit)}>
      <div className="ref-seg"><ClientDestinationPicker value={form.watch('cityId')} cities={cities} onChange={id => form.setValue('cityId', id, { shouldDirty: true })} /></div>
      <div className="ref-seg"><ClientStayDatePicker variant="combined" checkIn={checkIn} checkOut={checkOut} today={today} onChange={dates => {
        form.setValue('checkIn', dates.checkIn, { shouldDirty: true })
        form.setValue('checkOut', dates.checkOut, { shouldDirty: true, shouldValidate: true })
      }} /></div>
      <div className="ref-seg"><ClientGuestPicker value={{ adults, children }} roomTypes={[]} selectedRoomId="" mode="search" variant="reference" label="Khách" onChange={value => {
        form.setValue('adults', value.adults, { shouldDirty: true })
        form.setValue('children', value.children, { shouldDirty: true, shouldValidate: true })
      }} /></div>
      <button type="submit" className="ref-search-go" aria-label="Tìm kiếm chỗ nghỉ"><ClientReferenceIcon name="search" /><span className="ref-go-label">Tìm kiếm</span></button>
    </form>
    {Object.values(form.formState.errors).length > 0 && <p role="alert" className="ref-search-error">{Object.values(form.formState.errors)[0]?.message}</p>}
  </div></section>
}
