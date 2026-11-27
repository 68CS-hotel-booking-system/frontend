import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSessionIdentity } from '@/shared/hooks/use-session-identity'
import { getRefund, listRefunds, processRefund, type RefundParams, type RefundActionValues } from '../api/refund-api'

export function useRefunds(management: boolean, params: RefundParams) {
  const identity = useSessionIdentity()
  return useQuery({ queryKey: ['refunds', identity, management, 'list', params], queryFn: ({ signal }) => listRefunds(management, params, signal), enabled: Boolean(identity), retry: false })
}
export function useRefund(management: boolean, id: string) {
  const identity = useSessionIdentity()
  return useQuery({ queryKey: ['refunds', identity, management, 'detail', id], queryFn: ({ signal }) => getRefund(management, id, signal), enabled: Boolean(identity && id), retry: false, refetchOnWindowFocus: false, refetchOnReconnect: false })
}
export function useProcessRefund(id: string) {
  const identity = useSessionIdentity()
  const client = useQueryClient()
  return useMutation({ mutationFn: ({ values, version }: { values: RefundActionValues; version: number }) => processRefund(id, values, version), retry: false,
    onSuccess: async data => {
      client.setQueryData(['refunds', identity, true, 'detail', id], data)
      await Promise.all([client.invalidateQueries({ queryKey: ['refunds', identity, true, 'list'] }), client.invalidateQueries({ queryKey: ['finance-dashboard'] })])
    } })
}
