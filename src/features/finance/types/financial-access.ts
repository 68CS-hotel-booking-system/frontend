import { z } from 'zod'

export const financialAccessStatusValues = ['GRANTED', 'REVOKED'] as const
export const financialAccessStatusSchema = z.enum(financialAccessStatusValues)
export type FinancialAccessStatus = z.infer<typeof financialAccessStatusSchema>

/** FN16: GET /api/v1/admin/hotels/{hotelId}/financial-access/{userId} */
export const financialAccessGrantSchema = z.object({
  hotelId: z.string().min(1),
  userId: z.string().min(1),
  userFullName: z.string().optional(),
  userEmail: z.string().optional(),
  contractId: z.string().min(1),
  contractCode: z.string().optional(),
  status: financialAccessStatusSchema,
  canReadContracts: z.boolean(),
  canReadSettlements: z.boolean(),
  canExportReports: z.boolean(),
  version: z.number().int().min(0),
  previousVersionSummary: z.string().nullable().optional(),
  updatedAt: z.string(),
  reason: z.string().nullable().optional(),
})
export type FinancialAccessGrant = z.infer<typeof financialAccessGrantSchema>

/** FN00: PUT /api/v1/admin/hotels/{hotelId}/financial-access/{userId} */
export const updateFinancialAccessFormSchema = z.object({
  contractId: z.string().min(1, 'Vui lòng chọn thỏa thuận/hợp đồng liên kết.'),
  status: financialAccessStatusSchema,
  canReadContracts: z.boolean(),
  canReadSettlements: z.boolean(),
  canExportReports: z.boolean(),
  expectedVersion: z
    .number({ error: 'Phiên bản đối chiếu không hợp lệ.' })
    .int()
    .min(0),
  reason: z
    .string()
    .trim()
    .min(5, 'Nhập lý do cấp/thu hồi quyền (ít nhất 5 ký tự).')
    .max(255, 'Lý do tối đa 255 ký tự.'),
})
export type UpdateFinancialAccessFormValues = z.infer<
  typeof updateFinancialAccessFormSchema
>

