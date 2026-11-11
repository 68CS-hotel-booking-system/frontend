import { useParams } from 'react-router'
import { HotelReviewDetail } from '@/features/hotels'

export function HotelReviewRequestPage() {
  const { requestId = '' } = useParams<{ requestId: string }>()
  return <HotelReviewDetail key={requestId} requestId={requestId} />
}
