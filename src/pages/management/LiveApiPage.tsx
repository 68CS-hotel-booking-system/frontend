import { useEffect, useState, useSyncExternalStore } from 'react'
import { Alert, Select, Space, Tag } from 'antd'
import { Link } from 'react-router'
import { operations } from '@/features/live-api/api/operations'
import { OperationForm } from '@/features/live-api/components/OperationForm'
import { getSession, subscribeSession } from '@/shared/api/session'
export function LiveApiPage({
  initialOperation = 'login',
}: {
  initialOperation?: string
}) {
  const [selected, setSelected] = useState(initialOperation)
  const [token] = useState(() => new URLSearchParams(window.location.search).get('token') ?? '')
  useEffect(() => {
    const url = new URL(window.location.href)
    if (url.searchParams.has('token')) {
      url.searchParams.delete('token')
      window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash)
    }
  }, [])
  const session = useSyncExternalStore(subscribeSession, getSession)
  const operation = operations.find((o) => o.id === selected) ?? operations[0]
  return (
    <div
      className="management-page"
      style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 20px' }}
    >
      <h1>Kiểm thử nghiệp vụ</h1>
      <p>
        Thực hiện các chức năng đã có trên máy chủ: tài khoản, vai trò, khách
        sạn và phòng. Kết quả bên dưới là dữ liệu thật; thao tác tạo và cấp
        quyền sẽ được lưu.
      </p>
      <Space wrap style={{ marginBottom: 24 }}>
        <Tag color="green">API thật</Tag>
        <Tag>{session ? 'Đã đăng nhập' : 'Chưa đăng nhập'}</Tag>
        <Link to="/system-status">Trạng thái hệ thống</Link>
      </Space>
      <Alert
        type="info"
        showIcon
        title="Phiên đăng nhập chỉ giữ trong bộ nhớ của tab."
        description="Tải lại trang sẽ cần đăng nhập lại. Khi phiên hết hạn, chọn Làm mới phiên. Giá phòng, hợp đồng, tiện ích và tồn phòng chưa có trên bản backend develop này."
      />
      <label
        htmlFor="live-operation"
        style={{ display: 'block', marginTop: 24, marginBottom: 8 }}
      >
        Chức năng cần kiểm thử
      </label>
      <Select
        id="live-operation"
        style={{ width: '100%', maxWidth: 640 }}
        value={selected}
        onChange={setSelected}
        options={[...new Set(operations.map((o) => o.group))].map((group) => ({
          label: group,
          options: operations
            .filter((o) => o.group === group)
            .map((o) => ({ label: o.title, value: o.id })),
        }))}
      />
      <OperationForm key={operation.id} operation={operation} token={token} />
    </div>
  )
}
