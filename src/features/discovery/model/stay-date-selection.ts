export type StayDateRange = { checkIn: string; checkOut: string }
export type StayDateSelection = StayDateRange & { selecting: 'checkIn' | 'checkOut' }

export function isStayDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value
}

export function stayNights(checkIn: string, checkOut: string): number {
  return isStayDate(checkIn) && isStayDate(checkOut) ? (Date.parse(checkOut) - Date.parse(checkIn)) / 86400000 : 0
}

// Every opening starts a new check-in selection, even when a range already exists.
export function selectStayDate(state: StayDateSelection, date: string, today: string): StayDateSelection {
  if (!isStayDate(date) || date < today) return state
  if (state.selecting === 'checkIn' || !isStayDate(state.checkIn) || date <= state.checkIn) {
    return { checkIn: date, checkOut: '', selecting: 'checkOut' }
  }
  if (stayNights(state.checkIn, date) > 30) return state
  return { checkIn: state.checkIn, checkOut: date, selecting: 'checkIn' }
}

export function displayStayDate(date: string): string {
  return isStayDate(date) ? date.split('-').reverse().join('/') : 'Thêm ngày'
}
