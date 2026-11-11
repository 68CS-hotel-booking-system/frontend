import { useQuery } from '@tanstack/react-query'
import { useCurrentUser } from '@/features/auth'
import { getPayment } from '../api/payment-api'

export function usePayment(paymentId: string | null) {
  const { currentUser } = useCurrentUser()
  return useQuery({
    queryKey: ['payment', currentUser?.id, paymentId],
    queryFn: ({ signal }) => getPayment(paymentId!, signal),
    enabled: Boolean(paymentId && currentUser),
    staleTime: 0,
    retry: false,
    refetchInterval: (query) => query.state.data?.status === 'PENDING'
      && query.state.dataUpdateCount < 20 && !query.state.error ? 5000 : false,
  })
}
