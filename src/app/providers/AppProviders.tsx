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
          colorPrimary: '#ab2f0c',
          colorInfo: '#2f3038',
          colorSuccess: '#006947',
          colorWarning: '#b4690e',
          colorError: '#ba1a1a',
          colorText: '#1a1b22',
          colorTextSecondary: '#59413b',
          colorBgLayout: '#fbf8ff',
          colorBgContainer: '#ffffff',
          colorBorder: '#e3e1ec',
          borderRadius: 10,
          borderRadiusLG: 18,
          controlHeight: 40,
          fontFamily:
            "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        },
        components: {
          Button: {
            fontWeight: 600,
            primaryShadow: '0 2px 6px rgba(171, 47, 12, 0.2)',
          },
          Card: {
            colorBorderSecondary: '#eeedf7',
          },
          Tabs: {
            inkBarColor: '#ab2f0c',
            itemSelectedColor: '#ab2f0c',
            itemHoverColor: '#cd4723',
          },
          Table: {
            headerBg: '#f4f2fd',
            headerColor: '#59413b',
            borderColor: '#eeedf7',
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
