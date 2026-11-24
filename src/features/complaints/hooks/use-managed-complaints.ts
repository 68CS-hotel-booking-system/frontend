import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getManagedComplaint, handleComplaint, listManagedComplaints, type ComplaintParams, type HandlingValues } from '../api/management-complaint-api'
export const managedComplaintKeys = {
  lists: (actorId: string) => ['managed-complaints', actorId, 'list'] as const,
  list: (actorId: string, params: ComplaintParams) => ['managed-complaints', actorId, 'list', params] as const,
  detail: (actorId: string, id: string) => ['managed-complaints', actorId, 'detail', id] as const,
}
export function useManagedComplaints(actorId: string, params: ComplaintParams) {
  return useQuery({ queryKey: managedComplaintKeys.list(actorId, params), queryFn: ({ signal }) => listManagedComplaints(params, signal), enabled: Boolean(actorId), retry: false })
}
export function useManagedComplaint(actorId: string, id: string) {
  return useQuery({ queryKey: managedComplaintKeys.detail(actorId, id), queryFn: ({ signal }) => getManagedComplaint(id, signal), enabled: Boolean(actorId && id), retry: false, refetchOnReconnect: false })
}
export function useHandleComplaint(actorId: string, id: string) {
  const client = useQueryClient()
  return useMutation({ mutationFn: ({ values, version }: { values: HandlingValues; version: number }) => handleComplaint(id, values, version), retry: false,
    onSuccess: async data => {
      client.setQueryData(managedComplaintKeys.detail(actorId, id), data)
      await client.invalidateQueries({ queryKey: managedComplaintKeys.lists(actorId) })
      await client.invalidateQueries({ queryKey: ['complaints'] })
    },
  })
}
