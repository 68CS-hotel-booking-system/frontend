import { z } from 'zod'
import { changePasswordRequestSchema } from '../api/auth-contracts'

export const accountPasswordSchema = changePasswordRequestSchema.extend({
  confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu mới.'),
}).refine(values => values.newPassword === values.confirmPassword, {
  path: ['confirmPassword'], message: 'Mật khẩu xác nhận không khớp.',
})

export type AccountPasswordValues = z.infer<typeof accountPasswordSchema>
