import { useState } from 'react'
import {
  BankOutlined,
  CompassOutlined,
  DollarOutlined,
  FileProtectOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import { Button, Space } from 'antd'
import { useNavigate } from 'react-router'
import { HealthSummary } from '@/features/system-status/components/HealthSummary'
import { RefreshSettings } from '@/features/system-status/components/RefreshSettings'
import { useBackendHealth } from '@/features/system-status/hooks/use-backend-health'
import { ErrorState } from '@/shared/ui/ErrorState'
import { PageLoading } from '@/shared/ui/PageLoading'

export function SystemStatusPage() {
  const navigate = useNavigate()
  const [refreshSeconds, setRefreshSeconds] = useState(0)
  const health = useBackendHealth(refreshSeconds)

  return (
    <div className="management-page rates-management-page">
      <header className="rates-page-header" aria-labelledby="status-page-title">
        <div className="rates-page-header__content">
          <span className="rates-page-header__kicker">
            <ThunderboltOutlined aria-hidden="true" /> GIÁM SÁT HỆ THỐNG TRỰC TIẾP
          </span>
          <h1 id="status-page-title" className="rates-page-header__title">
            Trạng thái Hoạt động Hệ thống
          </h1>
          <p className="rates-page-header__desc">
            Kiểm tra kết nối trực tiếp từ giao diện đến dịch vụ máy chủ và kiểm soát chu kỳ cập nhật.
          </p>
        </div>

        <div className="rates-page-header__actions">
          <Space wrap>
            <Button
              type="primary"
              icon={<CompassOutlined aria-hidden="true" />}
              onClick={() => void navigate('/')}
            >
              Trang chủ khám phá
            </Button>
            <Button
              icon={<BankOutlined aria-hidden="true" />}
              onClick={() => void navigate('/management/hotels')}
            >
              Quản trị khách sạn
            </Button>
            <Button
              icon={<DollarOutlined aria-hidden="true" />}
              onClick={() => void navigate('/management/rates')}
            >
              Bảng giá phòng
            </Button>
            <Button
              icon={<FileProtectOutlined aria-hidden="true" />}
              onClick={() => void navigate('/management/contracts')}
            >
              Hợp đồng
            </Button>
            <Button
              icon={<ReloadOutlined aria-hidden="true" />}
              loading={health.isFetching}
              onClick={() => void health.refetch()}
            >
              Kiểm tra lại
            </Button>
          </Space>
        </div>
      </header>

      <div className="status-layout">
        <div className="connection-panel">
          {health.isPending ? (
            <PageLoading />
          ) : health.isError ? (
            <div className="surface-card">
              <ErrorState
                error={health.error}
                retrying={health.isFetching}
                onRetry={() => void health.refetch()}
              />
            </div>
          ) : (
            <HealthSummary
              health={health.data}
              updatedAt={health.dataUpdatedAt}
              refreshSeconds={refreshSeconds}
            />
          )}
        </div>
        <RefreshSettings
          refreshSeconds={refreshSeconds}
          onApply={setRefreshSeconds}
        />
      </div>
    </div>
  )
}
