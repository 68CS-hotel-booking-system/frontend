import { useQuery } from '@tanstack/react-query'
import { getMyWorkplaces, type WorkplaceRole } from '../api/workplaces-api'
import { useCurrentUser } from './use-current-user'

export function useWorkplaces() {
  const { currentUser, isAdmin, isOwner } = useCurrentUser()
  const enabled = Boolean(currentUser && !isAdmin && !isOwner)

  const query = useQuery({
    queryKey: ['auth', 'workplaces', currentUser?.id],
    queryFn: ({ signal }) => getMyWorkplaces(signal),
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })

  const workplaces = enabled ? (query.data ?? []) : []
  const staffRoles: WorkplaceRole[] = Array.from(new Set(workplaces.map((w) => w.memberRole)))
  const isStaff = workplaces.length > 0
  const isManager = staffRoles.includes('HOTEL_MANAGER')
  const isChecking =
    enabled && (query.isLoading || (query.isPending && query.fetchStatus !== 'idle'))

  return {
    ...query,
    workplaces,
    staffRoles,
    isStaff,
    isManager,
    isChecking,
  }
}
