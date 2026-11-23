import { useQueryClient } from '@tanstack/react-query'
import { getSession } from '@/shared/api/session'
import { useAbortableMutation } from '@/shared/hooks/use-abortable-mutation'
import { updateProfile } from '../api/auth-api'
import type { UpdateProfileRequest } from '../api/auth-contracts'

export function useProfileMutation() {
  const cache = useQueryClient()
  return useAbortableMutation(['auth', 'update-profile'], async (value: UpdateProfileRequest, signal) => {
    const actorToken = getSession()?.accessToken
    const saved = await updateProfile(value, signal)
    if (getSession()?.accessToken === actorToken) {
      cache.setQueriesData({ queryKey: ['auth', 'current-user', actorToken] }, saved)
    }
    return saved
  })
}
