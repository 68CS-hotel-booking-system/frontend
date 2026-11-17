import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router'

export function CustomerPage({ title, description, children, extra }: { title: string; description: string; children: ReactNode; extra?: ReactNode }) {
  return <div className="customer-page">
    <Link className="customer-back" to="/">← Khám phá khách sạn</Link>
    <header className="customer-page-heading"><div><p className="customer-kicker">Không gian cá nhân</p><h1>{title}</h1><p>{description}</p></div>{extra}</header>
    <nav className="customer-tabs" aria-label="Điều hướng tài khoản">
      <NavLink to="/my-bookings">Đặt phòng của tôi</NavLink>
      <NavLink to="/my-complaints">Khiếu nại của tôi</NavLink>
      <NavLink to="/account">Tài khoản của tôi</NavLink>
    </nav>
    <div className="customer-page-content">{children}</div>
  </div>
}
