import { useSearchParams } from 'react-router'
import { ProfileForm, AccountPasswordForm, useCurrentUser, sanitizeReturnTo } from '@/features/auth'
import { CustomerAccountLayout } from './CustomerAccountLayout'

export function ProfilePage() {
  const { currentUser } = useCurrentUser()
  const [params] = useSearchParams()
  const isSecurity = params.get('section') === 'security'
  const returnTo = sanitizeReturnTo(params.get('returnTo'))
  const checkoutReturn = returnTo?.startsWith('/stays/') && returnTo.includes('/checkout?') ? returnTo : undefined
  return <CustomerAccountLayout section={isSecurity ? 'security' : 'profile'}
    title={isSecurity ? 'Mật khẩu và bảo mật' : 'Thông tin cá nhân'}
    description={isSecurity ? 'Quản lý mật khẩu và bảo vệ quyền truy cập tài khoản.' : 'Cập nhật thông tin để đặt phòng thuận tiện hơn.'}
    mobileDescription={isSecurity ? 'Quản lý mật khẩu đăng nhập của bạn.' : 'Cập nhật thông tin cho lần đặt phòng tiếp theo.'}
    checkoutReturn={checkoutReturn}>
    {currentUser && (isSecurity ? <div className="account-security-layout">
      <AccountPasswordForm />
      <aside className="account-security-guidance"><h2>Bảo vệ tài khoản</h2><p>Dùng mật khẩu mạnh và riêng biệt để bảo vệ các thông tin đặt phòng của bạn.</p></aside>
    </div> : <ProfileForm key={currentUser.id} user={currentUser} />)}
  </CustomerAccountLayout>
}
