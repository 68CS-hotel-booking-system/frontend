import { useCallback, useEffect, useSyncExternalStore } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { bookingKeys } from './use-bookings'

export function hasBookingHoldExpired(expiresAt: string | null | undefined) {
  return Date.parse(expiresAt ?? '') <= Date.now()
}

export function useBookingHoldExpired(expiresAt: string | null | undefined) {
  const client = useQueryClient()
  const subscribe = useCallback((notify: () => void) => {
    const remaining = Date.parse(expiresAt ?? '') - Date.now()
    if (!Number.isFinite(remaining) || remaining <= 0) return () => {}
    const timer = window.setTimeout(notify, Math.min(remaining, 2_147_483_647))
    return () => window.clearTimeout(timer)
  }, [expiresAt])
  const snapshot = () => hasBookingHoldExpired(expiresAt)
  const expired = useSyncExternalStore(subscribe, snapshot, snapshot)

  useEffect(() => {
    if (expired) void client.invalidateQueries({ queryKey: bookingKeys.all }, { cancelRefetch: false })
  }, [client, expired])

  return expired
}
