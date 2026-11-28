import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCurrentUser } from '@/features/auth'
import { useAbortableMutation } from '@/shared/hooks/use-abortable-mutation'
import {
  addMember,
  listMembers,
  listStaffHotels,
  updateMemberStatus,
  type AddMemberPayload,
  type UpdateMemberStatusPayload,
} from '../api/staff-api'

export function useStaffHotels(page: number) {
  const { currentUser } = useCurrentUser()
  return useQuery({
    queryKey: ['hotel-staff', currentUser?.id, 'hotels', page],
    queryFn: ({ signal }) => listStaffHotels(page, signal),
    enabled: Boolean(currentUser),
    retry: false,
  })
}

export function useHotelStaff(hotelId: string, page: number) {
  const cache = useQueryClient()
  const { currentUser } = useCurrentUser()

  const query = useQuery({
    queryKey: ['hotel-staff', currentUser?.id, hotelId, page],
    queryFn: ({ signal }) => listMembers(hotelId, page, signal),
    enabled: Boolean(hotelId && currentUser),
    retry: false,
  })

  const addMutation = useAbortableMutation(
    ['hotel-staff', 'add', hotelId],
    async (payload: AddMemberPayload, signal) => {
      const result = await addMember(hotelId, payload, signal)
      await cache.invalidateQueries({ queryKey: ['hotel-staff'] })
      return result
    },
  )

  const statusMutation = useAbortableMutation(
    ['hotel-staff', 'status', hotelId],
    async (
      args: { memberId: string } & UpdateMemberStatusPayload,
      signal,
    ) => {
      const result = await updateMemberStatus(
        hotelId,
        args.memberId,
        { status: args.status, expectedVersion: args.expectedVersion },
        signal,
      )
      await cache.invalidateQueries({ queryKey: ['hotel-staff'] })
      return result
    },
  )

  return { query, addMutation, statusMutation }
}
