import { z } from 'zod'

export const contractStatusValues = ['DRAFT', 'ACTIVE', 'EXPIRED', 'TERMINATED'] as const
export const contractStatusSchema = z.enum(contractStatusValues)
export type ContractStatus = z.infer<typeof contractStatusSchema>

/** FN01: GET /api/v1/finance/hotels/{hotelId}/contracts */
export const hotelCommissionContractSchema = z.object({
  id: z.string().min(1),
  hotelId: z.string().min(1),
  contractCode: z.string().min(1),
  commissionPercentage: z.number().min(0).max(100),
  currency: z.string().length(3),
  effectiveFrom: z.string().min(1),
  effectiveTo: z.string().nullable(),
  status: contractStatusSchema,
  termsSummary: z.string().nullable(),
  createdByUserId: z.string().optional(),
  createdAt: z.string(),
})
export type HotelCommissionContract = z.infer<typeof hotelCommissionContractSchema>

const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/

/** FN02: POST /api/v1/admin/hotels/{hotelId}/contracts — Tạo dự thảo hợp đồng hoa hồng */
export const createHotelContractFormSchema = z
  .object({
    contractCode: z
      .string()
      .trim()
      .min(4, 'Mã hợp đồng cần ít nhất 4 ký tự.')
      .max(50, 'Mã hợp đồng tối đa 50 ký tự.')
      .regex(/^[A-Z0-9-]+$/, 'Mã hợp đồng chỉ gồm chữ in hoa, số và dấu gạch ngang.'),
    commissionPercentage: z
      .number({ error: 'Nhập tỷ lệ hoa hồng hợp lệ.' })
      .min(1, 'Tỷ lệ hoa hồng từ 1% đến 50%.')
      .max(50, 'Tỷ lệ hoa hồng từ 1% đến 50%.'),
    currency: z.string().trim().length(3, 'Mã tiền tệ gồm 3 ký tự (ví dụ VND).'),
    effectiveFrom: z
      .string()
      .regex(isoDateRegex, 'Ngày bắt đầu theo định dạng YYYY-MM-DD.'),
    effectiveTo: z
      .string()
      .regex(isoDateRegex, 'Ngày kết thúc theo định dạng YYYY-MM-DD.'),
    termsSummary: z
      .string()
      .trim()
      .min(10, 'Tóm tắt điều khoản cần ít nhất 10 ký tự.')
      .max(1000, 'Tóm tắt điều khoản tối đa 1000 ký tự.'),
  })
  .refine((values) => values.effectiveFrom <= values.effectiveTo, {
    path: ['effectiveTo'],
    message: 'Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu hiệu lực.',
  })

export type CreateHotelContractFormValues = z.infer<typeof createHotelContractFormSchema>

