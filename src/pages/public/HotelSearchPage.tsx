import { HotelSearchResults } from '@/features/discovery'
import { useLocation } from 'react-router'
export function HotelSearchPage() {
  const { search } = useLocation()
  return <HotelSearchResults key={search} />
}
