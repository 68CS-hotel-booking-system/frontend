import { Navigate, Outlet, useLocation } from 'react-router'
import { PageLoading } from '@/shared/ui/PageLoading'
import { ErrorState } from '@/shared/ui/ErrorState'
import { useAuthStatus, useSession } from '../hooks/use-session'
import { useCurrentUser } from '../hooks/use-current-user'

export function AccountRouteGuard() {
  const session = useSession()
  const auth = useAuthStatus()
  const user = useCurrentUser()
  const location = useLocation()
  if (auth.status === 'restoring' || (session && user.isChecking)) return <PageLoading />
  if (auth.status === 'restore-error') return <ErrorState error={auth.error} onRetry={() => void auth.retry()} />
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  if (user.isError) return <ErrorState error={user.error} onRetry={() => void user.refetch()} />
  return <Outlet />
}
