import { createContext, useContext } from 'react'
import type { ManagementHotelDetail } from '../model/hotel'

export type CompletionResourceStates = Partial<Record<'photos' | 'amenities' | 'rooms' | 'pricing', 'loading' | 'error'>>

export interface HotelCompletionStatus {
  resourceStates?: CompletionResourceStates
  percent: number
  sections: {
    info: boolean
    photos: boolean
    amenities: boolean
    rooms: boolean
    pricing: boolean
    policies: boolean
    bookings: boolean
    reviews: boolean
  }
}

export interface HotelWorkspaceContextValue {
  hotel: ManagementHotelDetail | undefined
  hotelId: string
  isLoading: boolean
  isError: boolean
  error: unknown
  refetch: () => void
  completion: HotelCompletionStatus
  isDraft: boolean
  isActive: boolean
}

export const HotelWorkspaceContext = createContext<HotelWorkspaceContextValue | null>(null)

export function useHotelWorkspace(): HotelWorkspaceContextValue {
  const context = useContext(HotelWorkspaceContext)
  if (!context) {
    throw new Error('useHotelWorkspace must be used within a HotelWorkspaceProvider')
  }
  return context
}

export function calculateHotelCompletion(
  hotel?: Partial<ManagementHotelDetail> | null,
  resourceStates: CompletionResourceStates = {},
): HotelCompletionStatus {
  if (!hotel) {
    return {
      percent: 0,
      sections: {
        info: false,
        photos: false,
        amenities: false,
        rooms: false,
        pricing: false,
        policies: false,
        bookings: false,
        reviews: false,
      },
    }
  }

  const infoDone = Boolean(hotel.name && hotel.address && hotel.cityId && hotel.description)
  const photosDone = hotel.imageCount !== undefined ? hotel.imageCount > 0 : Boolean(hotel.coverImageUrl)
  const amenitiesDone = Boolean(hotel.amenityIds && hotel.amenityIds.length > 0)
  const roomsDone = Boolean(hotel.roomTypes && hotel.roomTypes.length > 0)
  const activeRoomTypes = hotel.roomTypes?.filter((room) => room.isActive) ?? []
  const pricingDone = activeRoomTypes.length > 0 && activeRoomTypes.every((room) => (room.basePrice ?? 0) > 0)
  const policiesDone = Boolean(hotel.checkInTime && hotel.checkOutTime)
  const bookingsDone = hotel.status === 'ACTIVE'
  const reviewsDone = hotel.status === 'ACTIVE'

  const sections = {
    info: infoDone,
    photos: photosDone && !resourceStates.photos,
    amenities: amenitiesDone && !resourceStates.amenities,
    rooms: roomsDone && !resourceStates.rooms,
    pricing: pricingDone && !resourceStates.pricing,
    policies: policiesDone,
    bookings: bookingsDone,
    reviews: reviewsDone,
  }
  const percent = (sections.info ? 25 : 0) + (sections.photos ? 20 : 0)
    + (sections.amenities ? 15 : 0) + (sections.rooms ? 20 : 0)
    + (sections.pricing ? 10 : 0) + (sections.policies ? 10 : 0)

  return { percent, sections, resourceStates }
}
