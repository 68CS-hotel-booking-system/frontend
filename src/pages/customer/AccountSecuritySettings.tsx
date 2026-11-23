import { AccountPasswordForm } from '@/features/auth'
import '@/shared/styles/customer-security.css'

export function AccountSecuritySettings() {
  return (
    <div className="customer-security">
      <AccountPasswordForm />
    </div>
  )
}
