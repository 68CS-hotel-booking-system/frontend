export interface GuestCapacity { id: string; name: string; maxAdults: number; maxChildren: number; maxOccupancy?: number }
export interface GuestSelection { adults: number; children: number }

export function canAccommodateGuests(rooms: GuestCapacity[], guests: GuestSelection) {
  return Number.isInteger(guests.adults) && guests.adults >= 1 && Number.isInteger(guests.children) && guests.children >= 0 &&
    rooms.some(room => guests.adults <= room.maxAdults && guests.children <= room.maxChildren &&
      (room.maxOccupancy === undefined || guests.adults + guests.children <= room.maxOccupancy))
}
