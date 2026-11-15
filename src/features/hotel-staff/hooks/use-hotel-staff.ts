import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCurrentUser } from '@/features/auth'
import { useAbortableMutation } from '@/shared/hooks/use-abortable-mutation'
import { listStaffHotels, listMembers, saveMember, type Assignment } from '../api/staff-api'
export function useStaffHotels(page: number) {
  const { currentUser } = useCurrentUser()
  return useQuery({
    queryKey: ['hotel-staff', currentUser?.id, 'hotels', page],
    queryFn: ({ signal }) => listStaffHotels(page, signal), enabled: Boolean(currentUser), retry: false,
  })
}
export function useHotelStaff(hotelId: string, page: number) {
  const cache = useQueryClient()
  const { currentUser } = useCurrentUser()
  const query = useQuery({
    queryKey: ['hotel-staff', currentUser?.id, hotelId, page],
    queryFn: ({ signal }) => listMembers(hotelId, page, signal),
    enabled: Boolean(hotelId && currentUser), retry: false,
  })
  const mutation = useAbortableMutation(['hotel-staff', 'save', hotelId], async (assignment: Assignment, signal) => {
    const result = await saveMember(hotelId, assignment, signal)
    await cache.invalidateQueries({ queryKey: ['hotel-staff'] })
    return result
  })
  return { query, mutation }
}
