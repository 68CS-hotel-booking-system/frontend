import type { ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { App as AntApp, ConfigProvider } from 'antd'
import viVN from 'antd/locale/vi_VN'
import { DataModeProvider } from '@/shared/lib/data-mode'
import { queryClient } from '@/shared/lib/query-client'
import { AppErrorBoundary } from '@/shared/ui/AppErrorBoundary'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        token: {
          colorPrimary: '#A67C37',
          colorInfo: '#2C5E7A',
          colorSuccess: '#1E6B4E',
          colorWarning: '#B4690E',
          colorError: '#B93829',
          colorText: '#141413',
          colorTextSecondary: '#524E46',
          colorBgLayout: '#FAF8F5',
          colorBgContainer: '#FFFFFF',
          colorBorder: '#E6E1D6',
          borderRadius: 6,
          borderRadiusLG: 12,
          controlHeight: 40,
          fontFamily:
            "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        },
        components: {
          Button: {
            fontWeight: 600,
            primaryShadow: '0 2px 6px rgba(166, 124, 55, 0.18)',
          },
          Card: {
            colorBorderSecondary: '#E6E1D6',
          },
          Tabs: {
            inkBarColor: '#A67C37',
            itemSelectedColor: '#A67C37',
            itemHoverColor: '#8E6728',
          },
          Table: {
            headerBg: '#F3EFE6',
            headerColor: '#141413',
            borderColor: '#E6E1D6',
          },
        },
      }}
    >
      <AntApp>
        <AppErrorBoundary>
          <DataModeProvider>
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          </DataModeProvider>
        </AppErrorBoundary>
      </AntApp>
    </ConfigProvider>
  )
}
