import { ApiError } from '@/shared/api/api-error'
import { verifyEmail } from '../api/auth-api'

export type VerifyEmailStatus =
  | 'idle'
  | 'verifying'
  | 'success'
  | 'missing-token'
  | 'expired'
  | 'invalid'
  | 'already-used'
  | 'error'

export interface VerifyEmailResult {
  status: VerifyEmailStatus
  errorMessage: string | null
}

export function mapVerifyEmailError(err: unknown): VerifyEmailResult {
  if (err instanceof ApiError) {
    const code = err.code?.toUpperCase()
    if (code === 'TOKEN_EXPIRED') {
      return { status: 'expired', errorMessage: null }
    }
    if (code === 'TOKEN_INVALID') {
      return { status: 'invalid', errorMessage: null }
    }
    if (code === 'TOKEN_ALREADY_USED') {
      return { status: 'already-used', errorMessage: null }
    }
    return {
      status: 'error',
      errorMessage: err.message || 'Không thể hoàn tất xác minh. Vui lòng thử lại.',
    }
  }
  return {
    status: 'error',
    errorMessage: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra đường truyền và thử lại.',
  }
}

// In-memory registries for in-flight requests and successfully verified tokens
const inFlightRequests = new Map<string, Promise<{ accepted: boolean }>>()
const verifiedTokens = new Set<string>()

export function resetVerifyEmailRegistry() {
  inFlightRequests.clear()
  verifiedTokens.clear()
}

export function isTokenVerified(token: string): boolean {
  return verifiedTokens.has(token)
}

export function hasInFlightRequest(token: string): boolean {
  return inFlightRequests.has(token)
}

export function clearTokenVerification(token: string): void {
  inFlightRequests.delete(token)
}

export async function executeEmailVerification(
  token: string,
  onCallApi: (token: string) => Promise<{ accepted: boolean }> = (t) => verifyEmail({ token: t }),
): Promise<VerifyEmailResult> {
  if (!token || token.trim() === '') {
    return { status: 'missing-token', errorMessage: null }
  }

  if (verifiedTokens.has(token)) {
    return { status: 'success', errorMessage: null }
  }

  let promise = inFlightRequests.get(token)
  if (!promise) {
    promise = onCallApi(token)
    inFlightRequests.set(token, promise)
  }

  try {
    const res = await promise
    inFlightRequests.delete(token)
    if (res && res.accepted === true) {
      verifiedTokens.add(token)
      return { status: 'success', errorMessage: null }
    }
    return { status: 'error', errorMessage: 'Kết quả xác nhận không hợp lệ từ máy chủ.' }
  } catch (err) {
    inFlightRequests.delete(token)
    return mapVerifyEmailError(err)
  }
}
