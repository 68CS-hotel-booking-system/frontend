import { Link } from 'react-router'
import { ProfileForm, AuthForm, useCurrentUser } from '@/features/auth'
import { PageHeader } from '@/shared/ui/PageHeader'
import '@/shared/styles/account.css'
export function ProfilePage() {
  const { currentUser } = useCurrentUser()
  return <div className="account-workspace">
    <PageHeader title="Tài khoản của tôi" description="Quản lý thông tin liên hệ và bảo vệ tài khoản."
      extra={<Link to="/staff">Nhân sự khách sạn</Link>} />
    {currentUser && <div className="account-columns">
      <ProfileForm key={currentUser.id} user={currentUser} />
      <section className="account-form" aria-label="Đổi mật khẩu">
        <AuthForm actionId="password" />
        <p>Sau khi đổi mật khẩu, bạn cần đăng nhập lại trên các thiết bị.</p>
      </section>
    </div>}
  </div>
}
