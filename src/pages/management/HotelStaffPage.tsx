import { Link } from 'react-router'
import { CustomerAccountLayout } from '../customer/CustomerAccountLayout'

export function HotelStaffPage() {
  return <CustomerAccountLayout section="staff" title="Nhân sự khách sạn" description="Quản lý đội ngũ nhân sự tại khách sạn của bạn.">
    <section className="surface-card account-development" aria-labelledby="staff-development-title">
      <h2 id="staff-development-title">Đang phát triển</h2>
      <p>Tính năng quản lý nhân sự khách sạn đang được hoàn thiện. Vui lòng quay lại sau.</p>
      <Link to="/account">Về thông tin cá nhân</Link>
    </section>
  </CustomerAccountLayout>
}
