import { useQuery } from '@tanstack/react-query'
import { useCurrentUser } from '@/features/auth'
import { getOperationsReport, type OperationsReportQuery } from '../api/reports-api'

export function useOperationsReport(params: OperationsReportQuery, validRange = true) {
  const { currentUser, isAdmin, isOwner } = useCurrentUser()
  const canView = Boolean(currentUser && (isAdmin || isOwner))
  const enabled = Boolean(canView && validRange && params.from && params.to)

  const query = useQuery({
    queryKey: [
      'operations-report',
      currentUser?.id,
      params.from,
      params.to,
      params.hotelId ?? 'all',
    ],
    queryFn: ({ signal }) => getOperationsReport(params, signal),
    enabled,
    retry: false,
  })

  return { query, isAdmin, canView }
}
