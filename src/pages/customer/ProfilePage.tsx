import { useSearchParams } from 'react-router'
import { ProfileForm, useCurrentUser, sanitizeReturnTo } from '@/features/auth'
import { ErrorState } from '@/shared/ui/ErrorState'
import { PageLoading } from '@/shared/ui/PageLoading'
import { CustomerAccountLayout } from './CustomerAccountLayout'
import { AccountSecuritySettings } from './AccountSecuritySettings'

export function ProfilePage() {
  const { currentUser, isChecking, isError, error, refetch } = useCurrentUser()
  const [params] = useSearchParams()
  const isSecurity = params.get('section') === 'security'
  const returnTo = sanitizeReturnTo(params.get('returnTo'))
  const checkoutReturn = returnTo?.startsWith('/stays/') && returnTo.includes('/checkout?') ? returnTo : undefined
  return <CustomerAccountLayout section={isSecurity ? 'security' : 'profile'}
    title={isSecurity ? 'Đăng nhập & bảo mật' : 'Thông tin cá nhân'}
    description={isSecurity ? 'Quản lý mật khẩu, xác minh 2 bước và các thiết bị đang đăng nhập.' : 'Cập nhật thông tin để đặt phòng thuận tiện hơn.'}
    checkoutReturn={checkoutReturn}>
    {isChecking ? <PageLoading /> : isError ? <ErrorState error={error} onRetry={() => void refetch()} /> : currentUser ? (
      isSecurity ? <AccountSecuritySettings key={currentUser.id} /> : <ProfileForm key={currentUser.id} user={currentUser} />
    ) : <p role="status">Chưa có thông tin hồ sơ.</p>}
  </CustomerAccountLayout>
}
