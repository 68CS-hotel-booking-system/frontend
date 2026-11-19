import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getUserAvatar, uploadUserAvatar } from '../api/avatar-api'

const avatarKey = (userId: string) => ['auth', 'avatar', userId] as const

export function useUserAvatar(userId: string) {
  return useQuery({
    queryKey: avatarKey(userId),
    queryFn: ({ signal }) => getUserAvatar(signal),
    staleTime: 60_000,
    retry: false,
  })
}

export function useUploadUserAvatar(userId: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: uploadUserAvatar,
    onSuccess: async (avatar) => {
      const key = avatarKey(userId)
      await client.cancelQueries({ queryKey: key })
      client.setQueryData(key, avatar)
    },
  })
}
