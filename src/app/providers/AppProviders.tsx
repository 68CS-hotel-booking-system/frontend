import type { ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { App as AntApp, ConfigProvider } from 'antd'
import viVN from 'antd/locale/vi_VN'
import { queryClient } from '@/shared/lib/query-client'
import { AppErrorBoundary } from '@/shared/ui/AppErrorBoundary'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        token: {
          colorPrimary: '#245c4f',
          colorInfo: '#245c4f',
          colorText: '#24313a',
          colorBgLayout: '#f4f6f5',
          borderRadius: 8,
          controlHeight: 40,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        },
      }}
    >
      <AntApp>
        <AppErrorBoundary>
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </AppErrorBoundary>
      </AntApp>
    </ConfigProvider>
  )
}
