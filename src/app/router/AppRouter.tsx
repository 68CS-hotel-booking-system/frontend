import { BrowserRouter, Route, Routes } from 'react-router'
import { AppLayout } from '@/app/layouts/AppLayout'
import { LoginPage } from '@/pages/auth/LoginPage'
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
          <Route path="login" element={<LoginPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
