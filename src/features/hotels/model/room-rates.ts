import { z } from 'zod'

const dateRangeSchema = z.object({ startDate: z.iso.date(), endDate: z.iso.date() })

export const roomRatesRangeSchema = dateRangeSchema.refine(
  ({ startDate, endDate }) => endDate >= startDate &&
    (Date.parse(endDate) - Date.parse(startDate)) / 86400000 <= 90,
  'Chọn khoảng ngày hợp lệ, tối đa 90 ngày.',
)

export const setRoomRatesFormSchema = dateRangeSchema.extend({
  amount: z.number().int().positive('Giá phòng phải lớn hơn 0.').safe(),
}).refine(({ startDate, endDate }) => endDate >= startDate &&
  (Date.parse(endDate) - Date.parse(startDate)) / 86400000 <= 365,
  'Chọn khoảng ngày hợp lệ, tối đa 365 ngày.',
)

export type SetRoomRatesFormValues = z.infer<typeof setRoomRatesFormSchema>

/** GET includes its end date; PUT excludes it. */
export function exclusiveRateEndDate(endDate: string): string {
  z.iso.date().parse(endDate)
  const date = new Date(`${endDate}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + 1)
  return date.toISOString().slice(0, 10)
}

/** Ngày nghiệp vụ Việt Nam, không phụ thuộc múi giờ máy người dùng. */
export function localRateDate(): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date())
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value
  return `${part('year')}-${part('month')}-${part('day')}`
}

export function rateRangeEnd(startDate: string, days: number): string {
  const date = new Date(`${startDate}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days - 1)
  return date.toISOString().slice(0, 10)
}
