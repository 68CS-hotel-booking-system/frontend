import { useParams } from 'react-router'
import { ManagedComplaints, ManagedComplaintDetail } from '@/features/complaints'
export function ComplaintsPage() {
  const { complaintId } = useParams<{ complaintId: string }>()
  return complaintId ? <ManagedComplaintDetail key={complaintId} id={complaintId} /> : <ManagedComplaints />
}
