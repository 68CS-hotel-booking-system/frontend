import { z } from 'zod'
import { http } from '@/shared/api/http'

const metricsFields = {
  availableRoomNights: z.number().int().nonnegative(),
  soldRoomNights: z.number().int().nonnegative(),
  roomRevenue: z.number().int().nonnegative(),
  occupancyRate: z.number().min(0).nullable(),
  adr: z.number().int().nonnegative().nullable(),
  revpar: z.number().int().nonnegative().nullable(),
  completedRevenue: z.number().int().nonnegative(),
  newBookings: z.number().int().nonnegative(),
  cancelledBookings: z.number().int().nonnegative(),
  noShowBookings: z.number().int().nonnegative(),
}

export const reportTotalsSchema = z.object(metricsFields)
export type ReportTotals = z.infer<typeof reportTotalsSchema>

export const reportMonthRowSchema = z.object({
  month: z.string(),
  ...metricsFields,
})
export type ReportMonthRow = z.infer<typeof reportMonthRowSchema>

export const reportHotelRowSchema = z.object({
  hotelId: z.string().uuid(),
  hotelName: z.string(),
  availableRoomNights: z.number().int().nonnegative(),
  soldRoomNights: z.number().int().nonnegative(),
  roomRevenue: z.number().int().nonnegative(),
  occupancyRate: z.number().min(0).nullable(),
  adr: z.number().int().nonnegative().nullable(),
  revpar: z.number().int().nonnegative().nullable(),
  completedRevenue: z.number().int().nonnegative(),
})
export type ReportHotelRow = z.infer<typeof reportHotelRowSchema>

export const reportScopeHotelSchema = z.object({
  hotelId: z.string().uuid(),
  hotelName: z.string(),
})
export type ReportScopeHotel = z.infer<typeof reportScopeHotelSchema>

export const operationsReportSchema = z.object({
  from: z.string(),
  to: z.string(),
  hotelId: z.string().uuid().nullable(),
  currency: z.string(),
  totals: reportTotalsSchema,
  months: z.array(reportMonthRowSchema),
  hotels: z.array(reportHotelRowSchema),
  scopeHotels: z.array(reportScopeHotelSchema),
})
export type OperationsReportData = z.infer<typeof operationsReportSchema>

export interface OperationsReportQuery {
  from: string
  to: string
  hotelId?: string
}

export function getOperationsReport(
  params: OperationsReportQuery,
  signal?: AbortSignal,
): Promise<OperationsReportData> {
  const search = new URLSearchParams({
    from: params.from,
    to: params.to,
  })
  if (params.hotelId) {
    search.set('hotelId', params.hotelId)
  }
  return http.request(`/management/reports/operations?${search.toString()}`, {
    signal,
    schema: operationsReportSchema,
  })
}
