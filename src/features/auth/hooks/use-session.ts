import { useSyncExternalStore } from 'react'
import { getAuthStatus, getRestoreError, getSession, subscribeSession } from '@/shared/api/session'
import { useSessionIdentity } from '@/shared/hooks/use-session-identity'
import { restoreSession } from '../model/session-manager'

export { useSessionIdentity }

export function useSession() {
  return useSyncExternalStore(subscribeSession, getSession, getSession)
}

export function useAuthStatus() {
  const status = useSyncExternalStore(subscribeSession, getAuthStatus, getAuthStatus)
  const error = useSyncExternalStore(subscribeSession, getRestoreError, getRestoreError)
  return { status, error, retry: restoreSession }
}
