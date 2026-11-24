import { Alert } from 'antd'

export function AdminBookingNotice() {
  return <Alert type="warning" showIcon title="Tài khoản quản trị không được đặt phòng"
    description="Vui lòng đăng xuất và sử dụng tài khoản khách hàng riêng để đặt phòng." />
}
