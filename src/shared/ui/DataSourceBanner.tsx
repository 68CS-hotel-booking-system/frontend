import { ApiOutlined, DatabaseOutlined } from '@ant-design/icons'
import { Switch, Tag } from 'antd'
import { useDataMode } from '@/shared/lib/data-mode-context'

export function DataSourceBanner() {
  const { mode, setMode } = useDataMode()
  const isMock = mode === 'mock'

  return (
    <aside
      className="data-source-banner"
      role="region"
      aria-label="Trạng thái nguồn dữ liệu hiện tại"
    >
      <div className="data-source-banner__header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Tag
            color={isMock ? 'gold' : 'green'}
            icon={
              isMock ? (
                <DatabaseOutlined aria-hidden="true" />
              ) : (
                <ApiOutlined aria-hidden="true" />
              )
            }
          >
            {isMock ? 'CHẾ ĐỘ DỮ LIỆU MẪU' : 'DỮ LIỆU HỆ THỐNG THỰC TẾ'}
          </Tag>
          <span className="data-source-banner__note">
            {isMock
              ? 'Giao diện đang hiển thị bằng bộ dữ liệu mẫu nội bộ để minh họa trải nghiệm.'
              : 'Mọi thao tác tra cứu và cập nhật đang đồng bộ trực tiếp với máy chủ hệ thống.'}
          </span>
        </div>

        <label className="stayvibe-mode-pill">
          <Switch
            size="small"
            checked={!isMock}
            onChange={(checked) => setMode(checked ? 'api' : 'mock')}
            aria-label="Chuyển đổi nguồn dữ liệu"
          />
          <span>{isMock ? 'Kết nối máy chủ' : 'Dùng dữ liệu mẫu'}</span>
        </label>
      </div>
    </aside>
  )
}
