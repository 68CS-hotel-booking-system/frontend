import { useSyncExternalStore } from 'react'
import { getSessionIdentity, subscribeSession } from '@/shared/api/session'

export function useSessionIdentity() {
  return useSyncExternalStore(subscribeSession, getSessionIdentity, getSessionIdentity)
}
