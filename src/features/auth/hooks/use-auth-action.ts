import { getSession, setSession } from '@/shared/api/session'
import { ApiError } from '@/shared/api/api-error'
import { queryClient } from '@/shared/lib/query-client'
import { useAbortableMutation } from '@/shared/hooks/use-abortable-mutation'
import * as authApi from '../api/auth-api'
import {
  changePasswordRequestSchema, forgotPasswordRequestSchema, loginRequestSchema,
  loginResponseSchema, registerRequestSchema, resetPasswordRequestSchema, verifyEmailRequestSchema,
} from '../api/auth-contracts'
import type { AuthActionId } from '../model/auth-actions'

function requireRefreshToken() {
  const token = getSession()?.refreshToken
  if (!token) throw new ApiError('Bạn cần đăng nhập để tiếp tục.', { kind: 'http', status: 401, code: 'AUTH_REQUIRED' })
  return token
}

/** One session transition path used by auth screens and API diagnostics. */
export async function runAuthAction(id: AuthActionId, values: Record<string, string>, signal?: AbortSignal) {
  let result: unknown
  switch (id) {
    case 'login':
      result = await authApi.login(loginRequestSchema.parse(values), signal)
      break
    case 'register':
      result = await authApi.register(registerRequestSchema.parse(values), signal)
      break
    case 'email-verifications':
      result = await authApi.verifyEmail(verifyEmailRequestSchema.parse(values), signal)
      break
    case 'forgot-password':
      result = await authApi.forgotPassword(forgotPasswordRequestSchema.parse(values), signal)
      break
    case 'reset-password':
      result = await authApi.resetPassword(resetPasswordRequestSchema.parse(values), signal)
      break
    case 'refresh':
      result = await authApi.refreshSession(requireRefreshToken(), signal)
      break
    case 'logout':
      result = await authApi.logout(requireRefreshToken(), signal)
      break
    case 'me':
      result = await authApi.getCurrentUser(signal)
      break
    case 'password':
      result = await authApi.changePassword(changePasswordRequestSchema.parse(values), signal)
      break
  }
  if (id === 'login' || id === 'refresh') {
    const session = loginResponseSchema.parse(result)
    queryClient.clear()
    setSession(session)
    return { user: session.user, expiresAt: session.expiresAt }
  }
  if (id === 'logout' || id === 'password' || id === 'reset-password') {
    setSession(null)
    queryClient.clear()
  }
  return result
}

export function useAuthAction(id: AuthActionId) {
  return useAbortableMutation(['auth', id], (values: Record<string, string>, signal) => runAuthAction(id, values, signal))
}
