import { useState } from 'react'
import { ReloadOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { HealthSummary } from '@/features/system-status/components/HealthSummary'
import { RefreshSettings } from '@/features/system-status/components/RefreshSettings'
import { useBackendHealth } from '@/features/system-status/hooks/use-backend-health'
import { ErrorState } from '@/shared/ui/ErrorState'
import { PageLoading } from '@/shared/ui/PageLoading'

export function SystemStatusPage() {
  const [refreshSeconds, setRefreshSeconds] = useState(0)
  const health = useBackendHealth(refreshSeconds)

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Trạng thái hệ thống</h1>
          <p>Kiểm tra kết nối từ giao diện đến dịch vụ backend.</p>
        </div>
        <Button
          icon={<ReloadOutlined aria-hidden="true" />}
          loading={health.isFetching}
          onClick={() => void health.refetch()}
        >
          Kiểm tra lại
        </Button>
      </div>
      <div className="status-layout">
        <div className="connection-panel">
          {health.isPending ? <PageLoading /> : health.isError ? (
            <ErrorState error={health.error} retrying={health.isFetching} onRetry={() => void health.refetch()} />
          ) : (
            <HealthSummary health={health.data} updatedAt={health.dataUpdatedAt} refreshSeconds={refreshSeconds} />
          )}
        </div>
        <RefreshSettings refreshSeconds={refreshSeconds} onApply={setRefreshSeconds} />
      </div>
    </>
  )
}
