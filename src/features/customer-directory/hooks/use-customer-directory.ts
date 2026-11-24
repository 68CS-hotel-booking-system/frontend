import { useQuery } from '@tanstack/react-query'
import { getCustomers, type CustomerParams, type CustomerScope } from '../api/customer-directory-api'

export const customerDirectoryKey = (actorId: string, scope: CustomerScope, params: CustomerParams) => ['customer-directory', actorId, scope, params] as const
export function useCustomerDirectory(actorId: string, scope: CustomerScope, params: CustomerParams) {
  return useQuery({ queryKey: customerDirectoryKey(actorId, scope, params),
    queryFn: ({ signal }) => getCustomers(scope, params, signal), enabled: Boolean(actorId), retry: false })
}
