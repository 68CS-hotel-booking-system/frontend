import type { ReactNode } from 'react'
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router'
import { Button, Result } from 'antd'
import { PageLoading } from '@/shared/ui/PageLoading'
import { ErrorState } from '@/shared/ui/ErrorState'
import { useSession } from '../hooks/use-session'
import { useCurrentUser } from '../hooks/use-current-user'

export function AdminRouteGuard({ children }: { children?: ReactNode }) {
  const session = useSession()
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser, isChecking, isError, error, isAdmin, refetch } = useCurrentUser()

  // 1. Chưa đăng nhập: mở cổng đăng nhập quản trị và giữ đường dẫn đang truy cập.
  if (!session) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location.pathname + location.search + location.hash }}
      />
    )
  }

  // 2. Đang kiểm tra tài khoản: hiển thị loading, chưa mount AdminLayout hoặc trang con
  if (isChecking) {
    return <PageLoading />
  }

  // 3. Lỗi mạng hoặc 5xx: hiển thị lỗi và nút thử lại, không cho vào admin và không xóa session
  if (isError) {
    return (
      <div className="m3-card max-w-lg mx-auto my-12 shadow-sm">
        <ErrorState error={error} onRetry={() => void refetch()} />
      </div>
    )
  }

  // 4. Đã đăng nhập nhưng không có role ADMIN: từ chối truy cập
  if (!isAdmin) {
    return (
      <div className="m3-card max-w-lg mx-auto my-12 shadow-sm" role="alert">
        <Result
          status="403"
          title="Bạn không có quyền truy cập"
          subTitle={`Tài khoản ${currentUser?.email ?? ''} không có quyền quản trị viên (ADMIN) để truy cập khu vực này.`}
          extra={
            <Button
              type="primary"
              className="!rounded-full !h-10 !px-6 font-semibold"
              onClick={() => void navigate('/', { replace: true })}
            >
              Về trang chủ
            </Button>
          }
        />
      </div>
    )
  }

  // 5. Đã xác minh có role ADMIN: cho phép truy cập
  return children ? <>{children}</> : <Outlet />
}

