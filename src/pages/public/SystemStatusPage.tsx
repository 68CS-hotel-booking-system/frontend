import { useState } from 'react'
import { Button } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import { HealthSummary, RefreshSettings, useBackendHealth } from '@/features/system-status'
import { PageHeader } from '@/shared/ui/PageHeader'
import { ErrorState } from '@/shared/ui/ErrorState'
import { PageLoading } from '@/shared/ui/PageLoading'

export function SystemStatusPage() {
  const [seconds, setSeconds] = useState(0)
  const query = useBackendHealth(seconds)
  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <PageHeader
        kicker="GIÁM SÁT HỆ THỐNG"
        title="Trạng thái hệ thống"
        description="Tình trạng kết nối hiện tại của dịch vụ đặt phòng."
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={() => void query.refetch()}
            loading={query.isFetching}
          >
            Kiểm tra lại
          </Button>
        }
      />
      <RefreshSettings refreshSeconds={seconds} onApply={setSeconds} />
      {query.isPending ? (
        <PageLoading />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
      ) : (
        <HealthSummary
          health={query.data}
          updatedAt={query.dataUpdatedAt}
          refreshSeconds={seconds}
        />
      )}
    </div>
  )
}
