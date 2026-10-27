import { BrowserRouter, Route, Routes } from 'react-router'
import { AppLayout } from '@/app/layouts/AppLayout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { NotFoundPage } from '@/pages/public/NotFoundPage'
import { SystemStatusPage } from '@/pages/public/SystemStatusPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<SystemStatusPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
