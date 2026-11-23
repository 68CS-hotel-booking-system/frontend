import { ClientSavedStays } from '@/features/discovery'
import { CustomerAccountLayout } from './CustomerAccountLayout'

export function AccountSavedStaysPage() {
  return <CustomerAccountLayout section="saved" title="Chỗ nghỉ đã lưu"
    description="Xem lại những chỗ nghỉ bạn đã lưu.">
    <ClientSavedStays inAccount />
  </CustomerAccountLayout>
}
