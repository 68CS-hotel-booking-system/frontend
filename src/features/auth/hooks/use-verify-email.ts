import { useCallback, useEffect, useState } from 'react'
import {
  clearTokenVerification,
  executeEmailVerification,
  isTokenVerified,
  type VerifyEmailStatus,
} from '../model/verify-email-state'
import { useAuthLinkToken } from './use-auth-link-token'

export type { VerifyEmailStatus }

export interface VerifyEmailState {
  status: VerifyEmailStatus
  errorMessage: string | null
  isVerifying: boolean
  retry: () => void
}

export function useVerifyEmail(overrideToken?: string): VerifyEmailState {
  const linkToken = useAuthLinkToken()
  const token = overrideToken !== undefined ? overrideToken : linkToken

  const [status, setStatus] = useState<VerifyEmailStatus>(() => {
    if (!token) return 'missing-token'
    if (isTokenVerified(token)) return 'success'
    return 'verifying'
  })
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    if (isTokenVerified(token)) return

    let active = true
    void executeEmailVerification(token).then((result) => {
      if (!active) return
      setStatus(result.status)
      setErrorMessage(result.errorMessage)
    })

    return () => {
      active = false
    }
  }, [token])

  const retry = useCallback(() => {
    if (!token) return
    clearTokenVerification(token)
    setStatus('verifying')
    setErrorMessage(null)
    void executeEmailVerification(token).then((result) => {
      setStatus(result.status)
      setErrorMessage(result.errorMessage)
    })
  }, [token])

  return {
    status,
    errorMessage,
    isVerifying: status === 'verifying',
    retry,
  }
}
