import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { AppLayout } from '@/app/layouts/AppLayout'
import { AdminLayout } from '@/app/layouts/AdminLayout'
import { AdminRouteGuard } from '@/features/auth'
import { LoginPage } from '@/pages/auth/LoginPage'
import { AdminLoginPage } from '@/pages/auth/AdminLoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage'
import { VerifyEmailPage } from '@/pages/auth/VerifyEmailPage'
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage'
import { AdminOverviewPage } from '@/pages/admin/AdminOverviewPage'
import { FinancialAccessManagementPage } from '@/pages/management/FinancialAccessManagementPage'
import { HotelContractsManagementPage } from '@/pages/management/HotelContractsManagementPage'
import { HotelManagementDetailPage } from '@/pages/management/HotelManagementDetailPage'
import { HotelManagementListPage } from '@/pages/management/HotelManagementListPage'
import { HotelRatesManagementPage } from '@/pages/management/HotelRatesManagementPage'
import { NotFoundPage } from '@/pages/public/NotFoundPage'
import { StayVibeHomePage } from '@/pages/public/StayVibeHomePage'
import { SystemStatusPage } from '@/pages/public/SystemStatusPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="admin/login" element={<AdminLoginPage />} />
        {/* Admin Portal Layout Routes (Protected by AdminRouteGuard) */}
        <Route
          path="admin"
          element={
            <AdminRouteGuard>
              <AdminLayout />
            </AdminRouteGuard>
          }
        >
          <Route index element={<Navigate to="/admin/overview" replace />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="overview" element={<AdminOverviewPage />} />
        </Route>

        {/* Public / Partner Main Layout Routes */}
        <Route element={<AppLayout />}>
          <Route index element={<StayVibeHomePage />} />
          <Route path="explore" element={<StayVibeHomePage />} />
          <Route path="system-status" element={<SystemStatusPage />} />
          <Route path="management/hotels" element={<HotelManagementListPage />} />
          <Route
            path="management/hotels/:hotelId"
            element={<HotelManagementDetailPage />}
          />
          <Route path="management/rates" element={<HotelRatesManagementPage />} />
          <Route
            path="management/contracts"
            element={<HotelContractsManagementPage />}
          />
          <Route
            path="management/financial-access"
            element={<FinancialAccessManagementPage />}
          />
          <Route path="management/live" element={<Navigate to="/" replace />} />
          <Route path="verify-email" element={<VerifyEmailPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
