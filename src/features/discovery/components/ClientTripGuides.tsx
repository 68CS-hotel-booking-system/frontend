import { Link } from 'react-router'
import { useCitiesQuery } from '@/features/hotels'
import { ClientReferenceIcon } from './ClientReferenceIcon'

export function ClientExperiences() {
  const cities = useCitiesQuery()
  return <div className="ref-ui">
    <div className="ref-wrap stayhub-guide">
      <header className="stayhub-guide-heading">
        <h1>Khám phá điểm đến</h1>
        <p>Chọn một thành phố để xem chỗ nghỉ, tiện ích và các hạng phòng đang mở bán.</p>
      </header>
      <div className="stayhub-guide-split">
        <img className="stayhub-guide-photo" src="/assets/resort-warm.jpg" alt="" width="1600" height="2133" />
        <section aria-labelledby="stayhub-city-title">
          <h2 id="stayhub-city-title">Bạn muốn đi đâu?</h2>
          {cities.isPending && <p role="status">Đang tải điểm đến…</p>}
          {cities.isError && <div role="alert">
            <p>Chưa tải được danh sách thành phố.</p>
            <button type="button" className="ref-btn ref-btn-secondary" onClick={() => void cities.refetch()}>Thử lại</button>
          </div>}
          {cities.data?.length === 0 && <p>Chưa có điểm đến để chọn.</p>}
          {Boolean(cities.data?.length) && <ul className="stayhub-guide-list">
            {cities.data?.map(city => <li key={city.id}>
              <Link to={`/explore?cityId=${encodeURIComponent(city.id)}#stays`} viewTransition>
                <ClientReferenceIcon name="pin" /><span>{city.name}</span><span aria-hidden="true">→</span>
              </Link>
            </li>)}
          </ul>}
          <Link className="stayhub-inline-link" to="/explore" viewTransition>Tìm tất cả chỗ nghỉ <span aria-hidden="true">→</span></Link>
        </section>
      </div>
    </div>
  </div>
}

const tripServices = [
  { title: 'Chọn chỗ nghỉ', detail: 'Chọn ngày lưu trú và số khách để xem phòng còn trống cùng giá cho kỳ nghỉ.', to: '/explore', action: 'Tìm chỗ nghỉ' },
  { title: 'Theo dõi đặt phòng', detail: 'Mở đơn để xem trạng thái, hạn thanh toán và tiếp tục thanh toán VNPAY khi đơn đang chờ.', to: '/my-bookings', action: 'Xem đơn đặt phòng' },
  { title: 'Cập nhật thông tin liên hệ', detail: 'Kiểm tra số điện thoại và thông tin tài khoản trước khi xác nhận đơn.', to: '/account', action: 'Mở tài khoản' },
  { title: 'Hỗ trợ về đơn đặt phòng', detail: 'Mở chi tiết đơn để gửi khiếu nại hoặc xem tiến độ xử lý yêu cầu đã gửi.', to: '/my-complaints', action: 'Xem khiếu nại' },
]

export function ClientTripServices() {
  return <div className="ref-ui">
    <div className="ref-wrap stayhub-guide">
      <header className="stayhub-guide-heading">
        <h1>Dịch vụ chuyến đi</h1>
        <p>Tìm phòng, theo dõi thanh toán và quản lý đơn đặt phòng của bạn.</p>
      </header>
      <ul className="stayhub-service-list">
        {tripServices.map(({ title, detail, to, action }) => <li key={to}>
          <div><h2>{title}</h2><p>{detail}</p></div>
          <Link to={to} viewTransition className="stayhub-inline-link">{action} <span aria-hidden="true">→</span></Link>
        </li>)}
      </ul>
    </div>
  </div>
}
