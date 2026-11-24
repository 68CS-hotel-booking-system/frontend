import { useQuery } from '@tanstack/react-query'
import { useSession } from '@/features/auth'
import { listAdminUsers } from '../api/users-api'
import { toAdminUser } from '../model/admin-user-mapping'
import { userKeys } from './user-query-keys'

const OWNER_LOOKUP_QUERY = { role: 'HOTEL_OWNER', page: 0, size: 100 } as const

/**
 * Tra cứu thông tin cơ bản của chủ sở hữu khách sạn từ API /admin/users theo ownerUserId.
 */
export function useHotelOwnerLookup(ownerUserId?: string, enabled = true) {
  const session = useSession()
  const active = Boolean(enabled && session?.accessToken)

  const query = useQuery({
    queryKey: userKeys.list(session?.accessToken, OWNER_LOOKUP_QUERY),
    queryFn: ({ signal }) => listAdminUsers(OWNER_LOOKUP_QUERY, signal),
    enabled: active,
    staleTime: 60_000,
    select: (data) => data.content.map(toAdminUser),
  })

  const owners = query.data ?? []
  const owner = ownerUserId ? owners.find((item) => item.id === ownerUserId) ?? null : null

  return {
    owner,
    owners,
    isPending: active && query.isPending,
    isError: active && query.isError,
  }
}
