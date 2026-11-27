import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSessionIdentity } from '@/shared/hooks/use-session-identity'
import { createVoucher, listVouchers, toggleVoucher, type Voucher, type VoucherValues } from '../api/voucher-api'
export function useVouchers(hotelId: string, page: number) {
 const identity = useSessionIdentity()
 return useQuery({ queryKey: ['vouchers', identity, hotelId, page], queryFn: ({ signal }) => listVouchers(hotelId, page, signal), enabled: Boolean(identity && hotelId), retry: false })
}
export function useVoucherActions(hotelId: string) {
 const client = useQueryClient(), identity = useSessionIdentity()
 const refresh = () => client.invalidateQueries({ queryKey: ['vouchers', identity, hotelId] })
 const create = useMutation({ mutationFn: (v: VoucherValues) => createVoucher(hotelId, v), retry: false, onSuccess: refresh })
 const toggle = useMutation({ mutationFn: (v: Voucher) => toggleVoucher(hotelId, v), retry: false, onSuccess: refresh })
 return { create, toggle }
}
