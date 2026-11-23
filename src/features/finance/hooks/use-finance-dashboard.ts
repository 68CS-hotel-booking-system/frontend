import { useQuery } from '@tanstack/react-query'
import { useCurrentUser } from '@/features/auth'
import { getFinanceDashboard } from '../api/dashboard-api'

export function useFinanceDashboard() {
  const { currentUser, isAdmin, isOwner } = useCurrentUser()
  const canView = Boolean(currentUser && (isAdmin || isOwner))
  const query = useQuery({
    queryKey: ['finance-dashboard', currentUser?.id],
    queryFn: ({ signal }) => getFinanceDashboard(signal),
    enabled: canView, retry: false, staleTime: 30000, refetchInterval: 60000,
  })
  return { query, canView, isAdmin }
}
