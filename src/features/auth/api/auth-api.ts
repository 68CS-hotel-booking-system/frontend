import { z } from 'zod'
import { http } from '@/shared/api/http'
import {
  type ChangePasswordRequest,
  changePasswordResponseSchema,
  type CurrentUserResponse,
  currentUserResponseSchema,
  type ForgotPasswordRequest,
  forgotPasswordResponseSchema,
  type LoginRequest,
  type LoginResponse,
  loginResponseSchema,
  type RegisterRequest,
  type RegisterResponse,
  registerResponseSchema,
  type ResetPasswordRequest,
  resetPasswordResponseSchema,
  type VerifyEmailRequest,
  verifyEmailResponseSchema,
} from '../types/auth'

/**
 * POST /api/v1/auth/login — Đăng nhập hệ thống bằng email và mật khẩu
 */
export function loginApi(
  payload: LoginRequest,
  signal?: AbortSignal,
): Promise<LoginResponse> {
  return http.request('/auth/login', {
    method: 'POST',
    body: {
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
    },
    signal,
    schema: loginResponseSchema,
  })
}

/**
 * POST /api/v1/auth/register — Đăng ký tài khoản khách hàng mới
 */
export function registerApi(
  payload: RegisterRequest,
  signal?: AbortSignal,
): Promise<RegisterResponse> {
  return http.request('/auth/register', {
    method: 'POST',
    body: {
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
      fullName: payload.fullName.trim(),
      phone: payload.phone.trim(),
    },
    signal,
    schema: registerResponseSchema,
  })
}

/**
 * POST /api/v1/auth/refresh — Làm mới cặp token truy cập
 */
export function refreshTokenApi(
  refreshToken: string,
  signal?: AbortSignal,
): Promise<LoginResponse> {
  return http.request('/auth/refresh', {
    method: 'POST',
    body: { refreshToken },
    signal,
    schema: loginResponseSchema,
  })
}

/**
 * POST /api/v1/auth/logout — Thu hồi refresh token và chấm dứt phiên đăng nhập
 */
export function logoutApi(
  refreshToken: string,
  signal?: AbortSignal,
): Promise<void> {
  return http.request('/auth/logout', {
    method: 'POST',
    body: { refreshToken },
    signal,
    schema: z.unknown().transform(() => undefined),
  })
}

/**
 * POST /api/v1/auth/email-verifications — Xác minh tài khoản bằng email token
 */
export function verifyEmailApi(
  payload: VerifyEmailRequest,
  signal?: AbortSignal,
) {
  return http.request('/auth/email-verifications', {
    method: 'POST',
    body: { token: payload.token },
    signal,
    schema: verifyEmailResponseSchema,
  })
}

/**
 * POST /api/v1/auth/forgot-password — Yêu cầu link đặt lại mật khẩu qua email
 */
export function forgotPasswordApi(
  payload: ForgotPasswordRequest,
  signal?: AbortSignal,
) {
  return http.request('/auth/forgot-password', {
    method: 'POST',
    body: { email: payload.email.trim().toLowerCase() },
    signal,
    schema: forgotPasswordResponseSchema,
  })
}

/**
 * POST /api/v1/auth/reset-password — Đặt mật khẩu mới bằng token đã gửi qua mail
 */
export function resetPasswordApi(
  payload: ResetPasswordRequest,
  signal?: AbortSignal,
) {
  return http.request('/auth/reset-password', {
    method: 'POST',
    body: {
      token: payload.token,
      newPassword: payload.newPassword,
    },
    signal,
    schema: resetPasswordResponseSchema,
  })
}

/**
 * GET /api/v1/users/me — Lấy thông tin tài khoản hiện hành cùng danh sách vai trò
 */
export function getCurrentUserApi(
  signal?: AbortSignal,
): Promise<CurrentUserResponse> {
  return http.request('/users/me', {
    method: 'GET',
    signal,
    schema: currentUserResponseSchema,
  })
}

/**
 * POST /api/v1/users/me/password — Đổi mật khẩu tài khoản hiện tại
 */
export function changePasswordApi(
  payload: ChangePasswordRequest,
  signal?: AbortSignal,
) {
  return http.request('/users/me/password', {
    method: 'POST',
    body: payload,
    signal,
    schema: changePasswordResponseSchema,
  })
}
