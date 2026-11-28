import { lazy, Suspense } from 'react'
import { PageLoading } from '@/shared/ui/PageLoading'

import { HotelSearchPage } from '@/pages/public/HotelSearchPage'

import { createBrowserRouter, createRoutesFromElements, Navigate, Route, RouterProvider, ScrollRestoration } from 'react-router'
import {
  BarChartOutlined,
} from '@ant-design/icons'
import { AppLayout } from '@/app/layouts/AppLayout'
import { ClientExperiences, ClientSavedStays, ClientTripServices } from '@/features/discovery'

import { AdminRouteGuard } from '@/features/auth'
import { AccountRouteGuard } from '@/features/auth'

import { NotFoundPage } from '@/pages/public/NotFoundPage'
import { StayVibeHomePage } from '@/pages/public/StayVibeHomePage'

const HotelReviewRequestPage = lazy(() => import('@/pages/management/HotelReviewRequestPage').then(module => ({ default: module.HotelReviewRequestPage })))
const SystemStatusPage = lazy(() => import('@/pages/public/SystemStatusPage').then(module => ({ default: module.SystemStatusPage })))
const FinanceDashboardPage = lazy(() => import('@/pages/management/FinanceDashboardPage').then(module => ({ default: module.FinanceDashboardPage })))
const HotelModulePage = lazy(() => import('@/pages/management/HotelModulePage').then(module => ({ default: module.HotelModulePage })))
const MyBookingsPage = lazy(() => import('@/pages/customer/MyBookingsPage').then(module => ({ default: module.MyBookingsPage })))
const AccountSavedStaysPage = lazy(() => import('@/pages/customer/AccountSavedStaysPage').then(module => ({ default: module.AccountSavedStaysPage })))
const MyComplaintsPage = lazy(() => import('@/pages/customer/MyComplaintsPage').then(module => ({ default: module.MyComplaintsPage })))
const MyRefundsPage = lazy(() => import('@/pages/customer/MyRefundsPage').then(module => ({ default: module.MyRefundsPage })))
const VouchersPage = lazy(() => import('@/pages/management/VouchersPage').then(module => ({ default: module.VouchersPage })))
const RefundsPage = lazy(() => import('@/pages/management/RefundsPage').then(module => ({ default: module.RefundsPage })))
const AdminLayout = lazy(() => import('@/app/layouts/AdminLayout').then(module => ({ default: module.AdminLayout })))
const HotelWorkspaceLayout = lazy(() => import('@/app/layouts/HotelWorkspaceLayout').then(module => ({ default: module.HotelWorkspaceLayout })))
const ProfilePage = lazy(() => import('@/pages/customer/ProfilePage').then(module => ({ default: module.ProfilePage })))
const PaymentReturnPage = lazy(() => import('@/pages/customer/PaymentReturnPage').then(module => ({ default: module.PaymentReturnPage })))
const HotelStaffPage = lazy(() => import('@/pages/management/HotelStaffPage').then(module => ({ default: module.HotelStaffPage })))
const LoginPage = lazy(() => import('@/pages/auth/LoginPage').then(module => ({ default: module.LoginPage })))
const AdminLoginPage = lazy(() => import('@/pages/auth/AdminLoginPage').then(module => ({ default: module.AdminLoginPage })))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage').then(module => ({ default: module.RegisterPage })))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage').then(module => ({ default: module.ForgotPasswordPage })))
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage').then(module => ({ default: module.ResetPasswordPage })))
const VerifyEmailPage = lazy(() => import('@/pages/auth/VerifyEmailPage').then(module => ({ default: module.VerifyEmailPage })))
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage').then(module => ({ default: module.AdminUsersPage })))
const ComplaintsPage = lazy(() => import('@/pages/management/ComplaintsPage').then(module => ({ default: module.ComplaintsPage })))
const CustomersPage = lazy(() => import('@/pages/management/CustomersPage').then(module => ({ default: module.CustomersPage })))
const AdminHotelReviewRequestsPage = lazy(() => import('@/pages/admin/AdminHotelReviewRequestsPage').then(module => ({ default: module.AdminHotelReviewRequestsPage })))
const HotelReviewRequestsPage = lazy(() => import('@/pages/management/hotels/HotelReviewRequestsPage').then(module => ({ default: module.HotelReviewRequestsPage })))
const HotelProfileEditGuard = lazy(() => import('@/pages/management/hotels/HotelProfileEditGuard').then(module => ({ default: module.HotelProfileEditGuard })))
const AdminOverviewPage = lazy(() => import('@/pages/admin/AdminOverviewPage').then(module => ({ default: module.AdminOverviewPage })))
const HotelManagementListPage = lazy(() => import('@/pages/management/HotelManagementListPage').then(module => ({ default: module.HotelManagementListPage })))
const ManagementPlaceholderPage = lazy(() => import('@/pages/management/ManagementPlaceholderPage').then(module => ({ default: module.ManagementPlaceholderPage })))
const HotelOverviewPage = lazy(() => import('@/pages/management/hotels').then(module => ({ default: module.HotelOverviewPage })))
const HotelInfoPage = lazy(() => import('@/pages/management/hotels').then(module => ({ default: module.HotelInfoPage })))
const HotelPhotosPage = lazy(() => import('@/pages/management/hotels').then(module => ({ default: module.HotelPhotosPage })))
const HotelAmenitiesPage = lazy(() => import('@/pages/management/hotels').then(module => ({ default: module.HotelAmenitiesPage })))
const HotelRoomsPage = lazy(() => import('@/pages/management/hotels').then(module => ({ default: module.HotelRoomsPage })))
const HotelRoomCreatePage = lazy(() => import('@/pages/management/hotels').then(module => ({ default: module.HotelRoomCreatePage })))
const HotelRoomAmenitiesPage = lazy(() => import('@/pages/management/hotels').then(module => ({ default: module.HotelRoomAmenitiesPage })))
const HotelPhysicalRoomAmenitiesPage = lazy(() => import('@/pages/management/hotels').then(module => ({ default: module.HotelPhysicalRoomAmenitiesPage })))
const HotelPricingPage = lazy(() => import('@/pages/management/hotels').then(module => ({ default: module.HotelPricingPage })))
const HotelPoliciesPage = lazy(() => import('@/pages/management/hotels').then(module => ({ default: module.HotelPoliciesPage })))
const HotelBookingsPage = lazy(() => import('@/pages/management/hotels').then(module => ({ default: module.HotelBookingsPage })))
const HotelReviewsPage = lazy(() => import('@/pages/management/hotels').then(module => ({ default: module.HotelReviewsPage })))
const HotelCreatePage = lazy(() => import('@/pages/management/hotels').then(module => ({ default: module.HotelCreatePage })))
const HotelDetailPage = lazy(() => import('@/pages/public/HotelDetailPage').then(module => ({ default: module.HotelDetailPage })))
const BookingCheckoutPage = lazy(() => import('@/pages/customer/BookingCheckoutPage').then(module => ({ default: module.BookingCheckoutPage })))
const BookingConfirmationPage = lazy(() => import('@/pages/customer/BookingConfirmationPage').then(module => ({ default: module.BookingConfirmationPage })))

const router = createBrowserRouter(createRoutesFromElements(<>
        <Route path="admin/login" element={<AdminLoginPage />} />
        <Route path="verify-email" element={<VerifyEmailPage />} />

        {/* Admin & Partner Dashboard Routes (Protected by AdminRouteGuard) */}
        <Route
          element={
            <AdminRouteGuard>
              <AdminLayout />
            </AdminRouteGuard>
          }
        >
          <Route path="admin" element={<Navigate to="/admin/overview" replace />} />
          <Route path="admin/overview" element={<AdminOverviewPage />} />
          <Route path="admin/hotel-review-requests" element={<AdminHotelReviewRequestsPage />} />
          <Route path="admin/users" element={<AdminUsersPage />} />
          <Route path="system-status" element={<SystemStatusPage />} />
          <Route path="hotel-review-requests/:requestId" element={<HotelReviewRequestPage />} />

          {/* CẤP 1: Danh sách Khách sạn & Thêm mới */}
          <Route path="hotels" element={<HotelManagementListPage />} />
          <Route path="hotels/new" element={<HotelCreatePage />} />

          {/* CẤP 2: Khách sạn Workspace (/hotels/:hotelId/*) */}
          <Route path="hotels/:hotelId" element={<HotelWorkspaceLayout />}>
            <Route index element={<HotelOverviewPage />} />
            <Route path="review-requests" element={<HotelReviewRequestsPage />} />
            <Route path="info" element={<HotelProfileEditGuard><HotelInfoPage /></HotelProfileEditGuard>} />
            <Route path="photos" element={<HotelProfileEditGuard><HotelPhotosPage /></HotelProfileEditGuard>} />
            <Route path="amenities" element={<HotelAmenitiesPage />} />
            <Route path="rooms" element={<HotelRoomsPage />} />
            <Route path="rooms/new" element={<HotelProfileEditGuard><HotelRoomCreatePage /></HotelProfileEditGuard>} />
            <Route path="rooms/:roomId" element={<HotelRoomsPage />} />
            <Route path="rooms/physical/:roomId/amenities" element={<HotelProfileEditGuard><HotelPhysicalRoomAmenitiesPage /></HotelProfileEditGuard>} />
            <Route path="rooms/amenities" element={<HotelProfileEditGuard><HotelRoomAmenitiesPage /></HotelProfileEditGuard>} />
            <Route path="pricing" element={<HotelProfileEditGuard operational><HotelPricingPage /></HotelProfileEditGuard>} />
            <Route path="policies" element={<HotelProfileEditGuard><HotelPoliciesPage /></HotelProfileEditGuard>} />
            <Route path="bookings" element={<HotelBookingsPage />} />
            <Route path="reviews" element={<HotelReviewsPage />} />
          </Route>

          {/* CẤP 1: Các phân hệ toàn hệ thống */}
          <Route path="bookings" element={<HotelModulePage module="bookings" />} />
          <Route path="staff" element={<HotelStaffPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="vouchers" element={<VouchersPage />} />
          <Route path="complaints" element={<ComplaintsPage />} />
          <Route path="complaints/:complaintId" element={<ComplaintsPage />} />
          <Route path="finance" element={<FinanceDashboardPage />} />
          <Route path="refunds" element={<RefundsPage />} />
          <Route
            path="reports"
            element={
              <ManagementPlaceholderPage
                kicker="BÁO CÁO & PHÂN TÍCH"
                title="Báo cáo Doanh thu & Vận hành"
                description="Thống kê hiệu suất kinh doanh, tỷ lệ lấp đầy phòng (ADR, RevPAR) và báo cáo tăng trưởng theo tháng."
                icon={<BarChartOutlined />}
              />
            }
          />
          <Route path="contracts" element={<HotelModulePage module="contracts" />} />

          {/* Redirects từ routes cũ */}
          <Route path="management/hotels" element={<Navigate to="/hotels" replace />} />
          <Route path="management/rates" element={<Navigate to="/hotels" replace />} />
          <Route path="management/bookings" element={<Navigate to="/bookings" replace />} />
          <Route path="management/customers" element={<Navigate to="/customers" replace />} />
          <Route path="management/vouchers" element={<Navigate to="/vouchers" replace />} />
          <Route path="management/complaints" element={<Navigate to="/complaints" replace />} />
          <Route path="management/finance" element={<Navigate to="/finance" replace />} />
          <Route path="management/reports" element={<Navigate to="/reports" replace />} />
          <Route path="management/contracts" element={<Navigate to="/contracts" replace />} />
        </Route>

        {/* Public / Customer Main Layout Routes */}
        <Route element={<><ScrollRestoration /><AppLayout /></>}>
          <Route element={<AccountRouteGuard />}>
            <Route path="stays/:hotelId/checkout" element={<BookingCheckoutPage />} />
            <Route path="stays/:hotelId/booking/:bookingId" element={<BookingConfirmationPage />} />
            <Route path="payment/return" element={<PaymentReturnPage />} />
            <Route path="account" element={<ProfilePage />} />
            <Route path="my-bookings" element={<MyBookingsPage />} />
            <Route path="account/saved-stays" element={<AccountSavedStaysPage />} />
            <Route path="my-complaints" element={<MyComplaintsPage />} />
            <Route path="my-refunds" element={<MyRefundsPage />} />
          </Route>
          <Route index element={<StayVibeHomePage />} />
          <Route path="explore" element={<HotelSearchPage />} />
          <Route path="experiences" element={<ClientExperiences />} />
          <Route path="services" element={<ClientTripServices />} />
          <Route path="saved-stays" element={<ClientSavedStays />} />
          <Route path="stays/:hotelId" element={<HotelDetailPage />} />
          <Route path="management/live" element={<Navigate to="/" replace />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
  </>))

export function AppRouter() {
  return <Suspense fallback={<PageLoading />}><RouterProvider router={router} /></Suspense>
}
