import { useQueryClient } from '@tanstack/react-query'
import { useAbortableMutation } from '@/shared/hooks/use-abortable-mutation'
import { updateProfile } from '../api/auth-api'
import type { UpdateProfileRequest } from '../api/auth-contracts'

export function useProfileMutation() {
  const cache = useQueryClient()
  return useAbortableMutation(['auth', 'update-profile'], async (value: UpdateProfileRequest, signal) => {
    const saved = await updateProfile(value, signal)
    cache.setQueriesData({ queryKey: ['auth', 'current-user'] }, saved)
    return saved
  })
}
