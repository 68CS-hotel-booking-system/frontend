import { z } from 'zod'

/** Thông tin người dùng cơ bản trả về từ LoginResult.UserInfo / RegisterResult */
export const authUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  fullName: z.string(),
  phone: z.string(),
  status: z.string(),
  emailVerified: z.boolean(),
  version: z.number().int().nonnegative(),
})
export type AuthUser = z.infer<typeof authUserSchema>

/** POST /api/v1/auth/login và POST /api/v1/auth/refresh response envelope data */
export const loginResponseSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  tokenType: z.string(),
  expiresAt: z.string(),
  user: authUserSchema.nullable().optional(),
})
export type LoginResponse = z.infer<typeof loginResponseSchema>

/** POST /api/v1/auth/register response envelope data */
export const registerResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  fullName: z.string(),
  phone: z.string(),
  status: z.string(),
  emailVerified: z.boolean(),
  version: z.number().int().nonnegative(),
})
export type RegisterResponse = z.infer<typeof registerResponseSchema>

/** GET /api/v1/users/me response envelope data */
export const currentUserResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  fullName: z.string(),
  phone: z.string(),
  status: z.string(),
  emailVerified: z.boolean(),
  roles: z.array(z.string()),
  version: z.number().int().nonnegative(),
})
export type CurrentUserResponse = z.infer<typeof currentUserResponseSchema>

/** POST /api/v1/auth/email-verifications response */
export const verifyEmailResponseSchema = z.object({
  accepted: z.boolean(),
})
export type VerifyEmailResponse = z.infer<typeof verifyEmailResponseSchema>

/** POST /api/v1/auth/forgot-password response */
export const forgotPasswordResponseSchema = z.object({
  accepted: z.boolean(),
})
export type ForgotPasswordResponse = z.infer<typeof forgotPasswordResponseSchema>

/** POST /api/v1/auth/reset-password response */
export const resetPasswordResponseSchema = z.object({
  reset: z.boolean(),
})
export type ResetPasswordResponse = z.infer<typeof resetPasswordResponseSchema>

/** POST /api/v1/users/me/password response */
export const changePasswordResponseSchema = z.object({
  changed: z.boolean(),
})
export type ChangePasswordResponse = z.infer<typeof changePasswordResponseSchema>

// ================= Form Values & Requests =================

export const loginRequestSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập địa chỉ email.')
    .email('Địa chỉ email không đúng định dạng.')
    .max(255, 'Email tối đa 255 ký tự.'),
  password: z
    .string()
    .min(1, 'Vui lòng nhập mật khẩu.')
    .max(128, 'Mật khẩu tối đa 128 ký tự.'),
})
export type LoginRequest = z.infer<typeof loginRequestSchema>

export const registerRequestSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập email.')
    .email('Địa chỉ email không đúng định dạng.')
    .max(255, 'Email tối đa 255 ký tự.'),
  password: z
    .string()
    .min(15, 'Mật khẩu phải từ 15 đến 128 ký tự theo chuẩn bảo mật.')
    .max(128, 'Mật khẩu tối đa 128 ký tự.'),
  fullName: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập họ và tên.')
    .max(100, 'Họ và tên tối đa 100 ký tự.'),
  phone: z
    .string()
    .trim()
    .min(8, 'Số điện thoại tối thiểu 8 chữ số.')
    .max(20, 'Số điện thoại tối đa 20 ký tự.'),
})
export type RegisterRequest = z.infer<typeof registerRequestSchema>

export const changePasswordRequestSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Mật khẩu hiện tại không được để trống.')
    .max(128),
  newPassword: z
    .string()
    .min(15, 'Mật khẩu mới phải từ 15 đến 128 ký tự.')
    .max(128),
})
export type ChangePasswordRequest = z.infer<typeof changePasswordRequestSchema>

export const forgotPasswordRequestSchema = z.object({
  email: z
    .string()
    .trim()
    .email('Địa chỉ email không đúng định dạng.')
    .max(255),
})
export type ForgotPasswordRequest = z.infer<typeof forgotPasswordRequestSchema>

export const resetPasswordRequestSchema = z.object({
  token: z.string().min(1, 'Token không được để trống.'),
  newPassword: z
    .string()
    .min(15, 'Mật khẩu mới phải từ 15 đến 128 ký tự.')
    .max(128),
})
export type ResetPasswordRequest = z.infer<typeof resetPasswordRequestSchema>

export const verifyEmailRequestSchema = z.object({
  token: z.string().min(1, 'Mã xác thực không được để trống.'),
})
export type VerifyEmailRequest = z.infer<typeof verifyEmailRequestSchema>
